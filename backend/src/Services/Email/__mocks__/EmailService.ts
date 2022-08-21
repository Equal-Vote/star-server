import { Imsg } from "./../IEmail"

export default class EmailService {

  sentEmails:Imsg[];

  constructor() {
    this.sentEmails = []
  }

  sendEmails = async (msg: Imsg[]) => {
    this.sentEmails.push(...msg)
  }

}