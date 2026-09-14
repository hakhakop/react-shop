## Reproducible development data

The canonical development data lives in `data/fixtures/dev/`. The app writes
mutable local state to the ignored `data/runtime/` directory by default.

After cloning the repository:

```bash
npm install
npm run dev:check-fixtures
npm run dev:seed       # initialize an empty local runtime
npm run dev
```

`dev:seed` refuses to overwrite an existing runtime. To discard local
development changes and restore the exact Git-tracked state:

```bash
npm run dev:reset
```

`dev:reset` is intentionally limited to the local `data/runtime/` directory.
It refuses to write to an external `WEBPAGES_DATA_DIR` unless
`--allow-external` is supplied explicitly to the underlying script.

Development accounts:

| Email | Password | Role |
|-------|----------|------|
| `dev-admin@example.test` | `dev-admin-password` | Super admin |
| `demo-owner@example.test` | `dev-owner-password` | User |
| `header-parity-20260722@example.test` | `HeaderParity!2026` | Browser-test user |

Only bcrypt password hashes are stored in `data/fixtures/dev/users.json`.
These accounts, domains under `example.test`, and the fixture’s absent CMS
connection are for development only. Never replace them with production credentials.

For production or a separately managed development environment, set
`WEBPAGES_DATA_DIR` to a persistent directory outside the repository. Keep CMS
credentials in environment variables or that external runtime store.
