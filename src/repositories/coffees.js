import { db } from "../db/database.js";

const listStatement = db.prepare(`
  SELECT id, nimi, paritolu, rostitase, maitseprofiil, hind, kaal, kirjeldus, pilt
  FROM kohvisort
  ORDER BY id ASC
`);

const findByIdStatement = db.prepare(`
  SELECT id, nimi, paritolu, rostitase, maitseprofiil, hind, kaal, kirjeldus, pilt
  FROM kohvisort
  WHERE id = ?
`);

const createStatement = db.prepare(`
  INSERT INTO kohvisort (nimi, paritolu, rostitase, maitseprofiil, hind, kaal, kirjeldus, pilt)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?)
`);

const updateStatement = db.prepare(`
  UPDATE kohvisort
  SET nimi = ?, paritolu = ?, rostitase = ?, maitseprofiil = ?, hind = ?, kaal = ?, kirjeldus = ?, pilt = ?
  WHERE id = ?
`);

const deleteStatement = db.prepare("DELETE FROM kohvisort WHERE id = ?");

export function listCoffees() {
  return listStatement.all();
}

export function findCoffeeById(id) {
  return findByIdStatement.get(id);
}

export function createCoffee(coffee) {
  const result = createStatement.run(
    coffee.nimi,
    coffee.paritolu,
    coffee.rostitase,
    coffee.maitseprofiil,
    coffee.hind,
    coffee.kaal,
    coffee.kirjeldus,
    coffee.pilt || null
  );
  return findCoffeeById(result.lastInsertRowid);
}

export function updateCoffee(id, coffee) {
  updateStatement.run(
    coffee.nimi,
    coffee.paritolu,
    coffee.rostitase,
    coffee.maitseprofiil,
    coffee.hind,
    coffee.kaal,
    coffee.kirjeldus,
    coffee.pilt || null,
    id
  );
  return findCoffeeById(id);
}

export function deleteCoffee(id) {
  return deleteStatement.run(id).changes > 0;
}
