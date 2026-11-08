# Lab 3: Viva Questions & Model Answers

Backend Development Fundamentals · Year II Term II · Aurora  
Faculty: Joel Prashanth D

---

### Question 1: Query parameter vs Path parameter?

| Feature | Path Parameter | Query Parameter |
| :--- | :--- | :--- |
| **Where it appears** | Embedded directly in the URL path segment (e.g., `/books/42`) | Appended to the URL after a `?` symbol as key-value pairs (e.g., `/books?search_q=code&order=DESC`) |
| **Primary Purpose** | **Identifies a specific resource** (e.g., a unique book with ID 42). | **Filters, sorts, searches, or paginates** a collection of resources. |
| **Mandatory / Optional** | Usually **mandatory** to locate the exact resource. Omitting it changes the endpoint entirely (e.g., `/books/` vs `/books/42`). | Usually **optional** with default values fallback (e.g., default `limit=10`, default `order=ASC`). |
| **Access in Express** | `req.params.id` | `req.query.search_q`, `req.query.order` |
| **Example** | `GET /books/:id` -> `GET /books/5` | `GET /books?min_price=10&max_price=50&order_by=price` |

**Summary Rule of Thumb:**  
- Use **Path Parameters** to tell the server *which entity* you want (`/books/10`).  
- Use **Query Parameters** to tell the server *how* you want the list presented (`/books?limit=5&sort=price`).

---

### Question 2: What does "stateless" mean in REST architecture?

**Answer:**  
In a RESTful architecture, **statelessness** means that the server does **not store any client session context** between consecutive requests.

Key Characteristics:
1. **Self-Contained Requests:** Every single request sent by a client to the server must contain all the information necessary for the server to understand and process that request (such as authorization headers, parameters, and request body).
2. **No Session Memory on Server:** The server treats every request as brand new; it does not rely on memory from previous interactions (e.g., the server doesn't remember that the user logged in 5 minutes ago without inspecting the token sent in the current request).
3. **Benefits of Statelessness:**
   - **Scalability:** Any available server in a load-balanced cluster can handle any request because no server holds unique session state.
   - **Reliability & Simplicity:** A server crash does not lose user state, and recovering from failures is straightforward.
   - **Cacheability:** Independent requests with identical parameters can be easily cached by intermediaries, proxies, or browsers.

---

### Question 3: Which status code is used for bad input vs a missing record?

**Answer:**

1. **For Bad Input:** `400 Bad Request`
   - **When to use:** When the client sends malformed syntax, missing mandatory fields, invalid data types, or violated business logic rules (e.g., missing `title`, `author`, or providing a non-numeric string for `price`).
   - **Example response:**
     ```json
     HTTP/1.1 400 Bad Request
     Content-Type: application/json

     {
       "message": "Validation failed: \"price\" is required and must be a valid non-negative number."
     }
     ```

2. **For a Missing Record:** `404 Not Found`
   - **When to use:** When the client's request is syntactically valid and properly formatted, but the requested resource or ID does not exist in the database (e.g., requesting `GET /books/999` when no book with `id = 999` exists).
   - **Example response:**
     ```json
     HTTP/1.1 404 Not Found
     Content-Type: application/json

     {
       "message": "Book with id 999 not found"
     }
     ```

---

### Bonus Viva Concepts (Often asked by Faculty):
- **Why use Parameterized Queries instead of String Concatenation?**  
  *Answer:* Parameterized queries (using `?`) ensure user input is treated strictly as data and never parsed as executable SQL commands, completely preventing **SQL Injection (SQLi)** attacks.
- **Why return `201 Created` instead of `200 OK` for POST?**  
  *Answer:* HTTP `201 Created` specifically signals that a new resource was successfully minted on the server, usually accompanied by the new resource's URI or payload.
- **Why whitelist `order_by` columns instead of using `?` placeholders?**  
  *Answer:* SQLite / SQL does not allow table or column names to be parameterized with `?` in `ORDER BY` clauses. Therefore, whitelisting against an allowed array (`['id', 'title', 'author', 'price']`) guarantees safe dynamic sorting without SQL injection vulnerabilities.
