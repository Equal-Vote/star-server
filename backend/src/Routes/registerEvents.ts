import ServiceLocator from "../ServiceLocator";
import Logger from "../Services/Logging/Logger";

const { handleCastVoteEvent } = require('../Controllers/castVoteController');

export default async function registerEvents() {
    const ctx = Logger.createContext("app init");
    Logger.debug(ctx, "registering events");
    const eventQueue = await ServiceLocator.eventQueue();
    eventQueue.subscribe("castVoteEvent", handleCastVoteEvent);
    Logger.debug(ctx, "registering events complete");
}