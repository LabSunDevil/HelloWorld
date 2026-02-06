## 2026-02-06 - Second Order SQL Injection via SQLite Type Affinity

**Vulnerability:** A critical Second Order SQL Injection vulnerability was found in the `/api/recommendations` endpoint. The application trusted data retrieved from the `views` table (specifically `videoId`) to be integers, but SQLite's dynamic typing allowed storing arbitrary strings (including malicious SQL) in the `INTEGER` column. This data was then concatenated into a `NOT IN (...)` clause.

**Learning:** Database schema definitions (like `INTEGER`) in SQLite are advisory (Type Affinity), not enforced. Unlike rigid SQL databases (PostgreSQL, MySQL), SQLite will happily store text in an integer column. Relying on the database schema for type safety is insufficient.

**Prevention:**
1. Always validate input data types at the API boundary (e.g., regex checks for IDs).
2. Never trust data retrieved from the database to be safe for direct string concatenation in subsequent queries.
3. Always use parameterized queries (bind variables), even for lists (e.g., generating `?, ?, ?` placeholders dynamically).
