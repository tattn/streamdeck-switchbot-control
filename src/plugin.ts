import streamDeck, { LogLevel } from "@elgato/streamdeck";

import { PlaygroundAction } from "./actions/playground";
import { OnOffAction } from "./actions/on-off";

// We can enable "trace" logging so that all messages between the Stream Deck, and the plugin are recorded. When storing sensitive information
streamDeck.logger.setLevel(LogLevel.TRACE);

streamDeck.actions.registerAction(new OnOffAction());
// streamDeck.actions.registerAction(new PlaygroundAction());

await streamDeck.connect();
