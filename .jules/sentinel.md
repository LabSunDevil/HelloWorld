## 2024-03-21 - Second Order SQL Injection in Recommendations
**Vulnerability:** A Second Order SQL Injection vulnerability was found in the `/api/recommendations` endpoint. The `watchedVideoIds` array, derived from the `views` table, was directly interpolated into the SQL query string for the `NOT IN` clause. This allowed an attacker to inject malicious SQL commands by first inserting a crafted string into the `views` table (via the `/api/videos/:id/view` endpoint, which lacked input validation).
**Learning:** Even if data comes from the database, it should not be trusted implicitly. In SQLite, dynamic typing allows strings to be stored in INTEGER columns, bypassing schema-level type expectations. This highlights the importance of "defense in depth" – validating inputs at the API boundary AND using parameterized queries for all database interactions, including those using data retrieved from the database itself.
**Prevention:**
1. Always use parameterized queries (e.g., `?` placeholders) for all SQL queries, including `IN` and `NOT IN` clauses with variable list lengths.
2. Strictly validate all user inputs at the API entry point (e.g., ensuring IDs are integers).
3. Be aware of database-specific behaviors like SQLite's dynamic typing.
