import { Email } from "../../../domain_model/Email";
import { Uid } from "../../../domain_model/Uid";


export class UserModel {
    id: Uid;
    email: Email;
    hashedPassword: string;
    salt: string;

    constructor() {
    }

    public static fromJson(json: string):UserModel {
        var obj = JSON.parse(json);
        let res: UserModel = new UserModel();
        for (let index in obj) {
            if (res.hasOwnProperty(index)) {
                res[index] = obj[index];
            }
        }
        return res;
    }

    public toJson():string {
        return JSON.stringify(this);
    }

    public copy():UserModel {
        var res = new UserModel();
        res.id = this.id;
        res.email = this.email;
        res.hashedPassword = this.hashedPassword;
        res.salt = this.salt;
        return res;
    }
}