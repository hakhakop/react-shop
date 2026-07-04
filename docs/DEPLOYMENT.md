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

When `WEBPAGES_DATA_DIR` is not set, local development keeps using the repo
`data/` directory.

When `WEBPAGES_DATA_DIR` is set, the repo `data/` directory is not used as a
live runtime read/write location. It is only used as a seed/template source.

The repo `data/` directory remains the seed/template source for default builder
files:

```text
data/builder-layouts.json
data/builder-pages.json
data/builder-shell.json
data/builder-templates.json
```

When a new SaaS website is created, the app copies seed builder files from the
repo `data/` directory into the runtime website directory. Existing runtime data
is not moved, deleted, or migrated automatically yet.

At startup and during website seeding, the app logs the active runtime data
directory and seed data directory with the `[webpages-data]` prefix.
