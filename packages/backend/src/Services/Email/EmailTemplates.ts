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

const formatTime = (time: string | Date, tz: string) => DateTime.fromJSDate(new Date(time)).setZone(tz).toLocaleString(DateTime.DATETIME_FULL);

const makeButton = (text: string, link: string) => 
  // https://stackoverflow.com/questions/2857765/whats-the-best-way-to-center-your-html-email-content-in-the-browser-window-or
  `<table width="100%" border="0" cellspacing="0" cellpadding="0"><tr><td align="center">
      <a clicktracking="off" href="${link}" target="_blank" style="border: solid 1px #3498db; border-radius: 5px; box-sizing: border-box; cursor: pointer; display: inline-block; font-size: 14px; font-weight: bold; padding: 12px 25px; text-decoration: none; text-transform: capitalize; background-color: #3498db; border-color: #3498db; color: #ffffff;">${text}</a>
  </td></tr></table>`

export function Invites(election: Election, voters: ElectionRoll[], url: string): Imsg[] {
    return voters.map((voter) => <Imsg>{
        ...emailSettings,
        to: voter.email, // Change to your recipient
        from: process.env.FROM_EMAIL_ADDRESS ?? '',
        subject: `Invitation to Vote In ${election.title}`,
        text: `${election.state === 'draft' ? `[⚠️Test ${election.settings.term_type}]` : ''} You have been invited to vote in ${election.title} ${url}/${election.election_id}`,
        html: emailTemplate(`
          ${election.state === 'draft' ? `<h3>⚠️This ${election.settings.term_type} is still in test mode. All ballots during test mode will be removed once the election is finalized, and at that time you will need to vote again.⚠️</h3>` : ''}
          <p>You have been invited to vote in the \"${election.title}\" ${election.settings.term_type}.</p>
          ${election.description ?
            `<p>Election ${election.description}<p>` : ''
          }
          ${(election.start_time && election.settings.time_zone) ?
            `<p>Voting will begin on ${formatTime(election.start_time, election.settings.time_zone)}.<p>` : ''
          }
          ${(election.end_time && election.settings.time_zone) ?
            `<p><b>Voting ends on ${formatTime(election.end_time, election.settings.time_zone)}!</b><p>` : ''
          }

          <p>Click the button to vote:</p>

          ${makeButton('Vote', `${url}/${election.election_id}/${election.settings.voter_authentication.voter_id === true && 'id/' + voter.voter_id}`)}

          <p>This link is unique to you, be careful not to share this email with others</p>
        `)
    })
}

export function Receipt(election: Election, email: string, ballot: Ballot, url: string): Imsg {
    return {
        ...emailSettings,
        to: email, // Change to your recipient
        from: process.env.FROM_EMAIL_ADDRESS ?? '',
        subject: `Ballot Receipt For ${election.title}`,
        text: `${election.state === 'draft' ? '[⚠️Test Ballot]' : ''} Thank you for voting in ${election.title}, you can view your ballot and ballot status at ${url}/Election/${election.election_id}/ballot/${ballot.ballot_id}`,
        html: emailTemplate(`
          <div> 
            ${election.state === 'draft' ? "<h3>⚠️This was cast as a test ballot. All test ballots will be removed once the election is finalized, and at that time you will need to vote again.⚠️</h3>" : ''}
            <p>Thank you for voting in ${election.title}!<p>
            <p>You can <a clicktracking="off" href="${url}/${election.election_id}/ballot/${ballot.ballot_id}">verify your ballot and ballot status</a> at any time.</p>
          </div>    
        `),
    }
}


