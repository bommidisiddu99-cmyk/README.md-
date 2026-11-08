# Lab 3: REST API, Query Parameters, Validation, and Debugging

**Backend Development Fundamentals · Year II Term II · Aurora**  
**Faculty:** Joel Prashanth D  
**Student Name:** Mokshagna Teja  
**Registration Number:** 252U1R1042  

---

## 📋 Overview
This project turns the basic CRUD routes from Lab 2 into a robust, secure, and production-grade RESTful API with:
- Standard RESTful noun conventions (`/books`)
- Dynamic query parameter handling (`search_q`, `order_by`, `order`, `limit`, `offset`)
- Price-range filtering (`min_price`, `max_price` with `BETWEEN` or comparison operators)
- Request body validation returning standard `400 Bad Request` with consistent JSON `{ "message": "..." }`
- Correct HTTP status codes (`201` for create, `200` for update/delete/read, `404` for missing records)
- Parameterized SQL queries preventing SQL injection
- Debugging fixes for the 4 common errors (EADDRINUSE, wrong import path, table-name typo, missing await)

---

## 🗂️ Project Structure

```text
bdf-lab-03/
├── .env                              # Environment configuration (ignored in git)
├── .env.example                      # Example environment variables
├── .gitignore                        # Git ignore file (excludes node_modules, .env)
├── package.json                      # Project dependencies and npm scripts
├── db.js                             # SQLite database connection & table schema
├── seed.js                           # Database reset & sample data populator
├── server.js                         # Main Express REST API server
├── broken_server.js                  # Broken version provided for debugging exercise
├── DEBUGGING_EXERCISE.md             # Detailed breakdown of all 4 bugs and solutions
├── VIVA_QUESTIONS.md                 # Clear, comprehensive answers to all viva questions
├── POSTMAN_TESTING_GUIDE.md          # Complete test list with expected inputs/outputs
└── Lab_3_REST_API.postman_collection.json  # Importable Postman Collection v2.1
```

---

## 🚀 Quick Start Guide

### 1. Install Dependencies
```bash
npm install
```

### 2. Populate Sample Data (Seed Database)
```bash
npm run seed
```
This populates the SQLite database (`books.db`) with 8 initial book records.

### 3. Run the Server
```bash
npm start
```
The server will start at: `http://localhost:3000`

---

## 📡 API Reference

### Base URL: `http://localhost:3000/books`

| Method | Endpoint | Query / Body | Success Status | Description |
| :--- | :--- | :--- | :--- | :--- |
| **GET** | `/books` | `search_q`, `order_by`, `order`, `limit`, `offset`, `min_price`, `max_price` | `200 OK` | Get books with search, sort, filter, and pagination |
| **GET** | `/books/:id` | None | `200 OK` (or `404`) | Get single book by ID |
| **POST** | `/books` | JSON: `{ title, author, price }` | `201 Created` | Create new book (400 on invalid payload) |
| **PUT** | `/books/:id` | JSON: `{ title, author, price }` | `200 OK` | Update book by ID (404 if missing, 400 if invalid) |
| **DELETE** | `/books/:id` | None | `200 OK` | Delete book by ID (404 if missing) |

---

## 🧪 Testing with Postman

1. Open **Postman**.
2. Click **Import** (top left).
3. Select `Lab_3_REST_API.postman_collection.json` located in this directory.
4. Run individual requests or use the **Collection Runner** to run all 15 tests automatically!

---

## 🔍 Debugging Exercise Summary

The faculty's broken project file (`broken_server.js`) contained four critical bugs:
1. **Wrong Import Path:** `require('./database/db')` -> Fixed to `require('./db')`.
2. **Missing `await`:** `const books = db.all(...)` -> Fixed to `const books = await db.all(...)`.
3. **Table Name Typo:** `INSERT INTO bokks` -> Fixed to `INSERT INTO books`.
4. **Port Conflict (`EADDRINUSE`):** Handled with `process.env.PORT || 3000` and error listener.

See [DEBUGGING_EXERCISE.md](file:///C:/Users/siddu/.gemini/antigravity/scratch/bdf-lab-03/DEBUGGING_EXERCISE.md) for full details.

---

## 🎓 Viva Questions

Detailed answers with comparison tables and code snippets are available in [VIVA_QUESTIONS.md](file:///C:/Users/siddu/.gemini/antigravity/scratch/bdf-lab-03/VIVA_QUESTIONS.md).
