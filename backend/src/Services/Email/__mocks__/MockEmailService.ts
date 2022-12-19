import { IEmailService } from "../IEmailService";
import { Imsg } from "../IEmail"

export default class MockEmailService implements IEmailService { 

  public sentEmails:Imsg[];
  public maxSizeTarget = 50;

  constructor() {
    this.sentEmails = []
  }

  sendEmails = async (msg: Imsg[]) => {
    this.sentEmails.push(...msg)
    if (this.sendEmails.length > this.maxSizeTarget * 2){
      this.sentEmails = this.sentEmails.slice(this.maxSizeTarget, this.sendEmails.length)
    }
  }

  clear = () => {
    this.sentEmails = []
  }

}