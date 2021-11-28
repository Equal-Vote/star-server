import { Email } from "../../domain_model/Email";
import { Uid } from "../../domain_model/Uid";
import { UserModel } from "./data_model/UserModel";


export interface IUserStore {
    getByEmail(email: Email): Promise<UserModel>;
    getById(id:Uid): Promise<UserModel>;
    set(user:UserModel): Promise<UserModel>;
}