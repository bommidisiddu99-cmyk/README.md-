const { getDB } = require('./db');

async function seed() {
  try {
    const db = await getDB();

    console.log('Resetting books table...');
    await db.exec('DROP TABLE IF EXISTS books;');
    await db.exec(`
      CREATE TABLE books (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        author TEXT NOT NULL,
        price REAL NOT NULL
      );
    `);

    const initialBooks = [
      { title: 'The Great Gatsby', author: 'F. Scott Fitzgerald', price: 10.99 },
      { title: 'To Kill a Mockingbird', author: 'Harper Lee', price: 12.50 },
      { title: '1984', author: 'George Orwell', price: 9.99 },
      { title: 'Pride and Prejudice', author: 'Jane Austen', price: 8.99 },
      { title: 'The Catcher in the Rye', author: 'J.D. Salinger', price: 11.25 },
      { title: 'Clean Code', author: 'Robert C. Martin', price: 35.00 },
      { title: 'The Pragmatic Programmer', author: 'David Thomas', price: 42.50 },
      { title: 'JavaScript: The Good Parts', author: 'Douglas Crockford', price: 25.00 }
    ];

    for (const book of initialBooks) {
      await db.run(
        'INSERT INTO books (title, author, price) VALUES (?, ?, ?)',
        [book.title, book.author, book.price]
      );
    }

    const count = await db.get('SELECT COUNT(*) AS total FROM books');
    console.log(`Successfully seeded ${count.total} books into database.`);
    process.exit(0);
  } catch (error) {
    console.error('Failed to seed database:', error);
    process.exit(1);
  }
}

seed();
