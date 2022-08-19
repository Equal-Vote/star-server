import { Ballot } from "../../../../domain_model/Ballot"
import { Election } from "../../../../domain_model/Election"
import { ElectionRoll } from "../../../../domain_model/ElectionRoll"
import { Imsg } from "./IEmail"
import Templates from './EmailTemplates'

const sgMail = require('@sendgrid/mail')
require('dotenv').config()
sgMail.setApiKey(process.env.SENDGRID_API_KEY)

const sendEmails = async (msg: Imsg | Imsg[]) => {
  const responses = await sgMail.send(msg)
  const badResponses = responses.filter((response:any) => response.statusCode >= 400)
  if (badResponses.length>0){
    throw new Error(JSON.stringify(badResponses))
  }
}

const sendInvitations = async (election: Election, voters: ElectionRoll[], url: string) => {
  const msgs = voters.map((voter) => <Imsg>Templates.Invite(election, voter, url));
  await sendEmails(msgs)
}

const sendReceipt = async (election: Election, email: string, ballot: Ballot, url: string) => {
  const msgs = Templates.Receipt(election, email, ballot, url);
  await sendEmails(msgs)
}

export default {
  sendEmails,
  sendInvitations,
  sendReceipt
}