import { IRequest } from "../../IRequest";
import Logger from "./Logger";

export function loggerMiddleware(req:IRequest, res:any, next:any):void {
    Logger.info(req, `REQUEST: ${req.method} ${req.url} @ ${new Date(Date.now()).toISOString()} ip:${req.ip}`);

    res.on('finish', () => {
        Logger.info(req, `RES: ${req.method} ${req.url}  status:${res.statusCode}`);
    });
    next();
}



