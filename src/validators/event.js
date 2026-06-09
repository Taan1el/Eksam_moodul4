import { body, param } from "express-validator";
import { normalizeText } from "./normalize.js";

export const eventIdRule = [
  param("id").isInt({ min: 1 }).toInt()
];

export const eventRules = [
  body("date_label").customSanitizer(normalizeText).isLength({ min: 2, max: 60 }),
  body("title").customSanitizer(normalizeText).isLength({ min: 2, max: 120 }),
  body("location").customSanitizer(normalizeText).isLength({ min: 2, max: 120 }),
  body("spots_total").isInt({ min: 0, max: 100000 }).toInt(),
  body("spots_free")
    .isInt({ min: 0, max: 100000 })
    .toInt()
    .custom((value, { req }) => {
      if (Number(value) > Number(req.body.spots_total)) {
        throw new Error("Vabu kohti ei saa olla rohkem kui kohti kokku.");
      }
      return true;
    })
];
