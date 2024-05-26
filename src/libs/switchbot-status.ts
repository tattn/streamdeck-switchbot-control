import streamDeck from "@elgato/streamdeck";

const logger = streamDeck.logger.createScope("switchbot-status");

export function isStatusPower(arg: any): arg is StatusHasPower {
  return (
    arg !== null && typeof arg === "object" && typeof arg.power === "string"
  );
}
