import { Imsg } from "./IEmail";

export interface IEmailService {
    sendEmails(msg: Imsg[]):Promise<void>;
}