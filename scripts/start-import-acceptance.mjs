// A disposable application copy keeps test imports, auth, and Next output away
// from the developer's running website. No .env files or live data are copied.
import { cp, mkdir, mkdtemp, readFile, rm, symlink, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { createServer } from 'node:http';
import { spawn } from 'node:child_process';

const root = process.cwd();
const workspace = await mkdtemp(path.join(tmpdir(), 'webpages-import-'));
const port = Number(process.env.IMPORT_TEST_PORT || 3197);
const cmsPort = port + 1;
const cmsUrl = `http://127.0.0.1:${cmsPort}`;
const fixture = JSON.parse(await readFile(path.join(root, 'tests/fixtures/yootheme-compatibility/sources/devstack-nav.json'), 'utf8'));
const labels = ['Deployment', 'CI/CD', 'Security', 'Features', 'Automation', 'Infrastructure', 'Integrations'];
const menus = [{ databaseId: 9, menuItems: { nodes: labels.map((label, index) => ({ databaseId: index + 41, parentDatabaseId: 40, label, url: `${cmsUrl}/feature-${index + 1}`, path: `/feature-${index + 1}` })) } }];
const cms = createServer((req, res) => {
  if (req.url?.endsWith('.svg')) {
    res.writeHead(200, { 'Content-Type': 'image/svg+xml' });
    res.end('<svg xmlns="http://www.w3.org/2000/svg" width="50" height="50" viewBox="0 0 50 50"><rect x="5" y="5" width="40" height="40" fill="#536ef0"/></svg>');
    return;
  }
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ data: { menus: { nodes: menus }, products: { nodes: [] }, posts: { nodes: [] }, pages: { nodes: [] }, productCategories: { nodes: [] }, categories: { nodes: [] } } }));
});
await new Promise(resolve => cms.listen(cmsPort, '127.0.0.1', resolve));
for (const name of ['app', 'components', 'lib', 'locales', 'types', 'public', 'package.json', 'next.config.ts', 'tsconfig.json', 'next-env.d.ts', 'postcss.config.js', 'tailwind.config.js', 'proxy.ts']) {
  await cp(path.join(root, name), path.join(workspace, name), { recursive: true });
}
await symlink(path.join(root, 'node_modules'), path.join(workspace, 'node_modules'), 'dir');
const dataDir = path.join(workspace, 'data');
await mkdir(dataDir);
await cp(path.join(root, 'data/i18n'), path.join(dataDir, 'i18n'), { recursive: true });
const empty = { version: 1, page: 'home', updatedAt: new Date().toISOString(), sections: [] };
for (const [name, value] of Object.entries({
  'builder-layouts.json': { home: empty },
  'builder-pages.json': [],
  'builder-shell.json': { cmsConnection: { provider: 'wordpress', siteUrl: cmsUrl, graphqlUrl: `${cmsUrl}/graphql` } },
  'builder-theme-settings.json': { schemaVersion: 1, provider: 'yootheme', active: true, sourceConfig: { menuItems: fixture.menuItems } },
})) await writeFile(path.join(dataDir, name), JSON.stringify(value));
const child = spawn(process.execPath, [path.join(root, 'node_modules/next/dist/bin/next'), 'dev', '--webpack', '--port', String(port)], {
  cwd: workspace,
  stdio: 'inherit',
  env: {
    PATH: process.env.PATH, HOME: process.env.HOME, TMPDIR: process.env.TMPDIR,
    NODE_ENV: 'development', NEXT_TELEMETRY_DISABLED: '1',
    WEBPAGES_DATA_DIR: dataDir, SAAS_AUTH_SECRET: 'isolated-import-acceptance-only',
    WORDPRESS_SITE_URL: cmsUrl, NEXT_PUBLIC_WORDPRESS_SITE_URL: cmsUrl,
    NEXT_PUBLIC_WORDPRESS_GRAPHQL_URL: `${cmsUrl}/graphql`,
    WORDPRESS_GRAPHQL_URL: `${cmsUrl}/graphql`,
  },
});
let stopping = false;
async function stop() {
  if (stopping) return;
  stopping = true;
  child.kill('SIGTERM');
  cms.close();
  await new Promise(resolve => child.exitCode !== null ? resolve() : child.once('exit', resolve));
  await rm(workspace, { recursive: true, force: true });
  process.exit(0);
}
process.on('SIGTERM', stop);
process.on('SIGINT', stop);
child.on('exit', () => { if (!stopping) void stop(); });
