import { db } from "../db/database.js";

const createStatement = db.prepare(`
  INSERT INTO orders (
    coffee_id, customer_name, email, phone, quantity, grind, address, notes, total_cents
  )
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

const countStatement = db.prepare("SELECT COUNT(*) AS count FROM orders");

// Newest first, with the coffee name joined in for the admin orders table.
const listStatement = db.prepare(`
  SELECT
    o.id, o.customer_name, o.email, o.phone, o.quantity, o.grind,
    o.address, o.notes, o.total_cents, o.created_at,
    k.nimi AS coffee_nimi
  FROM orders o
  LEFT JOIN kohvisort k ON k.id = o.coffee_id
  ORDER BY o.id DESC
`);

export function listOrders() {
  return listStatement.all();
}

export function createOrder(order) {
  const result = createStatement.run(
    order.coffeeId,
    order.customerName,
    order.email,
    order.phone || null,
    order.quantity,
    order.grind,
    order.address,
    order.notes || null,
    order.totalCents
  );
  return result.lastInsertRowid;
}

export function countOrders() {
  return countStatement.get().count;
}
