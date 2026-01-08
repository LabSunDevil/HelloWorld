## 2024-05-23 - SQLite Dynamic Typing SQL Injection
**Vulnerability:** Second-order SQL Injection via `views` table.
**Learning:** SQLite's dynamic typing allows strings to be stored in INTEGER columns. This meant that `videoId` in the `views` table could hold a malicious SQL string. When this value was read back and interpolated into the `NOT IN (...)` clause in `/api/recommendations`, it executed the injected SQL.
**Prevention:** Always use parameterized queries (placeholders `?`), even for data coming from the database, especially when constructing `IN` or `NOT IN` clauses. Never assume data from the DB is safe or strictly typed in SQLite.
