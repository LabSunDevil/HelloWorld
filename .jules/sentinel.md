## 2026-01-21 - Second Order SQL Injection via SQLite Type Affinity
**Vulnerability:** A second-order SQL injection vulnerability was found in the recommendations endpoint. Malicious strings stored in the `views` table (via the `videoId` column) were later concatenated directly into a SQL query.
**Learning:** SQLite's dynamic typing allowed strings to be stored in an `INTEGER` column without error. The assumption that data from the database (especially numeric columns) is safe to interpolate led to this vulnerability.
**Prevention:** Always use parameterized queries, even for data retrieved from the database or for `IN (...)` clauses. Never trust data type definitions in SQLite to enforce data integrity.
