const EmailService = require('../Services/EmailService')
const Invitation = require('../Services/Invitation')
const election = {
    title: 'Test Election',
    election_id: 1
}
const voter = [{
    voter_id: 'mikefranze@gmail.com'
}]
// use req.get(host) to get url

// const msg = Invitation(election,voter,'https://localhost:3000')
// console.log(msg)
// EmailService.sendEmails(msg)
EmailService.sendInvitations(election,voter,'https://localhost:3000')