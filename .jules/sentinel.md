## 2024-05-22 - Second Order SQL Injection via SQLite Type Affinity
**Vulnerability:** The application was vulnerable to Second Order SQL Injection because it concatenated `videoId` values retrieved from the `views` table directly into a SQL query in the recommendation engine. While the `views` table defined `videoId` as `INTEGER`, SQLite's dynamic type system allowed storing malicious strings (e.g., `999) OR 1=1 --`) via the `/api/videos/:id/view` endpoint, which performed no validation.
**Learning:** SQLite's type affinity is advisory, not mandatory. Just because a column is declared as `INTEGER` doesn't mean it only contains integers. Trusting database content without validation or parametrization is dangerous, especially with flexible schemas.
**Prevention:**
1. Always validate input types (e.g., ensure IDs are integers) before database insertion.
2. Use parameterized queries for ALL dynamic values, including lists in `IN` or `NOT IN` clauses (generate `?, ?, ?` placeholders dynamically).
