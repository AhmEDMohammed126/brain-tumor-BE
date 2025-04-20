import nodemailer from "nodemailer";
export const sendEmailService = async ({
    to = "",
    subject = "",
    textMessage = "",
    htmlMessage = "",
    } = {}) => {
  // 1 - configure the transporter
    const transporter = nodemailer.createTransport({
        host: "localhost",
        port: 587,
        secure: false,
        auth: {
        user: "neurolight001@gmail.com",
        pass: "vahl kzfm qvgj xpym",
        },
        service: "gmail",
        tls: {
            rejectUnauthorized: false,
        },

    });

  //2-message configuration
    const info = await transporter.sendMail({
        from: "Brain tumor app",
        to,
        subject,
        text: textMessage,
        html:htmlMessage,
    });
    return info
};