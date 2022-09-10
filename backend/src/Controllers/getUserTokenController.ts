import { response } from "express";
import ServiceLocator from "../ServiceLocator";

const AccountService = ServiceLocator.accountService()

const getUserToken = async (req: any, res: any, next: any) => {
    const data = await AccountService.getToken(req)
    res.json(data)
}

module.exports = {
    getUserToken,
}