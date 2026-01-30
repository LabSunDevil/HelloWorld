## 2026-01-30 - Second Order SQL Injection via SQLite Type Affinity
**Vulnerability:** A Second Order SQL Injection vulnerability was found in the recommendation engine. The `views` table was populated with user-controlled `videoId` strings, which were then retrieved and interpolated directly into a SQL query in the `recommendations` endpoint. This was possible because SQLite's dynamic typing allowed storing strings in an `INTEGER` column, and the input validation was missing on the ingestion endpoint.
**Learning:** SQLite does not enforce column types (Type Affinity), so treating database contents as trusted/typed is dangerous. Even data "from the database" can be a vector for SQL injection if it originated from user input and wasn't sanitized or validated.
**Prevention:**
1. Always use parameterized queries, even for values retrieved from the database.
2. Validate input types strictly (e.g., ensure IDs are integers) before insertion.
3. Be aware of database-specific behaviors (like SQLite's flexible typing) that might violate assumptions.
