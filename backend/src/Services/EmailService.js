const sgMail = require('@sendgrid/mail')
const Invitation = require('./Invitation')
require('dotenv').config()
sgMail.setApiKey(process.env.SENDGRID_API_KEY)

const sendEmails = (msg) => {
  sgMail
    .send(msg)
    .then((response) => {
      console.log(response)
    })
    .catch((error) => {
      console.error(error)
      console.error(error.response.body)
    })

}
const sendInvitations = (election,voters,url) => {
  console.log(election)
  console.log(voters)
  console.log(url)

  const msgs = voters.map((voter) => [Invitation(election,voter,url)]);
  console.log(msgs)
  sendEmails(msgs)
}
module.exports = {
  sendEmails,
  sendInvitations,
}