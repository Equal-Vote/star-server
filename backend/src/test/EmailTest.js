const EmailService = require('../Services/EmailService')

EmailService.sendEmails(
    [
        {
            to: 'mikefranze@gmail.com', // Change to your recipient
            from: 'mike@equal.vote', // Change to your verified sender
            subject: 'Testing SendGrid',
            text: 'Hi Mike',
            html: '<h1>Hello Mike</h1>',
        },

        {
            to: 'mike@equal.vote', // Change to your recipient
            from: 'mike@equal.vote', // Change to your verified sender
            subject: 'Testing SendGrid',
            text: 'Hi Me',
            html: '<h1>Hello Me</h1>',
        }]

)