## 2025-02-12 - SQLite Dynamic Typing and Second Order SQL Injection
**Vulnerability:** Second-order SQL injection in `NOT IN (...)` clause in `server/server.js`.
**Learning:** SQLite allows string values in `INTEGER` columns (dynamic typing). The application trusted that data retrieved from `views.videoId` (an INTEGER column) were safe integers and concatenated them into a subsequent SQL query. This allowed injection if the database content was previously tainted (e.g., via another injection or weak input validation).
**Prevention:** Always use parameterized queries for all inputs, including arrays in `IN` clauses (generate `?, ?, ?` placeholders). Do not rely on database schema types for security in SQLite.
