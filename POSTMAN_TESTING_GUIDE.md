# Lab 3: Postman Test List & Testing Evidence

This document contains the complete test suite for **Lab 3: REST API, query parameters, validation, debugging**.

Base URL: `http://localhost:3000`

---

## Summary of Test Cases

| # | HTTP Method | Endpoint | Query / Body Payload | Expected Status | Purpose / Description |
|---|-------------|----------|----------------------|-----------------|-----------------------|
| 1 | `GET` | `/books` | None (Defaults: limit=10, order_by=id, order=ASC) | `200 OK` | Fetch all books with default pagination & sorting |
| 2 | `GET` | `/books` | `?search_q=Code` | `200 OK` | Partial title search using SQL `LIKE` |
| 3 | `GET` | `/books` | `?order_by=price&order=DESC` | `200 OK` | Sort records by price descending |
| 4 | `GET` | `/books` | `?min_price=10&max_price=30` | `200 OK` | Price range filtering using `BETWEEN` |
| 5 | `GET` | `/books` | `?limit=2&offset=0` | `200 OK` | Pagination limit and offset (Page 1) |
| 6 | `GET` | `/books/1` | None | `200 OK` | Fetch single book by valid ID |
| 7 | `GET` | `/books/999` | None | `404 Not Found` | Fetch single book by non-existent ID |
| 8 | `POST` | `/books` | Valid JSON payload | `201 Created` | Create new book successfully |
| 9 | `POST` | `/books` | Missing `title` | `400 Bad Request` | Validation failure: Missing title |
| 10 | `POST` | `/books` | Missing `author` | `400 Bad Request` | Validation failure: Missing author |
| 11 | `POST` | `/books` | Non-numeric `price` (`"abc"`) | `400 Bad Request` | Validation failure: Non-numeric price |
| 12 | `PUT` | `/books/1` | Valid JSON payload | `200 OK` | Update existing book successfully |
| 13 | `PUT` | `/books/999` | Valid JSON payload | `404 Not Found` | Update non-existent book |
| 14 | `PUT` | `/books/1` | Missing `title` | `400 Bad Request` | Validation failure on update |
| 15 | `DELETE` | `/books/2` | None | `200 OK` | Delete existing book successfully |
| 16 | `DELETE` | `/books/999` | None | `404 Not Found` | Delete non-existent book |

---

## Detailed Test Specifications

### 1. GET /books (Default Parameters)
- **Method:** `GET`
- **URL:** `http://localhost:3000/books`
- **Expected Status:** `200 OK`
- **Expected Response:**
```json
[
  { "id": 1, "title": "The Great Gatsby", "author": "F. Scott Fitzgerald", "price": 10.99 },
  { "id": 2, "title": "To Kill a Mockingbird", "author": "Harper Lee", "price": 12.5 },
  ...
]
```

---

### 2. GET /books?search_q=Code (Search Partial Match)
- **Method:** `GET`
- **URL:** `http://localhost:3000/books?search_q=Code`
- **Expected Status:** `200 OK`
- **Expected Response:**
```json
[
  { "id": 6, "title": "Clean Code", "author": "Robert C. Martin", "price": 35 }
]
```

---

### 3. GET /books?order_by=price&order=DESC (Sorting)
- **Method:** `GET`
- **URL:** `http://localhost:3000/books?order_by=price&order=DESC`
- **Expected Status:** `200 OK`
- **Expected Response:** (Highest priced book first: The Pragmatic Programmer $42.50)

---

### 4. GET /books?min_price=10&max_price=30 (Price Range Filter)
- **Method:** `GET`
- **URL:** `http://localhost:3000/books?min_price=10&max_price=30`
- **Expected Status:** `200 OK`
- **Expected Response:** Only books where price is between 10.00 and 30.00 inclusive.

---

### 5. GET /books?limit=2&offset=0 (Pagination)
- **Method:** `GET`
- **URL:** `http://localhost:3000/books?limit=2&offset=0`
- **Expected Status:** `200 OK`
- **Expected Response:** Array containing the first 2 books.

