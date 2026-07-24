# Content cover assets

Repository-owned source illustrations for CloudBase public content:

- `actions/`: 80 PNG files
- `equipment/`: 20 PNG files
- `foods/`: 200 PNG files
- `manifest.json`: seed URI → source file → stable cloud path → SHA-256

These files are generated, copyright-safe PeakMeet brand cards (640×400, Ink /
Orange / Snow). They are **not** bundled into the Mini Program.

Regenerate and verify:

```bash
pnpm db:generate-seeds
pnpm db:generate-images
pnpm db:validate-assets
```

`pnpm db:sync` uploads them to CloudBase and replaces each seed
`asset://content/...` cover with the target environment's `cloud://...` fileID
before database import.

The fallback source is `database/assets/images/content-placeholder.png`; its
Mini Program runtime copy is
`packages/miniprogram/assets/images/content-placeholder.png`.
