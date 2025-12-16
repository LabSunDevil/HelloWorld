## 2024-03-24 - Second-Order SQL Injection in Recommendations
**Vulnerability:** A second-order SQL injection was found in the `/api/recommendations` endpoint. The application retrieved `videoId`s from the `views` table and interpolated them directly into a SQL query: `... NOT IN (${watchedVideoIds.join(',')})`.
**Learning:** Even internal data (like IDs from a database) cannot be trusted if the insertion path allows non-standard values. In this case, SQLite's dynamic typing allowed storing a malicious string in an `INTEGER` column, which was then retrieved and injected.
**Prevention:** Always use parameterized queries, even for lists of IDs. For `IN` clauses with dynamic lists, generate placeholders dynamically (`?, ?, ?`).
