import { Request, Response } from 'express';
import { reqIdSuffix } from './IRequest';
import { ILoggingContext } from './Services/Logging/ILogger';
import Logger from './Services/Logging/Logger';

export function assertNotNull<Type>(data:Type | null, message:string = 'unexpected null'):Type {
    if (data == null){
        throw(new Error(message));
    }
    return data;
}

export function orDefault<T>(data: T | null, def:T):T {
    if (data == null){
      return def;
    }
    console.log("orDefault but was NOT null...");
    return data;
  }

export function responseErr(res:Response, req:Request, code:number, errMessage:string, extraData?:any){
  errMessage += reqIdSuffix(req);
  if (extraData == null){
    extraData = {};
  }
  extraData.error = errMessage;
  return res.status(code).json(extraData);
}