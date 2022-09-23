const nodemailer = require('nodemailer');
const pug = require('pug');
const juice = require('juice');
const htmlToText = require('html-to-text');
const promisify = require('promisify');

const transport = nodemailer.createTransport({
    host: process.env.MAIL_HOST,
    port: process.env.MAIL_PORT,
    auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
    },
});

transport.sendMail({
    from: 'Josh Davis <josh.davis@live.ca>',
    to: 'bhad_babie69@dogwater.com',
    subject: 'We out here TESTING',
    html: 'Hey I <strong>am bonerfied</strong> for you',
    text: 'No bonerfication here'
});

