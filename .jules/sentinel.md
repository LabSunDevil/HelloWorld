## 2024-02-14 - Second Order SQL Injection via SQLite Type Affinity
**Vulnerability:** Found a Second Order SQL Injection in the `/api/recommendations` endpoint. The root cause was that SQLite allows non-integer strings to be stored in INTEGER columns (Type Affinity). A malicious string stored in `views.videoId` (via `/api/videos/:id/view`) was retrieved and injected into a subsequent query's `NOT IN (...)` clause.
**Learning:** In dynamically typed databases like SQLite, column types in the schema are hint-based. Always validate input types in the application layer (e.g., `regex` check for integers) before insertion, even if the database schema defines the column as `INTEGER`.
**Prevention:**
1.  Strictly validate all inputs (especially IDs) against expected formats.
2.  Use parameterized queries for *all* variable parts of a SQL statement, including dynamic lists (e.g., using generated placeholders `?, ?, ?`).
