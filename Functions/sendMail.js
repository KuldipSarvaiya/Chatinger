import nodemailer from "nodemailer";
import { google } from "googleapis";

async function sendMail(mail,OTP) {
  // generating access token cause it has expiry
  const OAuth2Client = new google.auth.OAuth2(
    process.env.CLIENT_ID,
    process.env.CLIENT_SECRET,
    process.env.REDIRECT_URI
  );

  OAuth2Client.setCredentials({ refresh_token: process.env.REFRESH_TOKEN });

  const ACCESS_TOKEN = await OAuth2Client.getAccessToken();

  console.log("\n*******One time email api Access Token = ",ACCESS_TOKEN);

  const Transporter = nodemailer.createTransport({
    service: "gmail",
    port: 465,
    auth: {
      type: "OAuth2",
      user: process.env.MAIL_USER,
      clientId: process.env.CLIENT_ID,
      clientSecret: process.env.CLIENT_SECRET,
      refreshToken: process.env.REFRESH_TOKEN,
      accessToken: ACCESS_TOKEN,
    },
  });

  // const OTP = Math.floor(Math.random(1) * 900000 + 100000);

  const mailResult = await Transporter.sendMail({
    from: `🗨️Chat from Chatinger <${process.env.MAIL_USER}>`,
    to: mail,
    subject: `Email Verification by Chatinger🗨️`,
    text: `Email Verification OTP is ${OTP}`,
    html: `<body style='background-color:transperent;padding:5px;margin:5px;color:black;'>
      <h3>Chatinger Private Chat App</h3>
      <p>Here is Your One Time OTP : <h1>${OTP}</h1></p>
      <p>Thank you for signing and showing trust in with CHATINGER&nbsp;🗨️</p>
      <p>Get Help : ${process.env.MAIL_USER}</p>
      <p>Developed by : <i><b>Kuldip Sarvaiya</b></i></p>
    </body>`,
  });

  // if (mailResult) return OTP;

  // return new Error(mailResult);
  return 
}

export default sendMail;

// console.log(await sendMail('kuldipsarvaiya94@gmail.com'));