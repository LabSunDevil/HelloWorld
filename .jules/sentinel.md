## 2025-02-14 - Second Order SQL Injection via SQLite Type Affinity
**Vulnerability:** Second Order SQL Injection in the `/api/recommendations` endpoint.
**Learning:** SQLite's dynamic typing allows strings to be stored in INTEGER columns (Type Affinity). Input validation in `/api/videos/:id/view` was missing, allowing injection payloads to be stored. Later, these payloads were retrieved and concatenated directly into a SQL query.
**Prevention:** Always validate input types (even for route parameters) to prevent storage of malicious data. Use parameterized queries for ALL dynamic values, including `IN (...)` clauses, by dynamically generating placeholder strings (`?, ?, ?`).
