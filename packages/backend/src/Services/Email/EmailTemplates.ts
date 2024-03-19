import { Ballot } from "@equal-vote/star-vote-shared/domain_model/Ballot"
import { Election } from "@equal-vote/star-vote-shared/domain_model/Election"
import { ElectionRoll } from "@equal-vote/star-vote-shared/domain_model/ElectionRoll"
import { Imsg } from "./IEmail"
import { DateTime } from 'luxon'

const emailSettings: Partial<Imsg> = {
    asm: process.env.SENDGRID_GROUP_ID ? {
        groupId: parseInt(process.env.SENDGRID_GROUP_ID)
    }  : undefined,
    mail_settings: process.env.EMAIL_TEST_MODE ? {
        "sandbox_mode": {
            "enable": true
        }
    } : undefined
}

export function Invites(election: Election, voters: ElectionRoll[], url: string): Imsg[] {
    return voters.map((voter) => <Imsg>{
        ...emailSettings,
        to: voter.email, // Change to your recipient
        from: 'elections@star.vote', // Change to your verified sender
        subject: `Invitation to Vote In ${election.title}`,
        text: `You have been invited to vote in ${election.title} ${url}/Election/${election.election_id}`,
        html: emailTemplate(
            `<tr>
                    <td class="wrapper" style="font-family: sans-serif; font-size: 14px; vertical-align: top; box-sizing: border-box; padding: 20px;" valign="top">
                      <table role="presentation" border="0" cellpadding="0" cellspacing="0" style="border-collapse: separate; mso-table-lspace: 0pt; mso-table-rspace: 0pt; width: 100%;" width="100%">
                        <tr>
                          <td style="font-family: sans-serif; font-size: 14px; vertical-align: top;" valign="top">
                            <p style="font-family: sans-serif; font-size: 14px; font-weight: normal; margin: 0; margin-bottom: 15px;">Hi there,</p>
                            <p class="disable-links" style="font-family: sans-serif; font-size: 14px; font-weight: normal; margin: 0; margin-bottom: 15px;">You have been invited to vote in a STAR Voting election.</p>
                            <p style="font-family: sans-serif; font-size: 14px; font-weight: normal; margin: 0; margin-bottom: 15px;">Election: ${election.title}</p>
                            ${election.description ? `<p style="font-family: sans-serif; font-size: 14px; font-weight: normal; margin: 0; margin-bottom: 15px;">Description: ${election.description}</p>` : ''}
                            
                            ${election.start_time && election.settings.time_zone ? `<p style="font-family: sans-serif; font-size: 14px; font-weight: normal; margin: 0; margin-bottom: 15px;">Start Time: ${ DateTime.fromJSDate(new Date(election.start_time)).setZone(election.settings.time_zone).toLocaleString(DateTime.DATETIME_FULL) }</p>` : ''}
                            
                            ${election.end_time && election.settings.time_zone ? `<p style="font-family: sans-serif; font-size: 14px; font-weight: normal; margin: 0; margin-bottom: 15px;">End Time: ${ DateTime.fromJSDate(new Date(election.end_time)).setZone(election.settings.time_zone).toLocaleString(DateTime.DATETIME_FULL) }</p>` : ''}

                            This link is unique to you, be careful not to share this email with others

                            <table role="presentation" border="0" cellpadding="0" cellspacing="0" class="btn btn-primary" style="border-collapse: separate; mso-table-lspace: 0pt; mso-table-rspace: 0pt; box-sizing: border-box; width: 100%;" width="100%">
                              <tbody>
                                <tr>
                                  <td align="left" style="font-family: sans-serif; font-size: 14px; vertical-align: top; padding-bottom: 15px;" valign="top">
                                    <table role="presentation" border="0" cellpadding="0" cellspacing="0" style="border-collapse: separate; mso-table-lspace: 0pt; mso-table-rspace: 0pt; width: auto;">
                                      <tbody>
                                        <tr>
                                          <td style="font-family: sans-serif; font-size: 14px; vertical-align: top; border-radius: 5px; text-align: center; background-color: #3498db;" valign="top" align="center" bgcolor="#3498db"> <a clicktracking="off" href="${url}/Election/${election.election_id}/${election.settings.voter_authentication.voter_id === true ? 'id/' + voter.voter_id : ''}" target="_blank" style="border: solid 1px #3498db; border-radius: 5px; box-sizing: border-box; cursor: pointer; display: inline-block; font-size: 14px; font-weight: bold; margin: 0; padding: 12px 25px; text-decoration: none; text-transform: capitalize; background-color: #3498db; border-color: #3498db; color: #ffffff;">Go to election</a> </td>
                                        </tr>
                                      </tbody>
                                    </table>
                                  </td>
                                </tr>
                              </tbody>
                            </table>

                        </td>
                        </tr>
                      </table>
                    </td>
                  </tr>`),
    })
}


