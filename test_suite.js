/**
 * Automated Test Suite for Lab 3 API
 * Runs all test cases defined in the Postman collection.
 */
const http = require('http');
const app = require('./server');

function makeRequest(options, postData) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        let parsed;
        try {
          parsed = JSON.parse(body);
        } catch (e) {
          parsed = body;
        }
        resolve({ status: res.statusCode, data: parsed, headers: res.headers });
      });
    });

    req.on('error', reject);

    if (postData) {
      req.write(typeof postData === 'string' ? postData : JSON.stringify(postData));
    }
    req.end();
  });
}

async function runTests() {
  console.log('\n--- STARTING LAB 3 AUTOMATED TESTS ---\n');
  let passed = 0;
  let failed = 0;

  function assert(condition, testName) {
    if (condition) {
      console.log(`[PASS] ${testName}`);
      passed++;
    } else {
      console.error(`[FAIL] ${testName}`);
      failed++;
    }
  }

  try {
    // 1. GET /books (default)
    const res1 = await makeRequest({ hostname: 'localhost', port: 3000, path: '/books', method: 'GET' });
    assert(res1.status === 200 && Array.isArray(res1.data) && res1.data.length === 8, '1. GET /books returns 200 and all 8 books');

    // 2. GET /books?search_q=Code
    const res2 = await makeRequest({ hostname: 'localhost', port: 3000, path: '/books?search_q=Code', method: 'GET' });
    assert(res2.status === 200 && res2.data.length === 1 && res2.data[0].title === 'Clean Code', '2. GET /books?search_q=Code partial title LIKE match');

    // 3. GET /books?order_by=price&order=DESC
    const res3 = await makeRequest({ hostname: 'localhost', port: 3000, path: '/books?order_by=price&order=DESC', method: 'GET' });
    assert(res3.status === 200 && res3.data[0].price >= res3.data[1].price, '3. GET /books?order_by=price&order=DESC sorts descending by price');

    // 4. GET /books?min_price=10&max_price=30
    const res4 = await makeRequest({ hostname: 'localhost', port: 3000, path: '/books?min_price=10&max_price=30', method: 'GET' });
    const allInRange = res4.data.every(b => b.price >= 10 && b.price <= 30);
    assert(res4.status === 200 && allInRange, '4. GET /books?min_price=10&max_price=30 filters price range properly');

    // 5. GET /books?limit=2&offset=0
    const res5 = await makeRequest({ hostname: 'localhost', port: 3000, path: '/books?limit=2&offset=0', method: 'GET' });
    assert(res5.status === 200 && res5.data.length === 2, '5. GET /books?limit=2&offset=0 pagination limits to 2 items');

    // 6. GET /books/1
    const res6 = await makeRequest({ hostname: 'localhost', port: 3000, path: '/books/1', method: 'GET' });
    assert(res6.status === 200 && res6.data.id === 1, '6. GET /books/1 returns 200 and book with id 1');

    // 7. GET /books/999 (Non-existent ID)
    const res7 = await makeRequest({ hostname: 'localhost', port: 3000, path: '/books/999', method: 'GET' });
    assert(res7.status === 404 && res7.data.message.includes('not found'), '7. GET /books/999 returns 404 and consistent message');

    // 8. POST /books (Valid creation)
    const res8 = await makeRequest(
      { hostname: 'localhost', port: 3000, path: '/books', method: 'POST', headers: { 'Content-Type': 'application/json' } },
      { title: 'Designing Data-Intensive Applications', author: 'Martin Kleppmann', price: 45.99 }
    );
    assert(res8.status === 201 && res8.data.book.title === 'Designing Data-Intensive Applications', '8. POST /books returns 201 Created and book object');

    // 9. POST /books (Validation: missing title)
    const res9 = await makeRequest(
      { hostname: 'localhost', port: 3000, path: '/books', method: 'POST', headers: { 'Content-Type': 'application/json' } },
      { author: 'Martin Kleppmann', price: 45.99 }
    );
    assert(res9.status === 400 && res9.data.message.includes('title'), '9. POST /books rejects missing title with 400');

    // 10. POST /books (Validation: missing author)
    const res10 = await makeRequest(
      { hostname: 'localhost', port: 3000, path: '/books', method: 'POST', headers: { 'Content-Type': 'application/json' } },
      { title: 'Some Title', price: 45.99 }
    );
    assert(res10.status === 400 && res10.data.message.includes('author'), '10. POST /books rejects missing author with 400');

    // 11. POST /books (Validation: non-numeric price)
    const res11 = await makeRequest(
      { hostname: 'localhost', port: 3000, path: '/books', method: 'POST', headers: { 'Content-Type': 'application/json' } },
      { title: 'Some Title', author: 'Some Author', price: 'invalid_price' }
    );
    assert(res11.status === 400 && res11.data.message.includes('price'), '11. POST /books rejects non-numeric price with 400');

    // 12. PUT /books/1 (Update success)
    const res12 = await makeRequest(
      { hostname: 'localhost', port: 3000, path: '/books/1', method: 'PUT', headers: { 'Content-Type': 'application/json' } },
      { title: 'The Great Gatsby (Special Edition)', author: 'F. Scott Fitzgerald', price: 14.99 }
    );
    assert(res12.status === 200 && res12.data.book.title.includes('Special Edition'), '12. PUT /books/1 returns 200 and updated book');

    // 13. PUT /books/999 (Update non-existent)
    const res13 = await makeRequest(
      { hostname: 'localhost', port: 3000, path: '/books/999', method: 'PUT', headers: { 'Content-Type': 'application/json' } },
      { title: 'Ghost Book', author: 'Nobody', price: 10.00 }
    );
    assert(res13.status === 404 && res13.data.message.includes('not found'), '13. PUT /books/999 returns 404 Not Found');

    // 14. DELETE /books/2 (Delete success)
    const res14 = await makeRequest({ hostname: 'localhost', port: 3000, path: '/books/2', method: 'DELETE' });
    assert(res14.status === 200 && res14.data.message.includes('deleted'), '14. DELETE /books/2 returns 200 and success message');

    // 15. DELETE /books/999 (Delete non-existent)
    const res15 = await makeRequest({ hostname: 'localhost', port: 3000, path: '/books/999', method: 'DELETE' });
    assert(res15.status === 404 && res15.data.message.includes('not found'), '15. DELETE /books/999 returns 404 Not Found');

    console.log(`\n--- TEST RESULTS: ${passed} PASSED, ${failed} FAILED ---`);
    process.exit(failed > 0 ? 1 : 0);
  } catch (err) {
    console.error('Test execution error:', err);
    process.exit(1);
  }
}

// Give server 500ms to listen before starting tests
setTimeout(runTests, 500);
