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
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run typecheck` | Run TypeScript type checking |

## Project Structure

- `app/` — Next.js App Router pages and layouts
- `components/` — React components (builder, dashboard, blocks, UI)
- `lib/` — Data fetching, GraphQL client, builder utilities
- `data/` — Persistent JSON stores for builder layouts
- `public/` — Static assets and uploaded images
