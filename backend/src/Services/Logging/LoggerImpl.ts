import { randomUUID } from "crypto";
import { ILoggingContext } from "./ILogger";


export class LoggerImpl {

    constructor() {
    }

    debug(context?:ILoggingContext,  message?: any, ...optionalParams: any[]):void{
        this.log(context, "debug", message, ...optionalParams);
    }

    info(context?:ILoggingContext,  message?: any, ...optionalParams: any[]):void{
        this.log(context, "info", message, ...optionalParams);
    }

    warn(context?:ILoggingContext,  message?: any, ...optionalParams: any[]):void{
        this.log(context, "WARN", message, ...optionalParams);
    }

    error(context?:ILoggingContext,  message?: any, ...optionalParams: any[]):void{
        this.log(context, "ERROR", message, ...optionalParams);
    }

    log(context?:ILoggingContext, levelStr?:string,  message?: any, ...optionalParams: any[]):void { 
        var msg = new Date(Date.now()).toISOString();
        if (context!= null){
            if (context.contextId == null || context.contextId == undefined){
                context.contextId = randomUUID();
            }
            msg += " - " + context.contextId;
        }
        if (levelStr != null){
            msg += " - " + levelStr;
        }
        var msg = `${msg}:\n  ${message}`;
        console.log(msg, ...optionalParams);
    }
}