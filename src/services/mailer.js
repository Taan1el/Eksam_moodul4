import nodemailer from "nodemailer";
import { config } from "../config.js";

export async function sendContactMessage({ name, email, message }) {
  if (config.nodeEnv !== "production" || !config.smtp.host) {
    console.log("Contact message", { name, email, message });
    return;
  }

  const transporter = nodemailer.createTransport({
    host: config.smtp.host,
    port: config.smtp.port,
    secure: config.smtp.secure,
    auth: {
      user: config.smtp.user,
      pass: config.smtp.pass
    }
  });

  await transporter.sendMail({
    to: config.smtp.to,
    from: config.smtp.from,
    replyTo: email,
    subject: "Slow Pour kontaktivorm",
    text: `Nimi: ${name}\nE-post: ${email}\n\n${message}`
  });
}