---

### 6. GET /books/1 (Get Book by ID - Success)
- **Method:** `GET`
- **URL:** `http://localhost:3000/books/1`
- **Expected Status:** `200 OK`
- **Expected Response:**
```json
{
  "id": 1,
  "title": "The Great Gatsby",
  "author": "F. Scott Fitzgerald",
  "price": 10.99
}
```

---

### 7. GET /books/999 (Get Book by Non-Existent ID - 404)
- **Method:** `GET`
- **URL:** `http://localhost:3000/books/999`
- **Expected Status:** `404 Not Found`
- **Expected Response:**
```json
{
  "message": "Book with id 999 not found"
}
```

---

### 8. POST /books (Create Book - Success 201)
- **Method:** `POST`
- **URL:** `http://localhost:3000/books`
- **Headers:** `Content-Type: application/json`
- **Body:**
```json
{
  "title": "Designing Data-Intensive Applications",
  "author": "Martin Kleppmann",
  "price": 45.99
}
```
- **Expected Status:** `201 Created`
- **Expected Response:**
```json
{
  "message": "Book created successfully",
  "book": {
    "id": 9,
    "title": "Designing Data-Intensive Applications",
    "author": "Martin Kleppmann",
    "price": 45.99
  }
}
```

---

### 9. POST /books (Validation: Missing Title)
- **Method:** `POST`
- **URL:** `http://localhost:3000/books`
- **Headers:** `Content-Type: application/json`
- **Body:**
```json
{
  "author": "Martin Kleppmann",
  "price": 45.99
}
```
- **Expected Status:** `400 Bad Request`
- **Expected Response:**
```json
{
  "message": "Validation failed: \"title\" is required and must be a non-empty string."
}
```

---

### 10. POST /books (Validation: Non-numeric Price)
- **Method:** `POST`
- **URL:** `http://localhost:3000/books`
- **Headers:** `Content-Type: application/json`
- **Body:**
```json
{
  "title": "Free Book",
  "author": "Anonymous",
  "price": "not_a_number"
}
```
- **Expected Status:** `400 Bad Request`
- **Expected Response:**
```json
{
  "message": "Validation failed: \"price\" is required and must be a valid non-negative number."
}
```

---

### 11. PUT /books/1 (Update Book - Success 200)
- **Method:** `PUT`
- **URL:** `http://localhost:3000/books/1`
- **Headers:** `Content-Type: application/json`
- **Body:**
```json
{
  "title": "The Great Gatsby (Special Edition)",
  "author": "F. Scott Fitzgerald",
  "price": 14.99
}
```
- **Expected Status:** `200 OK`
- **Expected Response:**
```json
{
  "message": "Book updated successfully",
  "book": {
    "id": 1,
    "title": "The Great Gatsby (Special Edition)",
    "author": "F. Scott Fitzgerald",
    "price": 14.99
  }
}
```

---

### 12. PUT /books/999 (Update Non-Existent Book - 404)
- **Method:** `PUT`
- **URL:** `http://localhost:3000/books/999`
- **Headers:** `Content-Type: application/json`
- **Body:**
```json
{
  "title": "Does not exist",
  "author": "Ghost",
  "price": 10.00
}
```
- **Expected Status:** `404 Not Found`
- **Expected Response:**
```json
{
  "message": "Book with id 999 not found"
}
```

---

### 13. DELETE /books/2 (Delete Book - Success 200)
- **Method:** `DELETE`
- **URL:** `http://localhost:3000/books/2`
- **Expected Status:** `200 OK`
- **Expected Response:**
```json
{
  "message": "Book with id 2 deleted successfully"
}
```

---

### 14. DELETE /books/999 (Delete Non-Existent Book - 404)
- **Method:** `DELETE`
- **URL:** `http://localhost:3000/books/999`
- **Expected Status:** `404 Not Found`
- **Expected Response:**
```json
{
  "message": "Book with id 999 not found"
}
```
