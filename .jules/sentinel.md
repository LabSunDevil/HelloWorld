## 2024-05-22 - Missing Authentication and Session Management
**Vulnerability:** The application lacks secure session management. The `/api/login` endpoint returns a raw user ID, and critical endpoints like `/api/upload` blindly trust the `uploaderId` provided in the request body without any server-side verification of the user's identity.
**Learning:** This architecture allows trivial impersonation and unauthorized content creation. Relying on the client to honestly report its identity is a fundamental security flaw.
**Prevention:** Implement server-side session management (using tokens or cookies) and enforce authentication checks on all sensitive endpoints. Never trust client-provided user IDs for authorization.
