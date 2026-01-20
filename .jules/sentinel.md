## 2024-10-12 - Second Order SQL Injection via SQLite Type Affinity

**Vulnerability:** Second-order SQL injection in `/api/recommendations` via `watchedVideoIds`. The application interpolated a list of IDs retrieved from the `views` table directly into a SQL query string.
**Learning:** SQLite's dynamic type system (type affinity) allows storing strings in columns defined as INTEGER. An attacker could inject a malicious string into the `videoId` column of the `views` table via the `/api/videos/:id/view` endpoint. The backend assumed these values were safe integers when retrieving them later.
**Prevention:** Treat data retrieved from the database as untrusted. Always use parameterized queries, even for values originating from your own database. For `NOT IN` clauses with variable-length arrays, dynamically generate the required number of placeholders (e.g., `?, ?, ?`).
