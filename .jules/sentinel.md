# Sentinel Journal

## 2025-02-19 - Second-Order SQL Injection in SQLite
**Vulnerability:** Found a Second-Order SQL Injection vulnerability in the recommendation engine. The application was retrieving `videoId`s from the `views` table and interpolating them directly into a `NOT IN (...)` clause in a subsequent SQL query.
**Learning:** SQLite's dynamic typing allows strings to be stored in `INTEGER` columns without error. This means even columns that "should" be integers can be vectors for injection if their values are not treated as tainted. Trusting database content (Second-Order) is dangerous.
**Prevention:** Always use parameterized queries (placeholders), even for data retrieved from your own database. Specifically for `IN` or `NOT IN` clauses with variable list lengths, dynamically generate the placeholder string (e.g., `?, ?, ?`).
