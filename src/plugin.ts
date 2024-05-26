import streamDeck, { LogLevel } from "@elgato/streamdeck";

import { PlaygroundAction } from "./actions/playground";

// We can enable "trace" logging so that all messages between the Stream Deck, and the plugin are recorded. When storing sensitive information
streamDeck.logger.setLevel(LogLevel.TRACE);

const playgroundAction = new PlaygroundAction();
streamDeck.actions.registerAction(playgroundAction);

await streamDeck.connect();
