# Sentinel Journal

## 2024-10-26 - [Dynamic Typing in SQLite]
**Vulnerability:** Second-order SQL injection in `views` table.
**Learning:** SQLite's dynamic typing allows storing non-integer strings in INTEGER columns, bypassing type checks if not strictly validated before insertion.
**Prevention:** Strictly validate input types in application logic before passing to database, even if using parameterized queries for insertion, especially when those values are later used in complex queries.
