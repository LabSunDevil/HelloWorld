## 2024-03-24 - Second Order SQL Injection in SQLite
**Vulnerability:** Found a Second Order SQL Injection where unvalidated data stored in the database (via dynamic typing in SQLite INTEGER columns) was later concatenated into a SQL query without parameterization.
**Learning:** SQLite's dynamic typing allows strings to be stored in INTEGER columns, bypassing type assumptions. Trusted data from the database is not always safe if the insertion point lacks validation.
**Prevention:** Always use parameterized queries, even for data retrieved from the database. Validate input types strictly before insertion.
