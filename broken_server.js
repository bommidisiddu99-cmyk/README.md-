/**
 * BROKEN VERSION (Handed out by Faculty for Debugging Exercise)
 * This file contains 4 intentional bugs:
 *   1. Wrong import path (MODULE_NOT_FOUND)
 *   2. Missing await (Sends pending Promise / fails to await DB query)
 *   3. Table-name typo ("no such table: bokks")
 *   4. Port conflict (EADDRINUSE hardcoded without fallback)
 */

const express = require('express');

// BUG 1: WRONG IMPORT PATH
// The file is located at './db.js', but this tries to load from './database/db'
// Throws: Error: Cannot find module './database/db' (MODULE_NOT_FOUND)
const { getDB } = require('./database/db'); 

const app = express();
app.use(express.json());

// BUG 2: MISSING AWAIT
// The db.all() method is asynchronous and returns a Promise.
// Omitting 'await' causes 'books' to be a pending Promise object {}.
// Express then sends an empty object {} or crashes with unexpected behavior!
app.get('/books', async (req, res) => {
  const db = await getDB();
  const books = db.all('SELECT * FROM books'); // <-- MISSING AWAIT HERE!
  res.status(200).json(books);
});

// BUG 3: TABLE-NAME TYPO
// The table name in SQLite is 'books', but here it is misspelled as 'bokks'
// Throws: SQLITE_ERROR: no such table: bokks
app.post('/books', async (req, res) => {
  const db = await getDB();
  const { title, author, price } = req.body;
  // Typo in table name: 'bokks' instead of 'books'
  const result = await db.run('INSERT INTO bokks (title, author, price) VALUES (?, ?, ?)', [title, author, price]);
  res.status(201).json({ id: result.lastID });
});

// BUG 4: PORT CONFLICT (EADDRINUSE)
// Hardcoded port without environment variable override (process.env.PORT)
// or handling for EADDRINUSE error. If another server is running on 3000, crashes.
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Broken server attempting to listen on port ${PORT}`);
});
