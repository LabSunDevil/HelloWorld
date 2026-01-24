## 2026-01-24 - Second Order SQL Injection via SQLite Type Affinity
**Vulnerability:** Second Order SQL Injection in the recommendation engine. The `views` table allowed storing string values in the `videoId` column (Dynamic Typing), which were then retrieved and concatenated directly into a `NOT IN (...)` SQL clause in the `/api/recommendations` endpoint.
**Learning:** SQLite's flexible typing means declaring a column as `INTEGER` does not prevent string storage. Always treat data from the database as potentially tainted, especially when building dynamic queries.
**Prevention:** Use parameterized queries for ALL dynamic values, including arrays in `IN`/`NOT IN` clauses (by generating `?, ?, ?` placeholders), regardless of the source column's declared type.
