## Runtime SaaS Data

Production user and client data should live outside the Git repository. Set
`WEBPAGES_DATA_DIR` to a persistent server directory so deploys and `git pull`
operations update code without replacing runtime data.

Example production setup:

```bash
mkdir -p /var/lib/webpages
chown -R react:react /var/lib/webpages
```

Environment:

```bash
WEBPAGES_DATA_DIR=/var/lib/webpages
```

When `WEBPAGES_DATA_DIR` is set, WebPages reads and writes these runtime files
from that directory:

```text
/var/lib/webpages/users.json
/var/lib/webpages/websites.json
/var/lib/webpages/builder-layouts.json
/var/lib/webpages/builder-pages.json
/var/lib/webpages/builder-shell.json
/var/lib/webpages/builder-templates.json
/var/lib/webpages/websites/<websiteId>/builder-layouts.json
/var/lib/webpages/websites/<websiteId>/builder-pages.json
/var/lib/webpages/websites/<websiteId>/builder-shell.json
```

When `WEBPAGES_DATA_DIR` is not set, local development uses the ignored
`data/runtime/` directory. Populate it with the tracked development fixtures
using `npm run dev:seed` or `npm run dev:reset`.

When `WEBPAGES_DATA_DIR` is set, the repo `data/` directory is not used as a
live runtime read/write location. The Git-tracked fixture source is
`data/fixtures/dev/`.

The development fixture directory contains the default builder files:

```text
data/fixtures/dev/builder-layouts.json
data/fixtures/dev/builder-pages.json
data/fixtures/dev/builder-shell.json
data/fixtures/dev/builder-templates.json
data/fixtures/dev/users.json
data/fixtures/dev/websites.json
data/fixtures/dev/websites/<websiteId>/builder-*.json
```

When a new SaaS website is created, the app copies seed builder files from the
fixture directory into the runtime website directory. Runtime writes and
backups stay under the configured runtime directory and are never written back
to Git-tracked fixtures.

The development fixture accounts use bcrypt hashes and `@example.test` email
addresses. CMS connection fields are intentionally absent or empty; real WordPress,
WooCommerce, application-password, and auth-secret values belong in local
environment variables or the external runtime directory, never in fixtures.

At startup and during website seeding, the app logs the active runtime data
directory and seed data directory with the `[webpages-data]` prefix.
