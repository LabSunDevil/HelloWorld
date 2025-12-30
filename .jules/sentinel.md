## 2024-01-01 - [Second-Order SQL Injection in Recommendations]
**Vulnerability:** User input (`videoId` in `views` table) was trusted and interpolated directly into a SQL query in `/api/recommendations`. Since SQLite allows strings in INTEGER columns, a malicious string could be stored and later injected.
**Learning:** Even data coming from the database (like view history) cannot be trusted if the insertion logic is permissive or if the database schema (SQLite dynamic typing) allows unexpected types.
**Prevention:** Always use parameterized queries (placeholders `?`) for ALL variable data in SQL queries, including `IN` clauses with arrays. Never use string interpolation or concatenation for values.
