## 2024-05-23 - [Second-Order SQL Injection in SQLite]
**Vulnerability:** Second-order SQL injection in `/api/recommendations` where `watchedVideoIds` (derived from `views` table) were concatenated into a query.
**Learning:** SQLite's dynamic typing allows strings to be stored in INTEGER columns. Input validation on `INSERT` is not enough if the data is later used insecurely. Even internal data must be treated as untrusted if it originated from a user.
**Prevention:** Always use parameterized queries, even for array inputs (`IN` clauses). Use `?,?,?` generation for dynamic lists.
