import Logger from "./Services/Logging/Logger"
import { reqIdSuffix } from "./IRequest"
export const errorCatch = async (err: any, req: any, res: any, next: any) => {
    Logger.error(req, err.message);
    var status = 500;
    if (err.httpStatus) {
        status = err.httpStatus;
    }
    var msg = "Error";
    if (err.detail) {
        msg = err.detail;
    }
    msg += reqIdSuffix(req);
    return res.status(status).json({ error: msg });
}
