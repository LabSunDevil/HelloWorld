## 2024-05-23 - Broken Access Control in Upload API
**Vulnerability:** The `/api/upload` endpoint accepts `uploaderId` directly from the request body without verifying if it matches the authenticated user. In fact, there is no server-side authentication mechanism; the frontend merely sends the ID it has stored in local storage.
**Learning:** This is a classic case of trusting the client. The frontend code `formData.append('uploaderId', user.id);` makes it look like the user is being identified, but an attacker can send any ID they want.
**Prevention:** Always implement server-side session management (like JWT or cookies) and verify the user's identity on every sensitive request. The server should derive the `uploaderId` from the trusted session, never from the request body.
