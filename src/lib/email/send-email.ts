import nodemailer from 'nodemailer';

type EmailOptions = {
    html?: string;
    attachments?: nodemailer.SendMailOptions['attachments'];
};

export const sendEmail = async (
    userEmail: string,
    subject: string,
    text: string,
    options?: EmailOptions
) => {
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
    });

    const mailOptions: nodemailer.SendMailOptions = {
        from: `"Eventory, Inc" <${process.env.EMAIL_USER}>`,
        to: userEmail,
        subject,
        text,
        ...(options?.html && { html: options.html }),
        ...(options?.attachments && { attachments: options.attachments }),
    };

    await transporter.sendMail(mailOptions);
};
