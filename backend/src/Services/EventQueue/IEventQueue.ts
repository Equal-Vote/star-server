import { QueueName } from "./QueueName";

export type EventHandler = (job: { id: string; data: object; }) => Promise<void>;

export interface IEventQueue {
    subscribe(queue:QueueName, handler:EventHandler):void;
    publish(queue:QueueName, data:object):Promise<string>;
    clearStorage():Promise<void>;
    debugInfo():Promise<string>;
};