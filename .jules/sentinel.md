## 2025-12-29 - [SQLite Dynamic Typing Injection]
**Vulnerability:** Second-order SQL injection in `server.js` recommendations endpoint. Malicious strings stored in `views.videoId` (an INTEGER column) were concatenated into a `NOT IN` clause.
**Learning:** SQLite's dynamic typing allows storing strings in INTEGER columns, bypassing assumptions about data types coming from the database. Trusting "internal" database values without parameterization is dangerous.
**Prevention:** Always use parameterized queries, even for values retrieved from the database or assumed to be integers.
