## 2024-05-22 - Second Order SQL Injection via SQLite Type Affinity
**Vulnerability:** Second Order SQL Injection in the recommendation engine.
**Learning:** SQLite's dynamic typing allows storing strings in INTEGER columns. Trusting data from the database (like video IDs) to be safe for string concatenation is dangerous if input validation was missed elsewhere.
**Prevention:** Always use parameterized queries, even for data retrieved from the database. Validate inputs strictly (e.g., ensure IDs are integers) before insertion.
