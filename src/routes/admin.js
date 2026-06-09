import { Router } from "express";
import bcrypt from "bcrypt";
import { validationResult } from "express-validator";
import { requireAuth } from "../middleware/auth.js";
import { createCoffee, deleteCoffee, findCoffeeById, listCoffees, updateCoffee } from "../repositories/coffees.js";
import { createEvent, deleteEvent, findEventById, listEvents, updateEvent } from "../repositories/events.js";
import { listOrders } from "../repositories/orders.js";
import { findUserByEmail } from "../repositories/users.js";
import { coffeeIdRule, coffeeRules } from "../validators/coffee.js";
import { eventIdRule, eventRules } from "../validators/event.js";
import { loginRules } from "../validators/auth.js";

export const adminRouter = Router();

// Whitelisted flash messages — only known codes are shown (never raw query text).
const NOTICES = {
  "kohvisort-lisatud": "Kohvisort lisatud.",
  "kohvisort-muudetud": "Kohvisort uuendatud.",
  "kohvisort-kustutatud": "Kohvisort kustutatud.",
  "syndmus-lisatud": "Sündmus lisatud.",
  "syndmus-muudetud": "Sündmus uuendatud.",
  "syndmus-kustutatud": "Sündmus kustutatud."
};

function eventFormData(body = {}) {
  return {
    date_label: body.date_label || "",
    title: body.title || "",
    location: body.location || "",
    spots_free: body.spots_free ?? "",
    spots_total: body.spots_total ?? ""
  };
}

function coffeeFormData(body = {}) {
  return {
    nimi: body.nimi || "",
    paritolu: body.paritolu || "",
    rostitase: body.rostitase || "",
    maitseprofiil: body.maitseprofiil || "",
    hind: body.hind || "",
    kaal: body.kaal || "250 g",
    kirjeldus: body.kirjeldus || "",
    pilt: body.pilt || ""
  };
}

adminRouter.get("/login", (req, res) => {
  if (req.session.userId) {
    res.redirect("/admin");
    return;
  }
  res.render("admin/login", { title: "Admin login" });
});

adminRouter.post("/login", loginRules, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).render("admin/login", { title: "Admin login", errors: errors.array(), form: req.body });
    return;
  }

  const user = findUserByEmail(req.body.email);
  if (!user || !(await bcrypt.compare(req.body.password, user.password_hash))) {
    res.status(401).render("admin/login", {
      title: "Admin login",
      errors: [{ msg: "Vale e-post või parool" }],
      form: req.body
    });
    return;
  }

  req.session.regenerate((err) => {
    if (err) {
      res.status(500).render("admin/login", {
        title: "Admin login",
        errors: [{ msg: "Sisselogimine ebaõnnestus" }],
        form: req.body
      });
      return;
    }
    req.session.userId = user.id;
    res.redirect("/admin");
  });
});

adminRouter.post("/logout", requireAuth, (req, res) => {
  req.session.destroy(() => {
    res.clearCookie("slow_pour_sid");
    res.redirect("/admin/login");
  });
});

adminRouter.get("/", requireAuth, (req, res) => {
  res.render("admin/index", {
    title: "Admin",
    coffees: listCoffees(),
    orders: listOrders(),
    events: listEvents(),
    notice: NOTICES[req.query.teade] || null
  });
});

adminRouter.get("/kohvisordid/new", requireAuth, (req, res) => {
  res.render("admin/coffee-form", {
    title: "Lisa kohvisort",
    action: "/admin/kohvisordid",
    coffee: coffeeFormData()
  });
});

adminRouter.post("/kohvisordid", requireAuth, coffeeRules, (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).render("admin/coffee-form", {
      title: "Lisa kohvisort",
      action: "/admin/kohvisordid",
      coffee: coffeeFormData(req.body),
      errors: errors.array()
    });
    return;
  }

  createCoffee(req.body);
  res.redirect("/admin?teade=kohvisort-lisatud");
});

adminRouter.get("/kohvisordid/:id/edit", requireAuth, coffeeIdRule, (req, res) => {
  const errors = validationResult(req);
  const coffee = errors.isEmpty() ? findCoffeeById(req.params.id) : null;
  if (!coffee) {
    res.status(404).render("pages/simple", { title: "Ei leitud", heading: "Kohvisorti ei leitud" });
    return;
  }

  res.render("admin/coffee-form", {
    title: "Muuda kohvisorti",
    action: `/admin/kohvisordid/${coffee.id}`,
    coffee
  });
});

adminRouter.post("/kohvisordid/:id", requireAuth, coffeeIdRule, coffeeRules, (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).render("admin/coffee-form", {
      title: "Muuda kohvisorti",
      action: `/admin/kohvisordid/${req.params.id}`,
      coffee: { id: req.params.id, ...coffeeFormData(req.body) },
      errors: errors.array()
    });
    return;
  }

  const coffee = updateCoffee(req.params.id, req.body);
  if (!coffee) {
    res.status(404).render("pages/simple", { title: "Ei leitud", heading: "Kohvisorti ei leitud" });
    return;
  }
  res.redirect("/admin?teade=kohvisort-muudetud");
});

adminRouter.post("/kohvisordid/:id/delete", requireAuth, coffeeIdRule, (req, res) => {
  const errors = validationResult(req);
  if (errors.isEmpty()) deleteCoffee(req.params.id);
  res.redirect("/admin?teade=kohvisort-kustutatud");
});

/* ---- Sündmused (events) CRUD --------------------------------------------- */
adminRouter.get("/sundmused/new", requireAuth, (req, res) => {
  res.render("admin/event-form", {
    title: "Lisa sündmus",
    action: "/admin/sundmused",
    event: eventFormData()
  });
});

adminRouter.post("/sundmused", requireAuth, eventRules, (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).render("admin/event-form", {
      title: "Lisa sündmus",
      action: "/admin/sundmused",
      event: eventFormData(req.body),
      errors: errors.array()
    });
    return;
  }
  createEvent(req.body);
  res.redirect("/admin?teade=syndmus-lisatud");
});

adminRouter.get("/sundmused/:id/edit", requireAuth, eventIdRule, (req, res) => {
  const errors = validationResult(req);
  const event = errors.isEmpty() ? findEventById(req.params.id) : null;
  if (!event) {
    res.status(404).render("pages/simple", { title: "Ei leitud", heading: "Sündmust ei leitud" });
    return;
  }
  res.render("admin/event-form", {
    title: "Muuda sündmust",
    action: `/admin/sundmused/${event.id}`,
    event
  });
});

adminRouter.post("/sundmused/:id", requireAuth, eventIdRule, eventRules, (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).render("admin/event-form", {
      title: "Muuda sündmust",
      action: `/admin/sundmused/${req.params.id}`,
      event: { id: req.params.id, ...eventFormData(req.body) },
      errors: errors.array()
    });
    return;
  }
  const event = updateEvent(req.params.id, req.body);
  if (!event) {
    res.status(404).render("pages/simple", { title: "Ei leitud", heading: "Sündmust ei leitud" });
    return;
  }
  res.redirect("/admin?teade=syndmus-muudetud");
});

adminRouter.post("/sundmused/:id/delete", requireAuth, eventIdRule, (req, res) => {
  const errors = validationResult(req);
  if (errors.isEmpty()) deleteEvent(req.params.id);
  res.redirect("/admin?teade=syndmus-kustutatud");
});
