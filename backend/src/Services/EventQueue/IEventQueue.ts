import { QueueName } from "./QueueName";

export type EventHandler = (job: { id: string; data: object; }) => Promise<void>;
export interface JobInsert<T = object> {
    id?: string,
    name: string;
    data?: T;
    priority?: number;
    retryLimit?: number;
    retryDelay?: number;
    retryBackoff?: boolean;
    startAfter?: Date | string;
    singletonKey?: string;
    expireInSeconds?: number;
    keepUntil?: Date | string;
    onComplete?: boolean
}
export interface IEventQueue {
    subscribe(queue:QueueName, handler:EventHandler):void;
    publish(queue:QueueName, data:object):Promise<string>;
    publishBatch(queue:QueueName, data:object):Promise<object>;
    clearStorage():Promise<void>;
    debugInfo():Promise<string>;
};