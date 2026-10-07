Scaffold a new Express route at `$ARGUMENTS`.
Follow the pattern in existing routes:
- Add to the correct router file in `routes/` (one file per resource, mounted in `server.js`)
- Read and write data only through `db/store.js`
- Validate input and return `400` on bad input, `404` when a record is missing
- Return the data directly on success; errors are `{ "error": "message" }`
- Add a test in tests/
