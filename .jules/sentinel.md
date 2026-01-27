## 2024-05-23 - Second Order SQL Injection via SQLite Type Affinity
**Vulnerability:** A Second Order SQL Injection was identified in the `/api/recommendations` endpoint. The vulnerability stemmed from two issues:
1.  **Injection Point:** `/api/videos/:id/view` blindly trusted the `id` parameter and inserted it into the `views` table. Since SQLite uses dynamic typing (type affinity), it allowed storing strings in the `videoId` column even if defined as `INTEGER`.
2.  **Execution Point:** `/api/recommendations` retrieved these stored `videoId`s and interpolated them directly into a `NOT IN (...)` SQL clause using `${watchedVideoIds.join(',')}`.

**Learning:**
-   **SQLite Type Affinity:** Unlike rigid SQL databases (like PostgreSQL), SQLite is flexible with types. Defining a column as `INTEGER` does not enforce integer-only storage. This can lead to security assumptions being violated if the application layer doesn't enforce types.
-   **Stored Data Trust:** Data retrieved from the database should not be trusted implicitly, especially if it originated from user input.

**Prevention:**
-   **Input Validation:** Always validate input types at the API boundary. Used `regex` to ensure `id` is an integer.
-   **Parameterized Queries (Always):** Even for lists in `IN` clauses, use parameterized queries (generating `?, ?, ...`) instead of string interpolation. Never concatenate user-controlled data (direct or stored) into SQL strings.
