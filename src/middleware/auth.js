import { findUserById } from "../repositories/users.js";

export function requireAuth(req, res, next) {
  if (!req.session.userId) {
    res.status(401).json({ error: "Login required" });
    return;
  }

  const user = findUserById(req.session.userId);
  if (!user) {
    req.session.destroy(() => {});
    res.status(401).json({ error: "Login required" });
    return;
  }

  req.user = user;
  next();
}
