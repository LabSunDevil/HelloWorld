## 2024-05-22 - Second Order SQL Injection via SQLite Type Affinity
**Vulnerability:** Second Order SQL Injection in recommendation logic where `NOT IN` clause used string interpolation for video IDs. The vulnerability was exacerbated by SQLite's dynamic typing, which allowed non-integer strings (e.g., payloads) to be stored in the `videoId` INTEGER column of the `views` table.
**Learning:** SQLite's Type Affinity is a double-edged sword. Unlike strict-typed DBs (Postgres/MySQL), SQLite allows text in integer columns. This means input validation (checking if ID is int) at the API level is CRITICAL because the DB layer won't reject malformed data, turning it into a "logic bomb" when retrieved later.
**Prevention:**
1. Always use parameterized queries, even for arrays (generate `?,?` placeholders).
2. Validate IDs are actually integers before inserting/using them, especially with SQLite.
3. Don't trust data even if it comes from the database (Defense in Depth).
