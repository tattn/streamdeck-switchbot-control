import streamDeck, {
  Action,
  action,
  DidReceiveSettingsEvent,
  KeyDownEvent,
  PropertyInspectorDidAppearEvent,
  SendToPluginEvent,
  SingletonAction,
  WillAppearEvent,
} from "@elgato/streamdeck";
import { Switchbot } from "../libs/switchbot";
import { isStatusCurtain, isStatusPower } from "../libs/switchbot-status";
import { GlobalSettings } from "../types/types";
import { wait } from "../libs/util";

const logger = streamDeck.logger.createScope("on-off");

@action({ UUID: "dev.tattn.streamdeck.switchbot-control.onoff" })
export class OnOffAction extends SingletonAction {
  switchbot?: Switchbot;

  async onWillAppear(ev: WillAppearEvent<OnOffSettings>): Promise<void> {
    await this.configure(ev.action, ev.payload.settings.deviceId);
  }

  async onPropertyInspectorDidAppear?(
    ev: PropertyInspectorDidAppearEvent<OnOffSettings>
  ): Promise<void> {
    if (!this.switchbot) {
      return;
    }

    const settings = await ev.action.getSettings();

    ev.action.sendToPropertyInspector({
      event: "onAppear",
      payload: { deviceId: settings.deviceId, deviceList: settings.deviceList },
    });

    const deviceList = (await this.switchbot.getDeviceIDs()).body.deviceList;
    ev.action.sendToPropertyInspector({
      event: "setDeviceList",
      payload: { deviceId: settings.deviceId, deviceList },
    });
    await ev.action.setSettings({ ...settings, deviceList });
  }

  async onSendToPlugin?(
    ev: SendToPluginEvent<object, OnOffSettings>
  ): Promise<void> {
    await this.configure(ev.action, (await ev.action.getSettings()).deviceId);
  }

  async onDidReceiveSettings?(
    ev: DidReceiveSettingsEvent<OnOffSettings>
  ): Promise<void> {
    await this.configure(ev.action, ev.payload.settings.deviceId);
  }

  async onKeyDown(ev: KeyDownEvent<OnOffSettings>) {
    const deviceId = ev.payload.settings.deviceId;
    if (!deviceId) {
      return;
    }

    await this.switchbot?.commandDevice(
      deviceId,
      ev.payload.state === 1 ? "turnOff" : "turnOn"
    );

    await this.setState(ev.action, ev.payload.state === 0);
    await wait(10000); // wait to update the status
    await this.updateState(ev.action, deviceId);
  }

  async configure(action: Action<object>, deviceId?: string) {
    const globalSettings =
      await streamDeck.settings.getGlobalSettings<GlobalSettings>();
    this.switchbot = new Switchbot(
      globalSettings.token,
      globalSettings.secretKey
    );

    await this.updateState(action, deviceId);
  }

  async updateState(action: Action<object>, deviceId?: string) {
    if (!this.switchbot) {
      logger.error("token is not found");
      await action.setTitle("Error");
      return;
    }

    if (!deviceId) {
      logger.error("deviceId is not found");
      await action.setTitle("Error");
      return;
    }

    const status = await this.switchbot.getDeviceStatus(deviceId);
    if (isStatusPower(status.body)) {
      const isOn = status.body.power === "on";
      await this.setState(action, isOn);
    } else if (isStatusCurtain(status.body)) {
      if (!status.body.moving) {
        const isOn = status.body.slidePosition < 50;
        await this.setState(action, isOn);
      } else {
        // wait to check the status again
        await wait(2000);
        await this.updateState(action, deviceId);
      }
    } else {
      await action.setTitle("?");
    }
  }

  async setState(action: Action<object>, state: boolean) {
    await action.setState(state ? 1 : 0);
    // await action.setTitle(state ? "ON" : "OFF");
    await action.setTitle("");
  }
}

type OnOffSettings = {
  deviceId?: string;
  deviceList?: DevicesDevice[];
};
