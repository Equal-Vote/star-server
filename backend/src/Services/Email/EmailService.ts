import { Ballot } from "../../../../domain_model/Ballot"
import { Election } from "../../../../domain_model/Election"
import { ElectionRoll } from "../../../../domain_model/ElectionRoll"
import { Imsg } from "./IEmail"
import Templates from './EmailTemplates'

export default class EmailService {

  sgMail;

  constructor() {
    this.sgMail = require('@sendgrid/mail')
    require('dotenv').config()
    this.sgMail.setApiKey(process.env.SENDGRID_API_KEY)
  }


  sendEmails = async (msg: Imsg[]) => {
    const responses = await this.sgMail.send(msg)
    const badResponses = responses.filter((response: any) => response.statusCode >= 400)
    if (badResponses.length > 0) {
      throw new Error(JSON.stringify(badResponses))
    }
  }

  sendInvitations = async (election: Election, voters: ElectionRoll[], url: string) => {
    const msgs = voters.map((voter) => <Imsg>Templates.Invite(election, voter, url));
    await this.sendEmails(msgs)
  }

  sendReceipt = async (election: Election, email: string, ballot: Ballot, url: string) => {
    const msgs = Templates.Receipt(election, email, ballot, url);
    await this.sendEmails([msgs])
  }

}