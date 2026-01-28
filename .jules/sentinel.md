## 2024-05-23 - Second Order SQL Injection via SQLite Type Affinity
**Vulnerability:** Found a Second Order SQL Injection vulnerability in the recommendations endpoint. The application allowed storing malicious strings in the `views` table (which has a `videoId` column defined as INTEGER) because SQLite uses dynamic typing. These strings were later concatenated unsafely into a `NOT IN (...)` SQL clause in the recommendations logic.
**Learning:** Type affinity in SQLite is advisory, not mandatory. Defining a column as INTEGER does not prevent strings from being stored. Developers must strictly validate input types in the application layer, especially when using SQLite.
**Prevention:**
1. Strict input validation (ensure IDs are integers).
2. Always use parameterized queries, even for dynamic lists (e.g. `NOT IN (?, ?, ...)`).
3. Do not rely on database schema constraints for type safety in SQLite.
