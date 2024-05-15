const disposible_list=["temp-mail.org","tempmailbox.net","tempmail.net","tempail.com","tempinbox.xyz","cryptogmail.com","tempmailo.com","temp-mail.io","uranomail.es",
"mailinator.com","yopmail.com","10minutemail.com","minuteinbox.com","gateway.svk.jp","svk.jp","kuku.lu","m.kuku.lu","sparkemail.org",
"od.obagg.com","gmailnator.com","emailondeck.com","smailpro.com","10minutesemail.net","tempmail.dev","mohmal.com","tempmailed.com","anon.ws","rover.info",
"yalagmail.com","bluetmail.com","temp-mail.to","mail.gw","mailmenot.io","generator.email","emailfake.com","email-fake.com","tempmail.io","tempmail.plus","altmails.com",
"fakemail.net","tempm.com","fakemail.com","temp-inbox.com","tempmail.ninja","10minutemail.net","1secmail.com","gettempmail.com","moakt.com","tempmail.tel","tmailweb.com",
"altmails.com","anonymmail.net","etempmail.net","tempmail4me.eu","mailpoof.com","fakemail.io","randomail.io","getnada.com","multiscanner.org","disposablemail.com",
"another-temp-mail.com","linshi-email.com","uranomail.es","emailtemp.org","tempmailid.com","tempr.email","tempmail.email","hour.email","receivemail.org","tmail.gg",
"deref-mail.com","emailgenerator.org","emailley.com","temp-mail.org","dropmail.me","minuteinbox.com","zemail.me","emailnator.com","spoofbox.com","muellmail.com",
"temp-mailbox.com","hotmailbox.tk","tempo-mail.com","signupaddress.com","webmail.sbb.rs","instaddr.fun","looksecure.net","megaradical.com","tm-mail.com","ucm8.com","pimmel.top",
"privacylock.net","email1.io","another-temp-mail.co","britishpreschool.net","linux0.net","internxt.com"]


function isDisposableURL(url) {
    const domain = new URL(url).hostname;
  
    return disposible_list.includes(domain);  }
export default isDisposableURL