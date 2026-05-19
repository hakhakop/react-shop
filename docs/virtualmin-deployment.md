# Virtualmin Deployment Plan

This project is a dynamic Next.js storefront. Deploy it as a Node process behind
the Virtualmin/Apache public HTTPS virtual host.

## Target Shape

```text
Visitor
  -> https://react.webpages.am
  -> Apache/Virtualmin SSL virtual host
  -> proxy to http://127.0.0.1:3001
  -> Next.js app running as the Virtualmin virtual-server user
```

WordPress/WooCommerce stays separate:

```text
https://cms.webpages.am
```

## Safe Rules

- Do not run the app as `root`.
- Do not place the app inside an existing WordPress site's files.
- Bind the Node app to `127.0.0.1`, not a public IP.
- Use one unique port per React app, for example `3001`.
- Keep secrets in `.env.production` on the server only.
- Back up the server before installing Node or changing Apache config.

## Phase 1: Server Preparation

1. Create a new Virtualmin virtual server, for example:

   ```text
   react.webpages.am
   ```

2. Confirm Virtualmin created a separate Linux user and home directory.

   Example:

   ```text
   /home/react/
   ```

3. Confirm the virtual host has SSL enabled.

4. Check server resources:

   ```bash
   free -h
   df -h
   uname -a
   node -v
   npm -v
   ```

If `node` is not installed yet, install it carefully once at the system level or
under the virtual-server user with `nvm`. Prefer Node 20 LTS or newer.

## Phase 2: Upload The Project

Recommended app location:

```text
/home/react/app
```

Use one of these approaches:

- Git clone from a private repo.
- Upload an archive and extract it.
- Use `rsync` from the Mac.

Do not upload:

```text
node_modules
.next
.env.local
```

## Phase 3: Environment File

On the server, create:

```text
/home/react/app/.env.production
```

Use `deploy/env.production.example` as the template.

Required values:

```bash
NEXT_PUBLIC_WORDPRESS_GRAPHQL_URL=https://cms.webpages.am/graphql
NEXT_PUBLIC_WPGRAPHQL_ENDPOINT=https://cms.webpages.am/graphql
WORDPRESS_SITE_URL=https://cms.webpages.am
NEXT_PUBLIC_WORDPRESS_SITE_URL=https://cms.webpages.am
WC_API_URL=https://cms.webpages.am/wp-json/wc/v3
WC_CONSUMER_KEY=ck_xxx
WC_CONSUMER_SECRET=cs_xxx
```

## Phase 4: Build Test As Site User

Switch to the virtual-server user, then:

```bash
cd /home/react/app
npm ci
npm run build
HOST=127.0.0.1 PORT=3001 npm run start
```

From the server, test:

```bash
curl -I http://127.0.0.1:3001
```

Stop the foreground process after the test with `Ctrl+C`.

## Phase 5: Keep The App Running

Use the systemd example:

```text
deploy/react-shop.service.example
```

Copy it to:

```text
/etc/systemd/system/react-shop.service
```

Adjust:

- `User=`
- `Group=`
- `WorkingDirectory=`
- `PORT=`

Then:

```bash
sudo systemctl daemon-reload
sudo systemctl enable react-shop
sudo systemctl start react-shop
sudo systemctl status react-shop
```

Logs:

```bash
journalctl -u react-shop -f
```

## Phase 6: Apache Reverse Proxy

Apache should receive public HTTPS traffic and proxy internally to Next.js.

Use:

```text
deploy/apache-proxy.example.conf
```

The important proxy target is:

```text
http://127.0.0.1:3001/
```

After editing Apache config:

```bash
sudo apachectl configtest
sudo systemctl reload apache2
```

## Phase 7: Production Smoke Test

Open:

```text
https://react.webpages.am
```

Check:

- Home page loads.
- Product page loads.
- Cart opens.
- Checkout creates a WooCommerce order and redirects to WooCommerce payment.
- My Account links to WooCommerce.
- Dashboard opens only if you intentionally expose it.

## Rollback

If anything goes wrong:

```bash
sudo systemctl stop react-shop
sudo systemctl disable react-shop
```

Then remove or disable the Apache proxy block and reload Apache.

Existing WordPress sites should not be affected if the React app has its own
Virtualmin virtual server and local Node port.
