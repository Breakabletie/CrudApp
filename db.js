//database
const path = require('path');
const crypto = require('crypto');
const { DatabaseSync } = require('node:sqlite');
const fs = require('fs');
const inventoryPath = path.join(__dirname, 'inventory.db');
const inventoryExists = fs.existsSync(inventoryPath);
const inventory = new DatabaseSync(inventoryPath);
//create inventory
function initTables() {
    inventory.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      first_name TEXT NOT NULL,
      last_name TEXT NOT NULL,
      username TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      item_name TEXT NOT NULL,
      description TEXT NOT NULL,
      quantity INTEGER NOT NULL DEFAULT 1,
      FOREIGN KEY (user_id) REFERENCES users(id)
    );
  `);
}
initTables();
//encrpyt passwordsd
function encryptPassword(password) {
    return crypto.createHash('sha256').update(password).digest('hex');
}
//seeder fucntion
function seedInventory() {
    inventory.exec('DELETE FROM items;');
    inventory.exec('DELETE FROM users;');
    console.log('seeding...');
    const insertUser = inventory.prepare(`
    INSERT INTO users (first_name, last_name, username, password)
    VALUES (?, ?, ?, ?)
    `);
    const insertItem = inventory.prepare(`
    INSERT INTO items (user_id, item_name, description, quantity)
    VALUES (?, ?, ?, ?)
    `);
    //default password
    const defaultPassword = encryptPassword('password123');
    //user 1
    const res1 = insertUser.run('Alexandre', 'Johnsonson', 'alexj', defaultPassword);
    const alexId = Number(res1.lastInsertRowid);
    insertItem.run(
        alexId,
        'Ergonomic Desk Chair',
        'High-back mesh chair with adjustable lumbar support and 3D armrests for long coding sessions.',
        12
    );
    insertItem.run(
        alexId,
        'Gaming Monitor',
        'A 34-inch 144Hz refresh rate, vibrant IPS color display, and built-in suitable for gaming.',
        5
    );
    insertItem.run(
        alexId,
        'Wireless Mechanical Keyboard',
        'Custom tactile mechanical switches with RGB backlighting.',
        20
    );
    //user 2
    const res2 = insertUser.run('Saphira', 'Connors', 'sconnor', defaultPassword);
    const sarahId = Number(res2.lastInsertRowid);
    insertItem.run(
        sarahId,
        'Noise-Cancelling Headphones',
        'Wireless headphones with active noise cancellation, 30 hour battery life, and surround sound.',
        8
    );
    insertItem.run(
        sarahId,
        'Dual Monitor Arm Stand',
        'Aluminum spring dual monitor desk mount with cable management channels that support screens up to 32 inches.',
        14
    );
    //user3
    const res3 = insertUser.run('David', 'Kimov', 'dkim', defaultPassword);
    const davidId = Number(res3.lastInsertRowid);
    insertItem.run(
        davidId,
        'USB-C Multiport Hub',
        'Compact USB-C adapter featuring 4K video output, 100W Power Delivery charging, SD/microSD card reader, and three USB 3.0 ports.',
        25
    );
    insertItem.run(
        davidId,
        'Adjustable Standing Desk Converter',
        'Smooth pneumatic height-adjustable tabletop workstation designed to comfortably fit dual monitors and a full-size keyboard with mouse tray.',
        6
    );
    console.log('Seeding complete, inventory is ready with 3 users and 7 items.');
}
//seed if no database
function isInventory() {
    if (!inventoryExists) {
        seedInventory();
    }
}
isInventory();
//database funcs
//does username exist
function findUsername(username) {
    return inventory.prepare('SELECT * FROM users WHERE LOWER(username) = LOWER(?)')
        .get(username.trim());
}
//reg new user
function createUser(first_name, last_name, username, password) {
    const encrptdPassword = encryptPassword(password);
    const info = inventory.prepare('INSERT INTO users (first_name, last_name, username, password) VALUES (?,?,?,?)');
    const result = info.run(first_name.trim(), last_name.trim(), username.trim(), encrptdPassword);
    return {
        id: Number(result.lastInsertRowid),
        first_name: first_name.trim(),
        last_name: last_name.trim(),
        username: username.trim()
    };
}
//login
function userLogin(username, password) {
    const encptdPassword = encryptPassword(password);
    const user = inventory.prepare('SELECT * FROM users WHERE LOWER(username) = LOWER(?) AND password = ?')
        .get(username.trim(), encptdPassword);
    if (!user) return null;
    return {
        id: user.id,
        first_name: user.first_name,
        last_name: user.last_name,
        username: user.username
    };
}
//get all items
function getAllItems() {
    const search = `
        SELECT
            items.id,
            items.user_id AS userId,
            items.item_name AS itemName,
            items.description,
            items.quantity,
            users.first_name AS ownerFirstName,
            users.last_name AS ownerLastName,
            users.username AS ownerUsername
        FROM items
        JOIN users ON items.user_id = users.id
        ORDER BY items.id DESC
    `;
    return inventory.prepare(search).all();
}
//get 1 item
function getItem(itemId) {
    const search = `
        SELECT
            items.id,
            items.user_id AS userId,
            items.item_name AS itemName,
            items.description,
            items.quantity,
            users.first_name AS ownerFirstName,
            users.last_name AS ownerLastName,
            users.username AS ownerUsername
        FROM items
        JOIN users ON items.user_id = users.id
        WHERE items.id = ?
    `;
    return inventory.prepare(search).get(itemId);
}
//get user items
function userItems(userId) {
    const search = `
        SELECT
            items.id,
            items.user_id AS userId,
            items.item_name AS itemName,
            items.description,
            items.quantity,
            users.first_name AS ownerFirstName,
            users.last_name AS ownerLastName,
            users.username AS ownerUsername
        FROM items
        JOIN users ON items.user_id = users.id
        WHERE items.user_id = ?
        ORDER BY items.id DESC
    `;
    return inventory.prepare(search).all(userId);
}
//create item
function newItem(userId, itemName, desc, quantity) {
    const item = inventory.prepare(`
        INSERT INTO items (user_id, item_name, description, quantity)
        VALUES (?, ?, ?, ?)
    `);
    const result = item.run(Number(userId), itemName.trim(), desc.trim(), Number(quantity));
    return Number(result.lastInsertRowid);
}
//edit item
function editItem(itemId, itemName, description, quantity) {
    const edit = inventory.prepare(`
        UPDATE items
        SET item_name = ?, description = ?, quantity = ?
        WHERE id = ?
    `);
    edit.run(itemName.trim(), description.trim(), Number(quantity), itemId);
}
//delete item
function deleteItem(itemId) {
    inventory.prepare('DELETE FROM items WHERE id = ?').run(itemId);
}
//seed from terminal
if (require.main === module) { seedInventory(); }

//export
module.exports = {
    inventory, isInventory, seedInventory, encryptPassword, findUserName, createUser, userLogin, getAllItems, getItem, userItems, newItem, editItem, deleteItem
};