const nodemailer = require('nodemailer');
const pug = require('pug');
const juice = require('juice'); // inlines CSS into html. Necessary for formatting compatability in a lot of email clients
const htmlToText = require('html-to-text'); // converts html to text
const promisify = require('es6-promisify');

const transport = nodemailer.createTransport({
    host: process.env.MAIL_HOST,
    port: process.env.MAIL_PORT,
    auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
    },
});

// for testing.  If you want to run this code just require it into any file that runs on npm start, like start.js: require('./handlers.mail)
// this will send an smtp email
// transport.sendMail({
//     from: 'Josh Davis <josh.davis@live.ca>',
//     to: 'bhad_babie69@dogwater.com',
//     subject: 'We out here TESTING',
//     html: 'Hey I <strong>am bonerfied</strong> for you',
//     text: 'No bonerfication here'
// });

const generateHTML = (filename, options = {}) => {
    // __dirname is the current directory that the program is in when it runs this function
    const html = pug.renderFile(`${__dirname}/../views/email/${filename}.pug`, options);
    // a lot of email clients need the CSS to be inline in order to render them properly
    // use juice library to do this:
    const html_with_inlined_CSS = juice(html);
    return html_with_inlined_CSS;
}

exports.send = async (options) => {
    const html = generateHTML(options.filename, options);
    const text = htmlToText.fromString(html);

    const mailOptions = {
        from: 'Josh Davis <josh.davis@live.ca>',
        to: options.user.email,
        subject: options.subject,
        html: html,
        text: text,
    };
    
    const sendMail = promisify(transport.sendMail, transport);
    return sendMail(mailOptions);
}
