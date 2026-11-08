require('dotenv').config();
const express = require('express');
const { getDB } = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware for parsing JSON request bodies
app.use(express.json());

// Helper validation function for Book payload
function validateBookPayload(req, res, next) {
  const { title, author, price } = req.body;

  if (!title || typeof title !== 'string' || title.trim() === '') {
    return res.status(400).json({
      message: 'Validation failed: "title" is required and must be a non-empty string.'
    });
  }

  if (!author || typeof author !== 'string' || author.trim() === '') {
    return res.status(400).json({
      message: 'Validation failed: "author" is required and must be a non-empty string.'
    });
  }

  if (price === undefined || price === null || typeof price === 'boolean' || isNaN(Number(price)) || Number(price) < 0) {
    return res.status(400).json({
      message: 'Validation failed: "price" is required and must be a valid non-negative number.'
    });
  }

  // Attach sanitized data to request
  req.validatedBook = {
    title: title.trim(),
    author: author.trim(),
    price: Number(price)
  };

  next();
}

/* ==========================================================================
   REST API ENDPOINTS (/books)
   ========================================================================== */

/**
 * Task 1, 2, 3: GET /books
 * Supports query parameters:
 *  - search_q: partial title match (LIKE %query%) [default: ""]
 *  - order_by: column to sort by (id, title, author, price) [default: "id"]
 *  - order: sort direction (ASC, DESC) [default: "ASC"]
 *  - limit: pagination limit [default: 10]
 *  - offset: pagination offset [default: 0]
 *  - min_price: minimum price filter [optional]
 *  - max_price: maximum price filter [optional]
 */
app.get('/books', async (req, res, next) => {
  try {
    const db = await getDB();
    const {
      search_q = '',
      order_by = 'id',
      order = 'ASC',
      limit = 10,
      offset = 0,
      min_price,
      max_price
    } = req.query;

    const conditions = [];
    const params = [];

    // 1. Partial title search using LIKE
    if (search_q && search_q.trim() !== '') {
      conditions.push('title LIKE ?');
      params.push(`%${search_q.trim()}%`);
    }

    // 2. Price range filter using BETWEEN or two conditions
    const hasMin = min_price !== undefined && min_price !== '';
    const hasMax = max_price !== undefined && max_price !== '';

    if (hasMin && hasMax) {
      const min = Number(min_price);
      const max = Number(max_price);
      if (isNaN(min) || isNaN(max)) {
        return res.status(400).json({ message: 'Validation failed: min_price and max_price must be numbers.' });
      }
      if (min > max) {
        return res.status(400).json({ message: 'Validation failed: min_price cannot be greater than max_price.' });
      }
      conditions.push('price BETWEEN ? AND ?');
      params.push(min, max);
    } else if (hasMin) {
      const min = Number(min_price);
      if (isNaN(min)) {
        return res.status(400).json({ message: 'Validation failed: min_price must be a valid number.' });
      }
      conditions.push('price >= ?');
      params.push(min);
    } else if (hasMax) {
      const max = Number(max_price);
      if (isNaN(max)) {
        return res.status(400).json({ message: 'Validation failed: max_price must be a valid number.' });
      }
      conditions.push('price <= ?');
      params.push(max);
    }

    // 3. Assemble WHERE clause
    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    // 4. Safe sorting whitelist (guards against SQL injection in ORDER BY)
    const allowedColumns = ['id', 'title', 'author', 'price'];
    const sanitizedOrderBy = allowedColumns.includes(String(order_by).toLowerCase())
      ? String(order_by).toLowerCase()
      : 'id';

    const sanitizedOrder = String(order).toUpperCase() === 'DESC' ? 'DESC' : 'ASC';

    // 5. Pagination validation
    const parsedLimit = parseInt(limit, 10);
    const safeLimit = !isNaN(parsedLimit) && parsedLimit > 0 ? parsedLimit : 10;

    const parsedOffset = parseInt(offset, 10);
    const safeOffset = !isNaN(parsedOffset) && parsedOffset >= 0 ? parsedOffset : 0;

    params.push(safeLimit, safeOffset);

    // 6. Execute parameterized query
    const sql = `
      SELECT * FROM books
      ${whereClause}
      ORDER BY ${sanitizedOrderBy} ${sanitizedOrder}
      LIMIT ? OFFSET ?
    `;

    const books = await db.all(sql, params);
    return res.status(200).json(books);
  } catch (error) {
    next(error);
  }
});

