---
name: test-router
description: Use whenever adding, creating, or changing an API endpoint or route in this Express API (for example "add a DELETE /users/:id endpoint" or "create a GET /posts route"). Gives this repo's required pattern for routes/, db/store.js, 400/404 validation, the { "error": "message" } format, and tests — load it before writing any route code.
---

When asked to add a new route to this Express API, follow this pattern:
1. Add the route to the appropriate router file in `routes/` (one file per resource, mounted in `server.js`)
2. Read and write data only through `db/store.js` — routes never hold state
3. Validate input in the route: return `400` on bad input and `404` when a record is missing
4. Return the data directly on success; errors are JSON in the shape `{ "error": "message" }`
5. Add a corresponding test in `tests/`, covering the success, `400` and `404` cases

Example route structure (from `routes/users.js`):
```javascript
router.get('/:id', (req, res) => {
  const user = store.getUser(Number(req.params.id));
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  return res.json(user);
});
```

For a new resource, add matching helpers to `db/store.js` (for example `listPosts`, `getPost`) instead of storing data in the route file.
