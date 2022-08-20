import { Ballot } from "../../../../../domain_model/Ballot"
import { Election } from "../../../../../domain_model/Election"
import { ElectionRoll } from "../../../../../domain_model/ElectionRoll"
import { Imsg } from "./../IEmail"
import Templates from './../EmailTemplates'

export default class EmailService {

  sentEmails:Imsg[];

  constructor() {
    this.sentEmails = []
  }


  sendEmails = async (msg: Imsg[]) => {
    this.sentEmails.push(...msg)
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