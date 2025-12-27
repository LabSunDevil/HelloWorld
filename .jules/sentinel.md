## 2024-02-14 - [Second-Order SQL Injection via SQLite Dynamic Typing]
**Vulnerability:** SQLite allows storing strings in INTEGER columns due to dynamic typing. An attacker could insert a malicious SQL payload into the `views.videoId` column (declared INTEGER) via a vulnerable endpoint. This payload was later retrieved and blindly concatenated into a `NOT IN (...)` clause in a different query, leading to Second-Order SQL Injection.
**Learning:** Database schema declarations (like INTEGER) in SQLite are not strict constraints. Always treat data retrieved from the database as untrusted, especially when constructing new SQL queries dynamically.
**Prevention:**
1. Use parameterized queries for ALL inputs, even those coming from the database.
2. For variable-length lists (like `IN` or `NOT IN` clauses), dynamically generate the placeholder string (`?, ?, ?`) and pass the values as parameters.
