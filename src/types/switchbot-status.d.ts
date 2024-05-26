interface StatusDevice {
  deviceId: string;
  deviceType: string;
  hubDeviceId: string;
  version: string;
}

interface StatusHasPower {
  power: string;
}

interface StatusCeilingLight extends StatusDevice, StatusHasPower {
  brightness: number;
  colorTemperature: number;
}

interface StatusResponse extends APIResponse {
  body: StatusDevice;
}