/**
 * GET /books/:id
 * Retrieve a single book by ID
 */
app.get('/books/:id', async (req, res, next) => {
  try {
    const db = await getDB();
    const { id } = req.params;

    const book = await db.get('SELECT * FROM books WHERE id = ?', [id]);
    if (!book) {
      return res.status(404).json({ message: `Book with id ${id} not found` });
    }

    return res.status(200).json(book);
  } catch (error) {
    next(error);
  }
});

/**
 * Task 4 & 5: POST /books
 * Create a new book record with validation
 * Returns status 201 on success, 400 on invalid payload
 */
app.post('/books', validateBookPayload, async (req, res, next) => {
  try {
    const db = await getDB();
    const { title, author, price } = req.validatedBook;

    const result = await db.run(
      'INSERT INTO books (title, author, price) VALUES (?, ?, ?)',
      [title, author, price]
    );

    const createdBook = await db.get('SELECT * FROM books WHERE id = ?', [result.lastID]);

    return res.status(201).json({
      message: 'Book created successfully',
      book: createdBook
    });
  } catch (error) {
    next(error);
  }
});

/**
 * Task 5: PUT /books/:id
 * Update an existing book by ID
 * Returns status 200 on success, 404 if ID doesn't exist, 400 on invalid payload
 */
app.put('/books/:id', validateBookPayload, async (req, res, next) => {
  try {
    const db = await getDB();
    const { id } = req.params;
    const { title, author, price } = req.validatedBook;

    // Check if book exists
    const existingBook = await db.get('SELECT * FROM books WHERE id = ?', [id]);
    if (!existingBook) {
      return res.status(404).json({ message: `Book with id ${id} not found` });
    }

    await db.run(
      'UPDATE books SET title = ?, author = ?, price = ? WHERE id = ?',
      [title, author, price, id]
    );

    const updatedBook = await db.get('SELECT * FROM books WHERE id = ?', [id]);

    return res.status(200).json({
      message: 'Book updated successfully',
      book: updatedBook
    });
  } catch (error) {
    next(error);
  }
});

/**
 * Task 5: DELETE /books/:id
 * Delete a book by ID
 * Returns status 200 on success, 404 if ID doesn't exist
 */
app.delete('/books/:id', async (req, res, next) => {
  try {
    const db = await getDB();
    const { id } = req.params;

    const existingBook = await db.get('SELECT * FROM books WHERE id = ?', [id]);
    if (!existingBook) {
      return res.status(404).json({ message: `Book with id ${id} not found` });
    }

    await db.run('DELETE FROM books WHERE id = ?', [id]);

    return res.status(200).json({
      message: `Book with id ${id} deleted successfully`
    });
  } catch (error) {
    next(error);
  }
});

/* ==========================================================================
   ERROR & 404 HANDLERS
   ========================================================================== */

// 404 Not Found handler for undefined routes
app.use((req, res) => {
  res.status(404).json({ message: `Route ${req.method} ${req.originalUrl} not found` });
});

// Centralized error handler (consistent JSON error response)
app.use((err, req, res, next) => {
  console.error('Server Internal Error:', err);
  res.status(500).json({
    message: 'Internal server error occurred',
    error: err.message
  });
});

/* ==========================================================================
   SERVER INITIALIZATION & PORT CONFLICT HANDLING
   ========================================================================== */
const server = app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`[Error] Port ${PORT} is already in use (EADDRINUSE).`);
    console.error(`To fix: Stop the existing process or set another port, e.g., PORT=3001 npm start`);
    process.exit(1);
  } else {
    throw err;
  }
});

module.exports = app;
