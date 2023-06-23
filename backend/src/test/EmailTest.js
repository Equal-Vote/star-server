// const EmailService = require('../Services/EmailService')
// const Invitation = require('../Services/Invitation')
// const election = {
//     title: 'Test Election',
//     election_id: '1'
// }
// const voter = [{
//     voter_id: 'mikefranze@gmail.com'
// }]
// use req.get(host) to get url

// const msg = Invitation(election,voter,'https://localhost:3000')
// console.log(msg)
// EmailService.sendEmails(msg)
// EmailService.sendInvitations(election,voter,'https://localhost:3000')

require('dotenv').config()
const sgMail = require('@sendgrid/mail')
sgMail.setApiKey(process.env.SENDGRID_API_KEY)

const message = [{
    to: 'mike@equal.vote',
    from: 'elections@star.vote',
    subject: `Test Email`,
    text: `Hello`,
    html: `<div> 
                <h3> 
                    Test email 
                </h3> 
                <%asm_group_unsubscribe_url%>
            </div>`,
    asm: {
        groupId: 21140
    },
    mail_settings: {
        "sandbox_mode": {
            "enable": true
        }
    }
},
{
    to: 'mikefranzegmail.com',
    from: 'elections@star.vote',
    subject: `Test Email`,
    text: `Hello Mike`,
    html: `<div> 
                <h3> 
                    Test email 
                </h3> 
                <%asm_group_unsubscribe_url%>
            </div>`,
    asm: {
        groupId: 21140
    },
    mail_settings: {
        "sandbox_mode": {
            "enable": true
        }
    }
}]
// console.log(Array(10).fill(message[0]))
async function Test() {

    const responses = await sgMail.send(message)
    console.log(responses)

}

Test()