export function Receipt(election: Election, email: string, ballot: Ballot, url: string): Imsg {
    return {
        ...emailSettings,
        to: email, // Change to your recipient
        from: 'elections@star.vote', // Change to your verified sender
        subject: `Ballot Receipt For ${election.title}`,
        text: `Thank you for voting in ${election.title}, you can view your ballot and ballot status at ${url}/Election/${election.election_id}/ballot/${ballot.ballot_id}`,
        html: `<div> 
                    <h3> 
                        Thank you for voting in ${election.title}, you can verify your ballot and ballot status <a clicktracking="off" href="${url}/Election/${election.election_id}/ballot/${ballot.ballot_id}" >here</a>  
                    </h3> 
                </div>    
                <div> 
                    <%asm_group_unsubscribe_url%>  
                </div>   `,
    }
}


function emailTemplate(content: string) {

    return `
    <!doctype html>
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
        <title>Simple Transactional Email</title>
        <style>
    @media only screen and (max-width: 620px) {
      table.body h1 {
        font-size: 28px !important;
        margin-bottom: 10px !important;
      }
    
      table.body p,
    table.body ul,
    table.body ol,
    table.body td,
    table.body span,
    table.body a {
        font-size: 16px !important;
      }
    table.body p.disable-links {
        pointer-events: none;
    }
    
      table.body .wrapper,
    table.body .article {
        padding: 10px !important;
      }
    
      table.body .content {
        padding: 0 !important;
      }
    
      table.body .container {
        padding: 0 !important;
        width: 100% !important;
      }
    
      table.body .main {
        border-left-width: 0 !important;
        border-radius: 0 !important;
        border-right-width: 0 !important;
      }
    
      table.body .btn table {
        width: 100% !important;
      }
    
      table.body .btn a {
        width: 100% !important;
      }
    
      table.body .img-responsive {
        height: auto !important;
        max-width: 100% !important;
        width: auto !important;
      }
    }
    @media all {
      .ExternalClass {
        width: 100%;
      }
    
      .ExternalClass,
    .ExternalClass p,
    .ExternalClass span,
    .ExternalClass font,
    .ExternalClass td,
    .ExternalClass div {
        line-height: 100%;
      }
    
      .apple-link a {
        color: inherit !important;
        font-family: inherit !important;
        font-size: inherit !important;
        font-weight: inherit !important;
        line-height: inherit !important;
        text-decoration: none !important;
      }
    
      #MessageViewBody a {
        color: inherit;
        text-decoration: none;
        font-size: inherit;
        font-family: inherit;
        font-weight: inherit;
        line-height: inherit;
      }
    
      .btn-primary table td:hover {
        background-color: #34495e !important;
      }
    
      .btn-primary a:hover {
        background-color: #34495e !important;
        border-color: #34495e !important;
      }
    }
    </style>
      </head>
      <body style="background-color: #f6f6f6; font-family: sans-serif; -webkit-font-smoothing: antialiased; font-size: 14px; line-height: 1.4; margin: 0; padding: 0; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%;">
        <table role="presentation" border="0" cellpadding="0" cellspacing="0" class="body" style="border-collapse: separate; mso-table-lspace: 0pt; mso-table-rspace: 0pt; background-color: #f6f6f6; width: 100%;" width="100%" bgcolor="#f6f6f6">
          <tr>
            <td style="font-family: sans-serif; font-size: 14px; vertical-align: top;" valign="top">&nbsp;</td>
            <td class="container" style="font-family: sans-serif; font-size: 14px; vertical-align: top; display: block; max-width: 580px; padding: 10px; width: 580px; margin: 0 auto;" width="580" valign="top">
              <div class="content" style="box-sizing: border-box; display: block; margin: 0 auto; max-width: 580px; padding: 10px;">
    
                <!-- START CENTERED WHITE CONTAINER -->
                <table role="presentation" class="main" style="border-collapse: separate; mso-table-lspace: 0pt; mso-table-rspace: 0pt; background: #ffffff; border-radius: 3px; width: 100%;" width="100%">
    
                  <!-- START MAIN CONTENT AREA -->
                  ${content}
                <!-- END MAIN CONTENT AREA -->
                </table>
                <!-- END CENTERED WHITE CONTAINER -->
    
                <!-- START FOOTER -->
                <div class="footer" style="clear: both; margin-top: 10px; text-align: center; width: 100%;">
                  <table role="presentation" border="0" cellpadding="0" cellspacing="0" style="border-collapse: separate; mso-table-lspace: 0pt; mso-table-rspace: 0pt; width: 100%;" width="100%">
                    <tr>
                      <td class="content-block" style="font-family: sans-serif; vertical-align: top; padding-bottom: 10px; padding-top: 10px; color: #999999; font-size: 12px; text-align: center;" valign="top" align="center">
                        <br> <%asm_group_unsubscribe_url%>
                      </td>
                    </tr>
                  </table>
                </div>
                <!-- END FOOTER -->
    
              </div>
            </td>
            <td style="font-family: sans-serif; font-size: 14px; vertical-align: top;" valign="top">&nbsp;</td>
          </tr>
        </table>
      </body>
    </html>    
    `
}