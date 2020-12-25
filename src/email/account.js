const sgMail = require('@sendgrid/mail')
const sendGridAPIKey = 

sgMail.setApiKey(process.env.SENDGRID_API_KEY)

const sendWelcomeEmail = (name, email) => {
    const msg = {
      to: email,
      from: 'imamhosssain@gmail.com',
      subject: 'Thanks for joining in!',
      html: `<h1>Welcome to Task App, <strong>${name}</strong></h1> <p>Let me know how you get along with the app!</p>`,
    }
    sgMail
    .send(msg)
    .then(() => console.log(`Welcome Email Sent to the new user ${name}.`))
    .catch(e => console.log(e.response.body) )
}
const sendCancelationEmail = (name, email) => {
  const msg = {
    to: email,
    from: 'imamhosssain@gmail.com',
    subject: 'Sorry to see you go!',
    html: `<h1>Good Bye, <strong>${name}</strong></h1> <p>Hope you have enjoyed the time with the <strong>Task App</strong>. Let me know if you have any suggestion!</p>`,
  }
  sgMail
    .send(msg)
    .then(() => console.log(`Farewell Email Sent to the user ${name}.`))
    .catch((e) => console.log(e.response.body))
}
module.exports = {
    sendWelcomeEmail,
    sendCancelationEmail
}