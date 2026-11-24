// backend
const express = require('express');
const cors = require('cors');
const path = require('path');
const inventory = require('./db.js');
const app = express();
const PORT = 8080;
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));
//auth routes
//user reg
app.post('/api/register', (req, res) => {
  const { first_name, last_name, username, password } = req.body;
  if (!first_name || !last_name || !username || !password) { //verify user input stuff
    return res.status(400).json({ error: 'Please provide First Name, Last Name, username and Password.' });
  }
  const existingUsername = inventory.findUsername(username);
  if (existingUsername) {
    return res.status(400).json({ error: 'This username already exists. Please log in or use another name.' });
  }
  const newUser = inventory.createUser(first_name, last_name, username, password);
  return res.status(201).json({ success: true, user: newUser });
});
//user login
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'Enter your username and password.' });
  }
  const user = inventory.userLogin(username, password);
  if (!user) {
    return res.status(401).json({ error: 'Invalid username/password' });
  }
  return res.status(200).json({ success: true, user });
});
//item routes
//get all items
app.get('/api/items', (req, res) => {
  const allItems = inventory.getAllItems();
  res.status(200).json(allItems);
});
//get single item
app.get('/api/items/:id', (req, res) => {
  const itemId = Number(req.params.id);
  const item = inventory.getItem(itemId);
  if (!item) {
    return res.status(404).json({ error: 'item not found' });
  }
  res.status(200).json(item);
});
//get user items
app.get('/api/my-items', (req, res) => {
  const userId = Number(req.query.userId);
  if (!userId) {
    return res.status(400).json({ error: 'user ID req' });
  }
  const myItems = inventory.userItems(userId);
  res.status(200).json(myItems);
});
//create item
app.post('/api/items', (req, res) => {
  const { userId, itemName, desc, quantity } = req.body;
  if (!userId || !itemName || !desc || !quantity) {
    return res.status(400).json({ error: 'provide all item fields' });
  }
  const newItem = inventory.newItem(userId, itemName, desc, quantity);
  res.status(201).json({ success: true, id: newItem, message: 'item created' });
});
//edit item
app.put('/api/items/:id', (req, res) => {
  const itemId = Number(req.params.id);
  const { userId, itemName, desc, quantity } = req.body;
  const existing = inventory.getItem(itemId);
  if (!existing) {
    return res.status(404).json({ error: 'item not found' });
  }
  if (existing.userId !== Number(userId)) {
    return res.status(403).json({ error: 'you can only edit your items' });
  }
  inventory.editItem(itemId, itemName, desc, quantity);
  res.status(200).json({ success: true, message: 'item updated' });
});
//delete item
app.delete('/api/items/:id', (req, res) => {
  const itemId = Number(req.params.id);
  const userId = Number(req.query.userId);
  const existing = inventory.getItem(itemId);
  if (!existing) {
    return res.status(404).json({ error: 'item not found' });
  }
  if (existing.userId !== userId) {
    return res.status(403).json({ error: 'can only delete your items' });
  }
  inventory.deleteItem(itemId);
  res.status(200).json({ success: true, message: 'item deleted' });
});
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});
const server = app.listen(PORT, () => {
  console.log(` Open Google Chrome and visit: http://localhost:${PORT}`);
});
server.on('error', (err) => {
  console.error('Server error:', err);
});


