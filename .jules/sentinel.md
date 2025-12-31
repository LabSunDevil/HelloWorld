## 2025-12-31 - [Second-Order SQL Injection in Recommendations]
**Vulnerability:** Found a Second-Order SQL Injection vulnerability in the `/api/recommendations` endpoint. The `watchedVideoIds` array, derived from the `views` table, was being directly concatenated into a SQL `NOT IN` clause. While `videoId` is conceptually an integer, SQLite's dynamic typing allowed malicious strings to be stored via a lack of input validation on the `/api/videos/:id/view` endpoint.
**Learning:** Data retrieved from the database should not be trusted implicitly, especially in dynamically typed databases like SQLite. Second-order injections occur when "trusted" stored data is used insecurely in subsequent queries.
**Prevention:**
1. Always use parameterized queries (e.g., `?` placeholders), even for data coming from the database.
2. For `IN` or `NOT IN` clauses with variable arrays, dynamically generate the correct number of placeholders (e.g., `ids.map(() => '?').join(',')`).
3. Validate all inputs at the API boundary (e.g., ensuring IDs are integers) to prevent malicious data from entering the system (Defense in Depth).
