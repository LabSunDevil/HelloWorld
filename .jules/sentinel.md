## 2025-02-18 - Second Order SQL Injection via SQLite Type Affinity
**Vulnerability:** The application used `NOT IN (${array.join(',')})` in SQL queries, assuming the array contained integers from a `views` table. However, SQLite's dynamic typing allowed storing strings (malicious payloads) in the `INTEGER` column `videoId` of the `views` table via an unvalidated API endpoint.
**Learning:** In SQLite, column type definitions are advisory. Input validation is crucial even for "internal" data or data stored in typed columns. Relying on database constraints for type safety is insufficient with SQLite.
**Prevention:**
1. Always use parameterized queries, even for arrays (e.g., `NOT IN (?,?,?)`).
2. Strictly validate all inputs before storage (e.g., `req.params.id` must be an integer).
