# Sentinel's Journal

## 2025-05-10 - Second Order SQL Injection via Dynamic Typing
**Vulnerability:** Second Order SQL Injection in `server/server.js` within the recommendations logic. The code constructed a SQL query using string concatenation (`NOT IN (${watchedVideoIds.join(',')})`), assuming `watchedVideoIds` (integers from the DB) were safe.
**Learning:** SQLite's dynamic typing allows storing strings (e.g., payloads) in columns defined as `INTEGER`. A malicious user could inject a string payload into the `views.videoId` column via another endpoint (`/api/videos/:id/view`), which was then executed as code when retrieved and concatenated into the recommendations query.
**Prevention:** Always use parameterized queries, even for data retrieved from the database. Never trust data just because it's "internal". Specifically for `IN` clauses with arrays, generate a placeholder string (`?,?,?`) and pass the array elements as parameters.
