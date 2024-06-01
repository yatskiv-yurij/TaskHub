import 'dotenv/config';
import nodemailer from 'nodemailer';

const PORT = process.env.PORT || 5001;

const { MONGODB_URI, SECRET_KEY, EMAIL, PASSWORD } = process.env;

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: EMAIL,
      pass: PASSWORD,
    },
});

export { PORT, MONGODB_URI, SECRET_KEY, EMAIL, transporter };