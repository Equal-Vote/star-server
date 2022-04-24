const sgMail = require('@sendgrid/mail')
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
    })

}

module.exports = {
  sendEmails
}