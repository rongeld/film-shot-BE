const nodemailer = require('nodemailer');
const htmltotext = require('html-to-text');

module.exports = class Email {
  constructor(user, url) {
    this.to = user.email;
    this.firstName = user.firstName;
    this.url = url;
    this.from = 'Film Shot <andrew.zakrevskiy@gmail.com>';
  }

  newTransport() {
    if (process.env.NODE_ENV === 'production') {
      return nodemailer.createTransport({
        service: 'SendGrid',
        auth: {
          user: process.env.SENDGRID_USERNAME,
          pass: process.env.SENDGRID_PASSWORD
        }
      });
    }

    return nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD
      }
    });
  }

  async send(template, subject) {
    // send the actual email

    const htmlTemplate = require(`../views/${template}`);

    const mailOptions = {
      from: this.from,
      to: this.to,
      subject,
      text: htmltotext.fromString(htmlTemplate(this.firstName, this.url)),
      html: htmlTemplate(this.firstName, this.url)
    };

    await this.newTransport().sendMail(mailOptions);
  }

  async sendWelcome() {
    await this.send('welcomeEmail', 'Welcome to the Film Shot family!');
  }

  async sendPasswordReset() {
    await this.send(
      'passwordReset',
      'Reset password at Film Shot (valid 10 minutes)'
    );
  }
};
