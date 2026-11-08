const path = require('path');
const { open } = require('sqlite');
const sqlite3 = require('sqlite3');

const DB_PATH = path.join(__dirname, 'books.db');

let dbInstance = null;

/**
 * Initializes and returns the SQLite database connection.
 * Creates the books table if it does not already exist.
 */
async function getDB() {
  if (!dbInstance) {
    dbInstance = await open({
      filename: DB_PATH,
      driver: sqlite3.Database
    });

    // Create books table
    await dbInstance.exec(`
      CREATE TABLE IF NOT EXISTS books (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        author TEXT NOT NULL,
        price REAL NOT NULL
      );
    `);
  }
  return dbInstance;
}

module.exports = { getDB, DB_PATH };
