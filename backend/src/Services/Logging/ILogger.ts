import { IRequest } from '../../IRequest';

export type ILoggingContext = ICustomContext | IRequest;

export interface ICustomContext {
    contextId?: String;
  };

export interface ILogger {
    debug(context?:ILoggingContext, message?: any, ...optionalParams: any[]):void;
    info(context?:ILoggingContext, message?: any, ...optionalParams: any[]):void;
    warn(context?:ILoggingContext, message?: any, ...optionalParams: any[]):void;
    error(context?:ILoggingContext, message?: any, ...optionalParams: any[]):void;
}