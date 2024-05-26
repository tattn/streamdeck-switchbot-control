export let ws: WebSocket | null = null;
let uuid = "";
let devices: any[] = [];

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
  uuid = inPluginUUID;
  const actionInfo = JSON.parse(inActionInfo);
  let settings = actionInfo.payload.settings;
  deviceListSelect.value = settings.deviceId ?? "";
  console.log(JSON.stringify(settings));

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
        switch (payload.event) {
          case "setDeviceList":
            devices = payload.payload.devices;
            deviceListSelect.innerHTML = devices
              .map(
                (device) =>
                  `<option value="${device.deviceId}">${device.deviceName}</option>`
              )
              .join("");
            console.log(JSON.stringify(payload.payload));
            deviceListSelect.value = payload.payload.settings.deviceId ?? "";
            break;
        }
        break;
    }
  });

  tokenField.addEventListener("change", (event: any) => {
    setGlobalSettings(getGlobalSettingsPayload(event.target.value, "token"));
  });

  secretKeyField.addEventListener("change", (event: any) => {
    setGlobalSettings(
      getGlobalSettingsPayload(event.target.value, "secretKey")
    );
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

(window as any)["connectElgatoStreamDeckSocket"] =
  connectElgatoStreamDeckSocket;
