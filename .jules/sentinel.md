## 2026-02-03 - Second Order SQL Injection via SQLite Type Affinity
**Vulnerability:** Second Order SQL Injection in `/api/recommendations` endpoint.
**Learning:** SQLite's Type Affinity allows strings to be stored in INTEGER columns. Input validation was missing in `/api/videos/:id/view`, allowing malicious SQL fragments to be stored in the `views` table (videoId column). These fragments were later concatenated directly into a SQL query in the recommendation logic, leading to SQL injection.
**Prevention:** Always use parameterized queries, even for values retrieved from the database (Defense in Depth). Strictly validate input types before insertion (e.g., ensure IDs are integers).
