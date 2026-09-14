# wc-store — Headless WooCommerce Storefront

A Next.js 16 / React 19 headless storefront connected to WordPress/WooCommerce via WPGraphQL, featuring a custom visual drag-and-drop page builder dashboard.

## Tech Stack

- **Framework**: Next.js 16 (App Router, RSC)
- **UI**: React 19, TypeScript 5, Tailwind CSS 3
- **Animations**: Framer Motion, CSS scroll-reveal effects
- **Data**: WordPress + WooCommerce via WPGraphQL
- **Builder**: Custom visual dashboard with JSON persistence

## Getting Started

```bash
npm install
npm run dev:seed
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Architecture and compatibility work

Before changing the Builder, document model, Inspector, Global Styles,
rendering, or YOOtheme/UIkit compatibility, start with
[`docs/README.md`](docs/README.md). It defines the documentation authority
order, current capability ledger, permanent ownership law, composition
contracts, and required live acceptance workflow.

Key authorities:

- [`docs/architecture/CANONICAL_OWNERSHIP.md`](docs/architecture/CANONICAL_OWNERSHIP.md)
- [`docs/WEBPAGES_CAPABILITY_ARCHITECTURE.md`](docs/WEBPAGES_CAPABILITY_ARCHITECTURE.md)
- [`docs/architecture/CAPABILITY_LEDGER.md`](docs/architecture/CAPABILITY_LEDGER.md)
- [`docs/architecture/YOOTHEME_EXECUTION_CONTRACT.md`](docs/architecture/YOOTHEME_EXECUTION_CONTRACT.md)

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server |
| `npm run dev:seed` | Copy Git-tracked development fixtures into local runtime storage |
| `npm run dev:reset` | Reset local runtime storage to the tracked development fixtures |
| `npm run dev:check-fixtures` | Validate fixture structure and credential safety |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run typecheck` | Run TypeScript type checking |

## Project Structure

- `app/` — Next.js App Router pages and layouts
- `components/` — React components (builder, dashboard, blocks, UI)
- `lib/` — Data fetching, GraphQL client, builder utilities
- `data/fixtures/dev/` — Git-tracked, test-safe development tenants and builder data
- `data/runtime/` — Ignored mutable local runtime data created by the seed/reset commands
- `public/` — Static assets and uploaded images

See [`docs/DEVELOPMENT.md`](docs/DEVELOPMENT.md) for the development accounts and
runtime-data rules. Production deployments should set `WEBPAGES_DATA_DIR` to a
persistent directory outside the repository.
