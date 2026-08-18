# Deployment

CaseReady is published from the `main` branch by GitHub Pages. The application source is compiled with Vite, and the verified production entry point and hashed assets are mirrored at the repository root because that is the configured Pages source.

Run the following before publishing a deployment change:

```bash
npm run pages:sync
npm run lint
npm test
```

The rendered-build test compares the committed deployment mirror byte-for-byte with a fresh production build. A stale or hand-edited deployment artifact therefore fails CI.
