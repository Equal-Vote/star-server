import { Imsg } from "./IEmail"

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

}