# Sentinel Journal

## 2024-05-24 - Second-Order SQL Injection via SQLite Dynamic Typing

**Vulnerability:** Second-Order SQL Injection in the `/api/recommendations` endpoint.
**Learning:** SQLite's dynamic typing allows strings to be stored in `INTEGER` columns (like `videoId` in the `views` table). If an attacker injects a string into a "numeric" column, and that value is later used in an SQL query without parameterization (e.g., `IN (${ids.join(',')})`), it leads to SQL injection. The assumption that data coming from an `INTEGER` column is safe to concatenate is dangerous in SQLite.
**Prevention:** Always use parameterized queries, even for array inputs in `IN` clauses (generate placeholders like `?, ?, ?`). Never trust data from the database to be safe for re-use in new queries if the original insertion wasn't strictly typed or validated, or if the database engine allows type flexibility.
