import nodemailer from "nodemailer";

export default function createMailer() {
    return nodemailer.createTransport({
        host: "smtp.mail.ru",
        port: 465,
        secure: true,
        auth: {
            user: process.env.MAIL_LOGIN,
            pass: process.env.MAIL_PASS,
        },
    });
}