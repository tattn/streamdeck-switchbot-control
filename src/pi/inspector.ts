export let ws: WebSocket | null = null;
let uuid = "";
let action = "";

const tokenField = document.querySelector<HTMLInputElement>("#token")!;
const secretKeyField = document.querySelector<HTMLInputElement>("#secret-key")!;
const deviceListSelect =
  document.querySelector<HTMLInputElement>("#device-list")!;

const connectElgatoStreamDeckSocket = (
  inPort: number,
  inPluginUUID: string,
  inRegisterEvent: any,
  inInfo: any,
  inActionInfo: string
) => {
  const actionInfo = JSON.parse(inActionInfo);
  console.log(JSON.stringify(actionInfo));
  uuid = inPluginUUID;
  action = actionInfo.action;

  let settings = actionInfo.payload.settings;
  deviceListSelect.value = settings.deviceId ?? "";

  ws = new WebSocket(`ws://127.0.0.1:${inPort}`);
  ws.addEventListener("open", () => {
    console.log({
      event: inRegisterEvent,
      uuid: inPluginUUID,
    });
    if (ws == null) return;
    ws.send(
      JSON.stringify({
        event: inRegisterEvent,
        uuid: inPluginUUID,
      })
    );
    ws.send(
      JSON.stringify({
        event: "getGlobalSettings",
        context: uuid,
      })
    );
  });

  ws.addEventListener("message", ({ data }) => {
    const { event, payload } = JSON.parse(data);

    switch (event) {
      case "didReceiveGlobalSettings":
        const settings = payload.settings;
        tokenField.value = settings.token ?? "";
        secretKeyField.value = settings.secretKey ?? "";
        break;
      case "sendToPropertyInspector":
        // console.log(JSON.stringify(payload));
        switch (payload.event) {
          case "onAppear":
            updateDeviceList(payload.payload.deviceList ?? []);
            deviceListSelect.value = payload.payload.deviceId ?? "";
            break;

          case "setDeviceList":
            updateDeviceList(payload.payload.devices);
            deviceListSelect.value = payload.payload.deviceId ?? "";
            break;
        }
        break;
    }
  });

  const updateDeviceList = (newDevices: any[]) => {
    deviceListSelect.innerHTML =
      '<option value="" disabled selected>Select a device</option>' +
      newDevices
        .map(
          (device) =>
            `<option value="${device.deviceId}">${device.deviceName}</option>`
        )
        .join("");
  };

  tokenField.addEventListener("change", (event: any) => {
    setGlobalSettings(getGlobalSettingsPayload(event.target.value, "token"));
    sendToPlugin(action, "");
  });

  secretKeyField.addEventListener("change", (event: any) => {
    setGlobalSettings(
      getGlobalSettingsPayload(event.target.value, "secretKey")
    );
    sendToPlugin(action, "");
  });

  deviceListSelect.addEventListener("change", (event: any) => {
    setSettings(getSettingsPayload(event.target.value, "deviceId"));
  });

  const getGlobalSettingsPayload = (value: string, key: string) => {
    const obj = {
      token: tokenField.value ?? "",
      secretKey: secretKeyField.value ?? "",
    };
    return {
      ...obj,
      [key]: value,
    };
  };

  const getSettingsPayload = (value: string, key: string) => {
    const obj = {
      deviceId: deviceListSelect.value ?? "",
    };
    return {
      ...obj,
      [key]: value,
    };
  };
};

const setGlobalSettings = (payload: any) => {
  if (ws == null) return;
  ws.send(
    JSON.stringify({
      event: "setGlobalSettings",
      context: uuid,
      payload,
    })
  );
};

const setSettings = (payload: any) => {
  if (ws == null) return;
  ws.send(
    JSON.stringify({
      event: "setSettings",
      context: uuid,
      payload,
    })
  );
};

const sendToPlugin = (action: string, payload: any) => {
  if (ws == null) return;
  ws.send(
    JSON.stringify({
      action: action,
      event: "sendToPlugin",
      context: uuid,
      payload,
    })
  );
};

(window as any)["connectElgatoStreamDeckSocket"] =
  connectElgatoStreamDeckSocket;
