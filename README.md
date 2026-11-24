# Inventroy Manager CRUD App

## Stack and Architecture

- **Front-end**: **React 18** functional components with hooks and CSS3. Fully compatible with **Google Chrome**.
- **Back-end**: **ExpressJS** server with CORS and JSON body-parsing middleware.
- **Database**: **SQLite** powered by Node.js built-in `node:sqlite`.

---

## Database and ERD

The database modelts a **one to many** relationship, 1 user to many items

### 1. Users
| Column | Type | Description |
| :--- | :--- | :--- |
| `id` | INTEGER (PK) | Unique user ID |
| `first_name` | TEXT | First name of the inventory manager |
| `last_name` | TEXT | Last name of the inventory manager |
| `username` | TEXT (UNIQUE) | Unique login username |
| `password` | TEXT | SHA-256 encrypted password |

### 2. Items
| Column | Type | Description |
| :--- | :--- | :--- |
| `id` | INTEGER (PK) | Unique item ID |
| `user_id` | INTEGER (FK) | References `users(id)` |
| `item_name` | TEXT | Name of the inventory item |
| `description` | TEXT | Full description of the item |
| `quantity` | INTEGER | Available item quantity |

---

## How to run the app

1. Make sure **Node.js** (v18+) is installed on your computer.
2. In your terminal, navigate to project folder
3. Seed the database with demo users and items (optional):
   ```
   node db.js
   ```
4. Start the server(make sure npm is installed 'npm install'):
   ```
   node server.js
   ```
5. Open **Google Chrome** and visit:
   ```
   http://localhost:8080
   ```
   **NOTE**: if you are having issues with the app not working go into server.js on line 7 change the port number, I had issues with the app not starting because the port was busy

   **Note:** If you skip step 3, that's okay! The server will automatically seed the database on its first start if it detects an empty database. The `seed` command is there if you ever want to reset the data back to the original demo state.
   ---

## Pre-seeded demo accounts and items

The seed script initializes three demo manager accounts:

| Name | Username | Password | Pre-seeded Items Owned |
| :--- | :--- | :--- | :--- |
| **Alexandre Johnsonson** | `alexj` | `password123` | • Ergonomic Desk Chair (Qty: 12)<br>• Gaming Monitor (Qty: 5)<br>• Wireless Mechanical Keyboard (Qty: 20) |
| **Saphira Connors** | `sconnor` | `password123` | • Noise-Cancelling Headphones (Qty: 8)<br>• Dual Monitor Arm Stand (Qty: 14) |
| **David Kimov** | `dkim` | `password123` | • USB-C Multiport Hub (Qty: 25)<br>• Adjustable Standing Desk Converter (Qty: 6) |

---

## Project structure

```text
CrudApp/
├── index.html          # basic HTML page
├── app.jsx             # React front-end
├── mystyle.css         # Dark theme CSS styling
├── server.js           # Express REST API backend, routes & static file server
├── db.js               # SQLite database setup, schema, seed function & CRUD helpers
├── inventory.db        # SQLite database file
├── package.json        # Project metadata, dependencies & npm scripts
├── package-lock.json   # Exact dependency version lockfile
├── .gitignore          # Excludes node_modules and inventory.db from version control
└── README.md           # Project documentation and setup guide
```