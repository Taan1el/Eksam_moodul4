import { db } from "../db/database.js";

const listStatement = db.prepare(`
  SELECT id, date_label, title, location, spots_free, spots_total
  FROM event
  ORDER BY id ASC
`);

const findByIdStatement = db.prepare(`
  SELECT id, date_label, title, location, spots_free, spots_total
  FROM event
  WHERE id = ?
`);

const createStatement = db.prepare(`
  INSERT INTO event (date_label, title, location, spots_free, spots_total)
  VALUES (?, ?, ?, ?, ?)
`);

const updateStatement = db.prepare(`
  UPDATE event
  SET date_label = ?, title = ?, location = ?, spots_free = ?, spots_total = ?
  WHERE id = ?
`);

const deleteStatement = db.prepare("DELETE FROM event WHERE id = ?");

export function listEvents() {
  return listStatement.all();
}

export function findEventById(id) {
  return findByIdStatement.get(id);
}

export function createEvent(event) {
  const result = createStatement.run(
    event.date_label,
    event.title,
    event.location,
    event.spots_free,
    event.spots_total
  );
  return findEventById(result.lastInsertRowid);
}

export function updateEvent(id, event) {
  updateStatement.run(
    event.date_label,
    event.title,
    event.location,
    event.spots_free,
    event.spots_total,
    id
  );
  return findEventById(id);
}

export function deleteEvent(id) {
  return deleteStatement.run(id).changes > 0;
}
