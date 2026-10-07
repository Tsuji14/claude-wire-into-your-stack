Run a code review on the Express API in this repo.
Check for:
1. Input validation — routes validate input and return `400` on bad input, `404` when a record is missing
2. Consistent response format — success returns the data directly; errors are `{ "error": "message" }` (see CLAUDE.md and docs/api.md)
3. Data access — routes read and write only through `db/store.js` and hold no state
4. No console.log in production code
5. Tests exist for new routes, including the `400` and `404` cases
