import streamDeck from "@elgato/streamdeck";
import crypto from "crypto";

const logger = streamDeck.logger.createScope("switchbot");

export class Switchbot {
  private readonly buildHeaders: () => Headers;

  private readonly BASE_URL: string = "https://api.switch-bot.com/v1.1";

  constructor(token: string, secret: string) {
    this.buildHeaders = () => {
      const t = Date.now().toString();
      const nonce = crypto.randomUUID();

      const signTerm = crypto
        .createHmac("sha256", secret)
        .update(Buffer.from(token + t + nonce, "utf-8"))
        .digest();

      return new Headers({
        Authorization: token,
        sign: signTerm.toString("base64"),
        nonce: nonce,
        t: t,
        "Content-Type": "application/json",
      });
    };
  }

  async getDeviceIDs(): Promise<DevicesResponse> {
    const res = await fetch(`${this.BASE_URL}/devices`, {
      headers: this.buildHeaders(),
    });
    const json = (await res.json()) as DevicesResponse;
    return json;
  }

  async commandDevice(
    deviceId: string,
    command: Record<string, string> | string
  ): Promise<APIResponse> {
    if (typeof command === "string") {
      command = { command: command };
    }
    const res = await fetch(`${this.BASE_URL}/devices/${deviceId}/commands`, {
      method: "POST",
      headers: this.buildHeaders(),
      body: JSON.stringify(command),
    });
    const json = (await res.json()) as APIResponse;
    return json;
  }

  async getDeviceStatus(deviceId: string): Promise<StatusResponse> {
    const res = await fetch(`${this.BASE_URL}/devices/${deviceId}/status`, {
      headers: this.buildHeaders(),
    });
    const json = (await res.json()) as StatusResponse;
    return json;
  }
}
