import { EMAIL, transporter } from '../config/index.js';

const sendMail = async (req, res) => {
    const { to, subject, html } = req.body;

    const mailOptions = {
        from: EMAIL,
        to,
        subject,
        html,
    };
    
    try {
        await transporter.sendMail(mailOptions);
        res.status(200).json({ success: 'Email sent successfully'});
    } catch (error) {
        console.error(error);
        res.status(500).json({ error:'Internal Server Error'});
    }
}

export default sendMail;