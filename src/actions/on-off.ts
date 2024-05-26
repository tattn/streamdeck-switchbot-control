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
import { isStatusPower } from "../libs/switchbot-status";
import { GlobalSettings } from "../types/types";

const logger = streamDeck.logger.createScope("on-off");

@action({ UUID: "dev.tattn.streamdeck.switchbot-control.onoff" })
export class OnOffAction extends SingletonAction {
  switchbot?: Switchbot;

  async onWillAppear(ev: WillAppearEvent<OnOffSettings>): Promise<void> {
    await this.configure(ev.action, ev.payload.settings.deviceId);
  }

  async onPropertyInspectorDidAppear?(
    ev: PropertyInspectorDidAppearEvent<GlobalSettings>
  ): Promise<void> {
    if (!this.switchbot) {
      return;
    }

    const res = await this.switchbot.getDeviceIDs();
    const settings = await ev.action.getSettings();
    ev.action.sendToPropertyInspector({
      event: "setDeviceList",
      payload: {
        devices: res.body.deviceList,
        settings: settings,
      },
    });
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
    if (!this.switchbot || !deviceId) {
      return;
    }

    await this.switchbot.commandDevice(
      deviceId,
      ev.payload.state === 1 ? "turnOff" : "turnOn"
    );
  }

  async configure(action: Action<object>, deviceId?: string) {
    const settings =
      await streamDeck.settings.getGlobalSettings<GlobalSettings>();
    this.switchbot = new Switchbot(settings.token, settings.secretKey);

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
      await action.setState(isOn ? 1 : 0);
      await action.setTitle(isOn ? "ON" : "OFF");
    } else {
      await action.setTitle("?");
    }
  }
}

type OnOffSettings = {
  deviceId?: string;
};
