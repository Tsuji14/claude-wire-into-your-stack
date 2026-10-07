# NOTES

## Server: fetch (MCP)

**Which server, and why it's useful here**
I connected the `fetch` server (`mcp-server-fetch`) at project scope in `.mcp.json`. It lets Claude read web pages and return them as markdown, such as the Express docs or an npm package page. This project is an Express API, so most questions while working on it ("how does Express treat an error handler?") are answered by external documentation, not by the repo. The server needs no credentials. It runs via `python -m uv tool run mcp-server-fetch`, so the only requirement is Python with `uv` installed.

**What the permission rule allows**
`.claude/settings.json` allows only `mcp__fetch__fetch`, the server's single tool. It is read-only: it can GET a URL but cannot change anything locally. I allowed that one tool by name rather than the whole server. The other servers in `.mcp.json` (playwright, github, gitlab) are **not** allowed, so Claude still asks before each of their calls. Their tokens are referenced as `${GITHUB_PERSONAL_ACCESS_TOKEN}` and `${GITLAB_TOKEN}`, so no secret is committed.

**Real use**
While fixing the bug where malformed JSON returned an HTML error page, I used fetch to read the Express error-handling guide (`expressjs.com/en/guide/error-handling.html`). It confirmed that an error passed to `next(err)` falls through to Express's default handler. That is how the new handler in `server.js` works: it answers JSON parse errors and passes every other error on.

## Skill: `test-router`

**The pattern it captures**
It captures how a route is written in this repo:
- one router file per resource in `routes/`, mounted in `server.js`
- all data goes through `db/store.js`
- input is validated in the route, with `400` for bad input and `404` for a missing record
- errors are returned as `{ "error": "message" }`, and success returns the data directly
- every route gets a test in `tests/` covering the success, `400` and `404` cases

My first draft used a `{ success, data }` format. I changed it because that contradicted `CLAUDE.md`, `docs/api.md` and every existing route.

**How the description is worded so it fires**
The description is "Create a new Express route with proper error handling". It names the exact kind of request ("new … route") and the framework ("Express"). A request like "add a DELETE /users/:id endpoint" therefore matches it, while reviews, refactors or doc edits don't.

## Command: `/review`

**What it does**
`.claude/commands/review.md` reviews the API against this project's own checklist:
- input validation, with `400` for bad input and `404` for missing records
- the `{ "error": "message" }` error format
- data access only through `db/store.js`
- no `console.log` in production code
- tests that include the `400` and `404` cases

**Why it's worth a shortcut**
I run this check before every commit. Typing the checklist each time is slow and easy to get wrong, and `/review` makes every review use the same standard. The first review also led to edge-case testing that found three real bugs:
- malformed JSON returned an HTML error page
- POST accepted non-string names and emails
- PUT accepted an empty name and a null email

All three were fixed, each with a regression test. I then added the `400` cases to the checklist so future reviews look for them.

## Hook: lint after every edit

**Event, matcher and command**
The hook is a `PostToolUse` hook, so it **reacts** after the fact rather than preventing anything:
- **Matcher:** `Edit|Write`, so it fires every time Claude changes or creates a file.
- **Command:** `npm run lint` (ESLint over `server.js`, `routes`, `db` and `tests`).

**The standard it enforces**
Lint must stay clean, the same check CI runs in `.github/workflows/ci.yml`. A lint error shows up right after the edit that caused it, not later in CI. I chose to react instead of block because the goal is fast feedback, and a lint failure is easy to fix in the next edit.

## Headless run

**Command**
```
claude -p "Run the test suite with npm test and summarise the results in three lines: how many passed, how many failed, and the name of any failing test." --allowedTools "Bash(npm test)" "PowerShell(npm test)"
```

**Result**
"Passed: 8 of 8 tests. Failed: 0. Failing tests: none." There were no permission denials.

**What I locked down**
The only pre-approved action is the exact command `npm test`. Claude cannot edit files, run any other command or use the network, so the run is safe with nobody watching. My first attempt allowed only `Bash(npm test)` and was blocked: on Windows, Claude Code runs commands through its PowerShell tool, so that tool needed the same narrow rule.
