interface DevicesBaseDevice {
  deviceId: string;
  deviceType: string;
  hubDeviceId: string;
  deviceName: string;
  enableCloudService: boolean;
}

interface DevicesSmartLock extends DevicesBaseDevice {
  deviceType: "Smart Lock";
}

interface DevicesKeypadTouch extends DevicesBaseDevice {
  deviceType: "Keypad Touch";
  lockDeviceId: string;
  keyList: DevicesKey[];
}

interface DevicesCeilingLight extends DevicesBaseDevice {
  deviceType: "Ceiling Light";
}

interface DevicesPlugMini extends DevicesBaseDevice {
  deviceType: "Plug Mini (JP)";
}

interface DevicesCurtain extends DevicesBaseDevice {
  deviceType: "Curtain";
  curtainDevicesIds: string[];
  calibrate: boolean;
  group: boolean;
  master: boolean;
  openDirection: string;
}

interface DevicesMeterPlus extends DevicesBaseDevice {
  deviceType: "MeterPlus";
}

type DevicesDevice =
  | DevicesSmartLock
  | DevicesKeypadTouch
  | DevicesCeilingLight
  | DevicesPlugMini
  | DevicesCurtain
  | DevicesMeterPlus;

interface DevicesInfraredRemote {
  deviceId: string;
  deviceName: string;
  remoteType: string;
  hubDeviceId: string;
}

interface DevicesKey {
  id: number;
  name: string;
  type: string;
  status: string;
  createTime: number;
  password: string;
  iv: string;
}

interface DevicesBody {
  deviceList: DevicesDevice[];
  infraredRemoteList: DevicesInfraredRemote[];
}

interface DevicesResponse extends APIResponse {
  body: DevicesBody;
}
