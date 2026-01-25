import nodemailer from 'nodemailer';

export const sendEmail = async (userEmail: string, subject : string, text: string) =>{
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
    });

    const mailOptions = {
        from: `"Eventory, Inc" <${process.env.EMAIL_USER}>`,
        to: userEmail,
        subject: subject,
        text: text,
    }

    await transporter.sendMail(mailOptions);
}
