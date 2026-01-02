## 2024-05-22 - Second Order SQL Injection via Dynamic Typing
**Vulnerability:** SQL Injection in `/api/recommendations` endpoint where `videoId`s from the `views` table were concatenated directly into a `NOT IN (...)` clause.
**Learning:** SQLite's dynamic typing allows storing arbitrary strings in columns defined as `INTEGER`. The application assumed that values read from the `views.videoId` column were safe integers, but an attacker could inject a string payload via the `/api/videos/:id/view` endpoint (which stored `req.params.id` directly).
**Prevention:** Always use parameterized queries for ALL inputs, including data retrieved from the database. Use dynamic placeholder generation (e.g., `questions = ids.map(() => '?').join(',')`) for `IN` clauses.
