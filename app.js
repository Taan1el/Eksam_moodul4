import express from "express";
import session from "express-session";
import helmet from "helmet";
import { csrfSync } from "csrf-sync";
import nunjucks from "nunjucks";
import { config } from "./src/config.js";
import { authRouter } from "./src/routes/auth.js";
import { coffeeRouter } from "./src/routes/coffees.js";
import { contactRouter } from "./src/routes/contact.js";

const app = express();
const { csrfSynchronisedProtection, generateToken, invalidCsrfTokenError } = csrfSync({
  getTokenFromRequest: (req) => req.body._csrf || req.headers["x-csrf-token"]
});

nunjucks.configure("views", {
  autoescape: true,
  express: app
});

app.set("view engine", "njk");
app.set("trust proxy", 1);

app.use(helmet());
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(
  session({
    name: "slow_pour_sid",
    secret: config.sessionSecret,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      sameSite: "lax",
      secure: config.nodeEnv === "production"
    }
  })
);
app.use(csrfSynchronisedProtection);

app.get("/", (req, res) => {
  res.json({
    name: "Slow Pour backend",
    status: "ok"
  });
});

app.get("/csrf-token", (req, res) => {
  res.json({ csrfToken: generateToken(req) });
});

app.use("/auth", authRouter);
app.use("/kohvisordid", coffeeRouter);
app.use("/contact", contactRouter);

app.use((err, req, res, next) => {
  if (err === invalidCsrfTokenError) {
    res.status(403).json({ error: "Invalid CSRF token" });
    return;
  }
  next(err);
});

app.use((err, req, res, next) => {
  const status = err.status || 500;
  res.status(status).json({
    error: status === 500 ? "Server error" : err.message
  });
});

app.listen(config.port, () => {
  console.log(`Slow Pour backend listening on port ${config.port}`);
});