function emailTemplate(content: string) {
  // How to generate this
  // 1. Edit template within the STAR Voting mailchimp account
  // 2. Export template as html
  // 3. substitute EMAIL_CONTENT with ${content}
  // 4. substitute UNSUBSCRIBE_LINK with <%asm_group_unsubscribe_url%>
  return `<!DOCTYPE html><html xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office"><head>
<!--[if gte mso 15]>
<xml>
<o:OfficeDocumentSettings>
<o:AllowPNG/>
<o:PixelsPerInch>96</o:PixelsPerInch>
</o:OfficeDocumentSettings>
</xml>
<![endif]-->
<meta charset="UTF-8"/>
<meta http-equiv="X-UA-Compatible" content="IE=edge"/>
<meta name="viewport" content="width=device-width, initial-scale=1"/>
<title>*|MC:SUBJECT|*</title>
<style>          img{-ms-interpolation-mode:bicubic;} 
          table, td{mso-table-lspace:0pt; mso-table-rspace:0pt;} 
          .mceStandardButton, .mceStandardButton td, .mceStandardButton td a{mso-hide:all !important;} 
          p, a, li, td, blockquote{mso-line-height-rule:exactly;} 
          p, a, li, td, body, table, blockquote{-ms-text-size-adjust:100%; -webkit-text-size-adjust:100%;} 
          @media only screen and (max-width: 480px){
            body, table, td, p, a, li, blockquote{-webkit-text-size-adjust:none !important;} 
          }
          .mcnPreviewText{display: none !important;} 
          .bodyCell{margin:0 auto; padding:0; width:100%;}
          .ExternalClass, .ExternalClass p, .ExternalClass td, .ExternalClass div, .ExternalClass span, .ExternalClass font{line-height:100%;} 
          .ReadMsgBody{width:100%;} .ExternalClass{width:100%;} 
          a[x-apple-data-detectors]{color:inherit !important; text-decoration:none !important; font-size:inherit !important; font-family:inherit !important; font-weight:inherit !important; line-height:inherit !important;} 
            body{height:100%; margin:0; padding:0; width:100%; background: #ffffff;}
            p{margin:0; padding:0;} 
            table{border-collapse:collapse;} 
            td, p, a{word-break:break-word;} 
            h1, h2, h3, h4, h5, h6{display:block; margin:0; padding:0;} 
            img, a img{border:0; height:auto; outline:none; text-decoration:none;} 
            a[href^="tel"], a[href^="sms"]{color:inherit; cursor:default; text-decoration:none;} 
            li p {margin: 0 !important;}
            .ProseMirror a {
                pointer-events: none;
            }
            @media only screen and (max-width: 640px){
                .mceClusterLayout td{padding: 4px !important;} 
            }
            @media only screen and (max-width: 480px){
                body{width:100% !important; min-width:100% !important; } 
                body.mobile-native {
                    -webkit-user-select: none; user-select: none; transition: transform 0.2s ease-in; transform-origin: top center;
                }
                body.mobile-native.selection-allowed a, body.mobile-native.selection-allowed .ProseMirror {
                    user-select: auto;
                    -webkit-user-select: auto;
                }
                colgroup{display: none;}
                img{height: auto !important;}
                .mceWidthContainer{max-width: 660px !important;}
                .mceColumn{display: block !important; width: 100% !important;}
                .mceColumn-forceSpan{display: table-cell !important; width: auto !important;}
                .mceColumn-forceSpan .mceButton a{min-width:0 !important;}
                .mceBlockContainer{padding-right:16px !important; padding-left:16px !important;} 
                .mceTextBlockContainer{padding-right:16px !important; padding-left:16px !important;} 
                .mceBlockContainerE2E{padding-right:0px; padding-left:0px;} 
                .mceSpacing-24{padding-right:16px !important; padding-left:16px !important;}
                .mceImage, .mceLogo{width: 100% !important; height: auto !important;} 
                .mceFooterSection .mceText, .mceFooterSection .mceText p{font-size: 16px !important; line-height: 140% !important;}
            }
            div[contenteditable="true"] {outline: 0;}
            .ProseMirror h1.empty-node:only-child::before,
            .ProseMirror h2.empty-node:only-child::before,
            .ProseMirror h3.empty-node:only-child::before,
            .ProseMirror h4.empty-node:only-child::before {
                content: 'Heading';
            }
            .ProseMirror p.empty-node:only-child::before, .ProseMirror:empty::before {
                content: 'Start typing...';
            }
            .mceImageBorder {display: inline-block;}
            .mceImageBorder img {border: 0 !important;}
body, #bodyTable { background-color: rgb(244, 244, 244); }.mceText, .mcnTextContent, .mceLabel { font-family: "Helvetica Neue", Helvetica, Arial, Verdana, sans-serif; }.mceText, .mcnTextContent, .mceLabel { color: rgb(0, 0, 0); }.mceText p { margin-bottom: 0px; }.mceText label { margin-bottom: 0px; }.mceText input { margin-bottom: 0px; }.mceSpacing-12 .mceInput + .mceErrorMessage { margin-top: -6px; }.mceText p { margin-bottom: 0px; }.mceText label { margin-bottom: 0px; }.mceText input { margin-bottom: 0px; }.mceSpacing-24 .mceInput + .mceErrorMessage { margin-top: -12px; }.mceInput { background-color: transparent; border: 2px solid rgb(208, 208, 208); width: 60%; color: rgb(77, 77, 77); display: block; }.mceInput[type="radio"], .mceInput[type="checkbox"] { float: left; margin-right: 12px; display: inline; width: auto !important; }.mceLabel > .mceInput { margin-bottom: 0px; margin-top: 2px; }.mceLabel { display: block; }.mceText p, .mcnTextContent p { color: rgb(0, 0, 0); font-family: "Helvetica Neue", Helvetica, Arial, Verdana, sans-serif; font-size: 16px; font-weight: normal; line-height: 150%; text-align: left; direction: ltr; margin: 10px 0px; }
@media only screen and (max-width: 480px) {
            .mceText p { margin: 0px; font-size: 16px !important; line-height: 150% !important; }
          }
@media only screen and (max-width: 480px) {
            .mceBlockContainer { padding-left: 16px !important; padding-right: 16px !important; }
          }
#dataBlockId-5 p, #dataBlockId-5 h1, #dataBlockId-5 h2, #dataBlockId-5 h3, #dataBlockId-5 h4, #dataBlockId-5 ul { text-align: center; }</style>
<script>!function(){function o(n,i){if(n&&i)for(var r in i)i.hasOwnProperty(r)&&(void 0===n[r]?n[r]=i[r]:n[r].constructor===Object&&i[r].constructor===Object?o(n[r],i[r]):n[r]=i[r])}try{var n=decodeURIComponent("%7B%0A%22ResourceTiming%22%3A%7B%0A%22comment%22%3A%20%22Clear%20RT%20Buffer%20on%20mPulse%20beacon%22%2C%0A%22clearOnBeacon%22%3A%20true%0A%7D%2C%0A%22AutoXHR%22%3A%7B%0A%22comment%22%3A%20%22Monitor%20XHRs%20requested%20using%20FETCH%22%2C%0A%22monitorFetch%22%3A%20true%2C%0A%22comment%22%3A%20%22Start%20Monitoring%20SPAs%20from%20Click%22%2C%0A%22spaStartFromClick%22%3A%20true%0A%7D%2C%0A%22PageParams%22%3A%7B%0A%22comment%22%3A%20%22Monitor%20all%20SPA%20XHRs%22%2C%0A%22spaXhr%22%3A%20%22all%22%0A%7D%0A%7D");if(n.length>0&&window.JSON&&"function"==typeof window.JSON.parse){var i=JSON.parse(n);void 0!==window.BOOMR_config?o(window.BOOMR_config,i):window.BOOMR_config=i}}catch(r){window.console&&"function"==typeof window.console.error&&console.error("mPulse: Could not parse configuration",r)}}();</script>
                              <script>!function(a){var e="https://s.go-mpulse.net/boomerang/",t="addEventListener";if("True"=="True")a.BOOMR_config=a.BOOMR_config||{},a.BOOMR_config.PageParams=a.BOOMR_config.PageParams||{},a.BOOMR_config.PageParams.pci=!0,e="https://s2.go-mpulse.net/boomerang/";if(window.BOOMR_API_key="QAT5G-9HZLF-7EDMX-YMVCJ-QZJDA",function(){function n(e){a.BOOMR_onload=e&&e.timeStamp||(new Date).getTime()}if(!a.BOOMR||!a.BOOMR.version&&!a.BOOMR.snippetExecuted){a.BOOMR=a.BOOMR||{},a.BOOMR.snippetExecuted=!0;var i,_,o,r=document.createElement("iframe");if(a[t])a[t]("load",n,!1);else if(a.attachEvent)a.attachEvent("onload",n);r.src="javascript:void(0)",r.title="",r.role="presentation",(r.frameElement||r).style.cssText="width:0;height:0;border:0;display:none;",o=document.getElementsByTagName("script")[0],o.parentNode.insertBefore(r,o);try{_=r.contentWindow.document}catch(O){i=document.domain,r.src="javascript:var d=document.open();d.domain='"+i+"';void(0);",_=r.contentWindow.document}_.open()._l=function(){var a=this.createElement("script");if(i)this.domain=i;a.id="boomr-if-as",a.src=e+"QAT5G-9HZLF-7EDMX-YMVCJ-QZJDA",BOOMR_lstart=(new Date).getTime(),this.body.appendChild(a)},_.write("<bo"+'dy onload="document._l();">'),_.close()}}(),"400".length>0)if(a&&"performance"in a&&a.performance&&"function"==typeof a.performance.setResourceTimingBufferSize)a.performance.setResourceTimingBufferSize(400);!function(){if(BOOMR=a.BOOMR||{},BOOMR.plugins=BOOMR.plugins||{},!BOOMR.plugins.AK){var e=""=="true"?1:0,t="",n="vrnqcoqxgfvzazv6zjxa-f-d94505b2f-clientnsv4-s.akamaihd.net",i="false"=="true"?2:1,_={"ak.v":"37","ak.cp":"641057","ak.ai":parseInt("462050",10),"ak.ol":"0","ak.cr":22,"ak.ipv":4,"ak.proto":"h2","ak.rid":"cc21872","ak.r":44193,"ak.a2":e,"ak.m":"x","ak.n":"essl","ak.bpcip":"172.91.1.0","ak.cport":55911,"ak.gh":"23.200.82.22","ak.quicv":"","ak.tlsv":"tls1.3","ak.0rtt":"","ak.csrc":"-","ak.acc":"","ak.t":"1723779694","ak.ak":"hOBiQwZUYzCg5VSAfCLimQ==Ts6ILBIIdzGi+WKHJN+ggUy5F5Q/LMqqO8x8gmMP7c6zSYdpGziN6AYOytd8iuhNbDlttold9Lxqs8KEndV4SkiBNiYxohvDbOqH+avibdGUXzJpS6UpibKfl0iu2pXLlfJu8gF6PK6Sdv+LljVKo93AGoYlwST7XeN0fr9OxS4av6kzEdBi4BMwccD61tQceuE7nt5vT8C4/LqfjEsCf2tc9b0Ht+Tqjv/W1HPxTHG5+gZj+mGlJP4OTpcdhTz55gmT20Vg/CdKBfuo81je50TncBpZqgShtnl5TVX+suBb+y3KLvlp+dl2dH1HR/fjo6IxwY0ti7XeHIWb1zfOI/qiaXQtTuAq+TfaqAJgVEakYueoIriHp7kAh/qJj9q13N+pxE036Xp/acIvpkNg+eXy0tAUopIcLrK2YFHdEdM=","ak.pv":"63","ak.dpoabenc":"","ak.tf":i};if(""!==t)_["ak.ruds"]=t;var o={i:!1,av:function(e){var t="http.initiator";if(e&&(!e[t]||"spa_hard"===e[t]))_["ak.feo"]=void 0!==a.aFeoApplied?1:0,BOOMR.addVar(_)},rv:function(){var a=["ak.bpcip","ak.cport","ak.cr","ak.csrc","ak.gh","ak.ipv","ak.m","ak.n","ak.ol","ak.proto","ak.quicv","ak.tlsv","ak.0rtt","ak.r","ak.acc","ak.t","ak.tf"];BOOMR.removeVar(a)}};BOOMR.plugins.AK={akVars:_,akDNSPreFetchDomain:n,init:function(){if(!o.i){var a=BOOMR.subscribe;a("before_beacon",o.av,null,null),a("onbeacon",o.rv,null,null),o.i=!0}return this},is_complete:function(){return!0}}}}()}(window);</script></head>
<body>
<!--*|IF:MC_PREVIEW_TEXT|*-->
<!--[if !gte mso 9]><!----><span class="mcnPreviewText" style="display:none; font-size:0px; line-height:0px; max-height:0px; max-width:0px; opacity:0; overflow:hidden; visibility:hidden; mso-hide:all;">*|MC_PREVIEW_TEXT|*</span><!--<![endif]-->
<!--*|END:IF|*-->
<center>
<table border="0" cellpadding="0" cellspacing="0" height="100%" width="100%" id="bodyTable" style="background-color: rgb(244, 244, 244);">
<tbody><tr>
<td class="bodyCell" align="center" valign="top">
<table id="root" border="0" cellpadding="0" cellspacing="0" width="100%"><tbody data-block-id="9" class="mceWrapper"><tr><td align="center" valign="top" class="mceWrapperOuter"><!--[if (gte mso 9)|(IE)]><table align="center" border="0" cellspacing="0" cellpadding="0" width="660" style="width:660px;"><tr><td><![endif]--><table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width:660px" role="presentation"><tbody><tr><td style="background-color:#ffffff;background-position:center;background-repeat:no-repeat;background-size:cover" class="mceWrapperInner" valign="top"><table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" role="presentation" data-block-id="8"><tbody><tr class="mceRow"><td style="background-position:center;background-repeat:no-repeat;background-size:cover" valign="top"><table border="0" cellpadding="0" cellspacing="0" width="100%" role="presentation"><tbody><tr><td style="padding-top:0;padding-bottom:0" class="mceColumn" data-block-id="-4" valign="top" colspan="12" width="100%"><table border="0" cellpadding="0" cellspacing="0" width="100%" role="presentation"><tbody><tr><td style="padding-top:12px;padding-bottom:12px;padding-right:0;padding-left:0" class="mceBlockContainer" align="center" valign="top"><span class="mceImageBorder" style="border:0;border-radius:0;vertical-align:top;margin:0"><img data-block-id="11" width="561" height="auto" style="width:561px;height:auto;max-width:660px !important;border-radius:0;display:block" alt="" src="https://mcusercontent.com/c2dbbc77bc1870468d52b840d/images/b6efadd2-1deb-ee05-2a29-5636b9110e41.png" role="presentation" class="imageDropZone mceImage"/></span></td></tr><tr><td style="padding-top:0;padding-bottom:0;padding-right:0;padding-left:0" valign="top"><table width="100%" style="border:0;border-radius:0;border-collapse:separate"><tbody><tr><td style="padding-left:24px;padding-right:24px;padding-top:12px;padding-bottom:12px" class="mceTextBlockContainer"><div data-block-id="3" class="mceText" id="dataBlockId-3" style="width:100%"><p style="text-align: left;" class="last-child">${content}</p></div></td></tr></tbody></table></td></tr><tr><td style="background-color:#f4f4f4;padding-top:8px;padding-bottom:8px;padding-right:8px;padding-left:8px" class="mceLayoutContainer" valign="top"><table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" role="presentation" data-block-id="7" id="section_ea0bc1c0de2bf20ef1c4b4d6100b856e" class="mceFooterSection"><tbody><tr class="mceRow"><td style="background-color:#f4f4f4;background-position:center;background-repeat:no-repeat;background-size:cover;padding-top:0px;padding-bottom:0px" valign="top"><table border="0" cellpadding="0" cellspacing="12" width="100%" role="presentation"><tbody><tr><td style="padding-top:0;padding-bottom:0" class="mceColumn" data-block-id="-3" valign="top" colspan="12" width="100%"><table border="0" cellpadding="0" cellspacing="0" width="100%" role="presentation"><tbody><tr><td style="padding-top:0;padding-bottom:0;padding-right:0;padding-left:0" align="center" valign="top"><table width="100%" style="border:0;border-radius:0;border-collapse:separate"><tbody><tr><td style="padding-left:16px;padding-right:16px;padding-top:12px;padding-bottom:12px" class="mceTextBlockContainer"><div data-block-id="5" class="mceText" id="dataBlockId-5" style="display:inline-block;width:100%"><p class="last-child"><%asm_group_unsubscribe_url%></p></div></td></tr></tbody></table></td></tr><tr><td class="mceLayoutContainer" align="center" valign="top"><table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" role="presentation" data-block-id="-2"><tbody><tr class="mceRow"><td style="background-position:center;background-repeat:no-repeat;background-size:cover;padding-top:0px;padding-bottom:0px" valign="top"><table border="0" cellpadding="0" cellspacing="24" width="100%" role="presentation"><tbody></tbody></table></td></tr></tbody></table></td></tr></tbody></table></td></tr></tbody></table></td></tr></tbody></table></td></tr></tbody></table></td></tr></tbody></table></td></tr></tbody></table></td></tr></tbody></table><!--[if (gte mso 9)|(IE)]></td></tr></table><![endif]--></td></tr></tbody></table>
</td>
</tr>
</tbody></table>
</center>
<script type="text/javascript"  src="/73C29E/6L/Aj/A8Dm/w6QYPLHRYIRYk/ifQ1pkzrLGfXiOLE/UVReGQE/RWlLIWF/JUQU"></script></body></html>`
}