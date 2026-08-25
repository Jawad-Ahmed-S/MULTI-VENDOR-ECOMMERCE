import nodemailer from "nodemailer"


export const sendMail = async (options) => {
    const transporter = nodemailer.createTransport(
        {
            host: process.env.SMPT_HOST,
            port: process.env.SMPT_PORT,
            // service: process.env.SMPT_SERVICE,
            auth: {
                user:process.env.SMPT_MAIL,
                pass:process.env.SMPT_PASS,
            }
            
        })
    const mailOptions = {
        from:process.SMPT_MAIL,
        to:options.email,
        subject:options.subject,
        text:options.message,
    }

    await transporter.sendMail(mailOptions);
}
