# Security policy

## Reporting a vulnerability

Please report security problems privately, not in a public issue.

Use GitHub's private reporting form: <https://github.com/Gitguy268/edu-code-camp/security/advisories/new>

Include what you found, how to reproduce it, and the browser and OS you used. You should get a reply within a week. Please give the fix time to ship before you publish details.

## Scope

The most useful reports are about:

- learner code escaping its Web Worker, Pyodide or the v86 VM to reach the page, other origins or the computer;
- an imported progress file that runs code or breaks other campers' data;
- Spot's model download accepting bytes that don't match the pinned hashes;
- the service worker answering for pages outside the app's own folder;
- the GitHub Actions workflows in this repository.

Code you write and run in a lesson is yours to run. That alone is not a vulnerability.

## Supported versions

Only the latest version on the `main` branch is supported.
