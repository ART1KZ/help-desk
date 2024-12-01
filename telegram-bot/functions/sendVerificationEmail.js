import createMailer from "./createMailer.js";

export default async function sendVerificationEmail(email, code) {
    const transporter = createMailer();
    try {
        await transporter.sendMail({
            from: '"Help Desk" <KailHet@mail.ru>',
            to: email,
            subject: "Верификация аккаунта",
            text: `Код подтверждения: ${code}`,
        });
        return true;
    } catch (error) {
        console.error("Ошибка отправки письма:", error);
        return false;
    }
}