import dotenv from "dotenv";

dotenv.config();

export const config = {
  nodeEnv: process.env.NODE_ENV || "development",
  port: Number(process.env.PORT || 3004),
  sessionSecret: process.env.SESSION_SECRET || "development-session-secret",
  databasePath: process.env.DATABASE_PATH || "./data/slow-pour.sqlite",
  smtp: {
    host: process.env.SMTP_HOST || "",
    port: Number(process.env.SMTP_PORT || 587),
    secure: process.env.SMTP_SECURE === "true",
    user: process.env.SMTP_USER || "",
    pass: process.env.SMTP_PASS || "",
    to: process.env.CONTACT_TO || "",
    from: process.env.CONTACT_FROM || ""
  }
};
