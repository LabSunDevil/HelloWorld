## 2024-05-24 - [Second-Order SQL Injection via SQLite Dynamic Typing]
**Vulnerability:** A second-order SQL injection vulnerability was found in the `/api/recommendations` endpoint. The application allowed inserting non-integer strings (e.g., `1) OR 1=1 --`) into the `views` table's `videoId` column because SQLite uses dynamic typing. This malicious string was then retrieved and directly interpolated into a `NOT IN (...)` clause in a subsequent query.
**Learning:** Even with parameterized `INSERT` queries, stored data can be dangerous if the database schema (like SQLite's) allows type flexibility and that data is later used unsafely. Trusting data from the database to be "clean" or of the correct type without verification or safe usage patterns is a risky assumption.
**Prevention:**
1. Always use parameterized queries or valid ORM methods for all SQL execution, including those using data retrieved from the database.
2. For dynamic lists (like `IN` or `NOT IN` clauses), dynamically generate the placeholder string (e.g., `?, ?, ?`) and bind the array of values.
3. Consider stricter type checking or validation at the application level before insertion, or use `STRICT` tables in newer SQLite versions.
