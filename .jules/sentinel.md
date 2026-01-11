## 2024-05-20 - Second-Order SQL Injection in Recommendations

**Vulnerability:** Found a Second-Order SQL Injection in the `/api/recommendations` endpoint. The application allowed inserting non-integer strings into the `views.videoId` column (which is an INTEGER column but SQLite is dynamically typed). These strings were then concatenated unsafely into a `NOT IN (...)` clause in a subsequent query.

**Learning:** Even if a column is defined as INTEGER, SQLite allows storing strings. If these values are later used in a query without parameterization (thinking "it's just numbers from the DB"), it opens up SQL injection vectors. This is a classic "Second-Order" or "Stored" SQL Injection.

**Prevention:** Always use parameterized queries, even when the data comes from your own database, especially if the database allows flexible typing like SQLite. Never trust data just because it's "inside" the system.