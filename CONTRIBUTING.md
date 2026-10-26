# Contributing

Thanks for helping with edu-code-camp.

By taking part you agree to the [Code of Conduct](CODE_OF_CONDUCT.md).

## Reporting a bug or asking for a feature

Open an [issue](https://github.com/Gitguy268/edu-code-camp/issues/new/choose) and use the template. For a bug, say which lesson (copy the address), which look, which browser and version, what you did, what you expected and what happened.

Report security problems privately: see [SECURITY.md](SECURITY.md).

## Making a change

1. Fork the repository and create a branch from `main`.
2. Set it up. You need Node.js 20 or newer, and Docker only for the Linux image.

   ```sh
   npm ci
   npm run image   # builds the Alpine image into public/alpine/ (one time, optional)
   npm run dev     # http://localhost:5281
   ```

3. Make your change. Keep commits small, each with a clear message.
4. Run the checks below and update the README if behaviour changed.
5. Open a pull request and fill in the template.

## Writing a lesson

[content/README.md](content/README.md) describes the files a lesson needs and the test helpers for each language. Lessons must be your own writing. Please don't copy text, exercises or tests from freeCodeCamp, boot.dev or any other course.

## Checks

```sh
npm run check      # lint, build, and every lesson's solution against its tests
npm test           # unit tests and the Playwright suite (run npx playwright install chromium once)
```

## Dependencies and assets

Add a dependency only when it's clearly needed, pin its exact version, and check its licence is compatible with MIT. Name it in the pull request and in [NOTICE](NOTICE). The same goes for fonts, images and sounds. Nothing may load from a CDN at run time: the app has to work offline.
