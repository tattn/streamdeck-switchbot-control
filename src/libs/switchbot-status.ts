import streamDeck from "@elgato/streamdeck";

const logger = streamDeck.logger.createScope("switchbot-status");

export function isStatusPower(arg: any): arg is StatusHasPower {
  return (
    arg !== null && typeof arg === "object" && typeof arg.power === "string"
  );
}

export function isStatusCurtain(arg: any): arg is StatusCurtain {
  return (
    arg !== null &&
    typeof arg === "object" &&
    typeof arg.calibrate === "boolean" &&
    typeof arg.group === "boolean" &&
    typeof arg.moving === "boolean" &&
    typeof arg.slidePosition === "number" &&
    typeof arg.battery === "number"
  );
}
