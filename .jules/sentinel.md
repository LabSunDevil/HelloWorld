## 2024-05-23 - [SQL Injection in Array Handling]
**Vulnerability:** Second-order SQL injection found in `server/server.js` where `watchedVideoIds` (derived from DB content) was concatenated into a `NOT IN (...)` clause.
**Learning:** Even data retrieved from the database should be treated as untrusted if it could have been tampered with or if the column type (SQLite dynamic typing) allows unexpected values. Array joins in SQL construction are a common pitfall.
**Prevention:** Always use parameterized queries, even for array inputs (`IN` clauses). Use dynamic placeholder generation (e.g., `ids.map(() => '?').join(',')`) instead of string interpolation.
