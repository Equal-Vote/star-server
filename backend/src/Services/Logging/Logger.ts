import { ILogger, ILoggingContext } from "./ILogger";
import { LoggerImpl } from "./LoggerImpl";

var _loggerInstance: ILogger;

function debug(context?: ILoggingContext, message?: any, ...optionalParams: any[]): void {
  logger().debug(context, message, ...optionalParams);
}

function info(context?: ILoggingContext,message?: any, ...optionalParams: any[]): void {
  logger().info(context, message, ...optionalParams);
}

function warn(context?: ILoggingContext,message?: any, ...optionalParams: any[]): void {
  logger().warn(context, message, ...optionalParams);
}

function error(context?: ILoggingContext, message?: any, ...optionalParams: any[]): void {
  logger().error(context, message, ...optionalParams);
}

function logger(): ILogger {
  if (_loggerInstance == null) {
    _loggerInstance = new LoggerImpl();
  }
  return _loggerInstance;
}

function createContext(name:string):ILoggingContext {
    return {
        contextId: name
      }
}

export  default { debug, info, warn, error, createContext };