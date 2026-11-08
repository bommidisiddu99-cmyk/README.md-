# Lab 3: Debugging Exercise & Solutions

This document details the **4 intentional bugs** handed out in the faculty's broken version of the project (`broken_server.js`), their exact symptoms, error messages, and their step-by-step solutions.

---

## 1. Wrong Import Path

### Symptom & Error
When starting the server using `node broken_server.js`, Node.js immediately crashes before starting:
```text
node:internal/modules/cjs/loader:1607
  throw err;
  ^

Error: Cannot find module './database/db'
Require stack:
- C:\Users\siddu\bdf-lab-03\broken_server.js
  code: 'MODULE_NOT_FOUND'
```

### Cause
The code attempts to require `./database/db`:
```javascript
// BROKEN:
const { getDB } = require('./database/db');
```
However, the database configuration file is named `db.js` and is located in the **root** project directory (`./db`), not inside a `database/` subfolder.

### Fix
Update the relative path to point to the actual file in the root directory:
```javascript
// FIXED:
const { getDB } = require('./db');
```

---

## 2. Missing `await`

### Symptom & Error
When sending `GET /books` via Postman or browser, the response returned is either an empty object `{}` instead of the list of books, or the database query finishes after the HTTP response has already closed.

### Cause
In modern Node.js SQLite libraries (`sqlite`), database operations like `db.all()`, `db.get()`, and `db.run()` return **Promises**.
```javascript
// BROKEN:
app.get('/books', async (req, res) => {
  const db = await getDB();
  const books = db.all('SELECT * FROM books'); // Missing await! books is Promise { <pending> }
  res.status(200).json(books); // JSON.stringify(Promise) outputs {}
});
```
Because `await` was omitted, `books` is assigned the unresolved `Promise` object rather than the array of table rows. Express serializes an unresolved Promise as `{}`.

### Fix
Add the `await` keyword before calling `db.all()`:
```javascript
// FIXED:
app.get('/books', async (req, res) => {
  const db = await getDB();
  const books = await db.all('SELECT * FROM books'); // Await waits for rows
  res.status(200).json(books);
});
```

---

## 3. Table-Name Typo (`no such table`)

### Symptom & Error
When sending a `POST /books` request to create a book, the request fails with status 500 or crashes the server with the following error:
```text
SQLITE_ERROR: no such table: bokks
```

### Cause
The table was created in SQLite with the plural name `books`. In the insert query in `broken_server.js`, the table name was misspelled as `bokks`:
```javascript
// BROKEN:
const result = await db.run(
  'INSERT INTO bokks (title, author, price) VALUES (?, ?, ?)',
  [title, author, price]
);
```

### Fix
Correct the table name in the SQL statement to match the database schema (`books`):
```javascript
// FIXED:
const result = await db.run(
  'INSERT INTO books (title, author, price) VALUES (?, ?, ?)',
  [title, author, price]
);
```

---

## 4. Port Conflict (`EADDRINUSE`)

### Symptom & Error
When running `node server.js` while an existing Node server is already running in another terminal or background process:
```text
Error: listen EADDRINUSE: address already in use :::3000
    at Server.setupListenHandle [as _listen2] (node:net:1904:16)
    at listenInCluster (node:net:1961:12)
    at Server.listen (node:net:2063:7)
Emitted 'error' event on Server instance at: ... {
  code: 'EADDRINUSE',
  errno: -4091,
  syscall: 'listen',
  address: '::',
  port: 3000
}
```

### Cause
Only one process at a time can bind to and listen on a given TCP port (e.g., port 3000). If another process is already listening on that port, the OS rejects the bind request with `EADDRINUSE`.

### Fixes

#### Approach A: Find and kill the process holding port 3000 (Windows PowerShell)
1. Find the Process ID (PID) using port 3000:
   ```powershell
   Get-NetTCPConnection -LocalPort 3000 | Select-Object OwningProcess
   ```
   Or using standard netstat:
   ```cmd
   netstat -ano | findstr :3000
   ```
2. Stop the conflicting process:
   ```powershell
   Stop-Process -Id <PID> -Force
   ```

#### Approach B: Make the port configurable via Environment Variables
Instead of hardcoding `const PORT = 3000;`, read from `process.env.PORT`:
```javascript
// FIXED:
const PORT = process.env.PORT || 3000;

const server = app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});

// Handle the error gracefully with a helpful message:
server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is busy. Run with a different port: PORT=3001 npm start`);
    process.exit(1);
  } else {
    throw err;
  }
});
```
To run on a different port without modifying code:
```powershell
$env:PORT=3001; node server.js
```
Or edit `.env`:
```text
PORT=3001
```
