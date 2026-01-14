## 2024-03-24 - Second Order SQL Injection via Dynamic Typing
**Vulnerability:** A second-order SQL injection was possible because malicious strings stored in an INTEGER column (`views.videoId`) were trusted and concatenated directly into a `NOT IN (...)` clause in a recommendation query.
**Learning:** SQLite's dynamic typing allows storing strings in INTEGER columns, meaning database schema types cannot be trusted for input validation. The vulnerability was triggered only when the stored malicious data was retrieved and used in a subsequent query.
**Prevention:** Always use parameterized queries, even for data retrieved from the database. Enforce strict input validation (e.g., regex checks for integers) at the API boundary before insertion.
