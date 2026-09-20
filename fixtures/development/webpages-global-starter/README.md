# WebPages development Global Starter fixture

This fixture is intentionally separate from the mutable runtime `data/`
directory. It contains the Circle development tenant metadata, its complete
currently-persisted Builder bundle, and the Global Starter designation that
points to that tenant.

The website record contains no CMS connection or credentials. The imported
Builder documents may reference their public demo media URLs; configure a CMS
connection in the target runtime separately when testing CMS-backed content.

Seed it into an isolated runtime directory with:

```sh
WEBPAGES_DATA_DIR=.dev-data npm run seed:development
WEBPAGES_DATA_DIR=.dev-data npm run dev
```

The seed command is idempotent, refuses to overwrite an existing conflicting
record unless `--force` is supplied, and never deletes unrelated runtime data.
