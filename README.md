# AfoByte Personal Investment Intelligence Platform

Educational-first market intelligence frontend for Crypto, IDX, and US Stocks.

This platform is designed to help users think better, not trade emotionally.

## Stack

- Next.js App Router + React + TypeScript
- Tailwind CSS
- Zustand for lightweight UI/app state
- TanStack Query for server state
- React Hook Form + Zod for validated forms
- Lightweight Charts for trading visualization
- Playwright + Vitest + React Testing Library

## Product Principles

- Information clarity first
- Educational explanations for every signal
- Probability and risk visibility
- High-density, professional trading UI
- Responsive behavior for desktop/tablet/mobile

## Folder Structure

```
app/
	(platform)/
		dashboard/
		crypto/
		idx/
		us-stocks/
		portfolio/
		bookkeeping/
		alerts/
		journal/
		risk-management/
		capital-planning/
		rankings/
		settings/
	api/
components/
	charts/
	layout/
	ui/
modules/
	dashboard/
	market/
	portfolio/
	bookkeeping/
	alerts/
	journal/
	risk-management/
	capital-planning/
	rankings/
	settings/
services/
hooks/
stores/
lib/
constants/
types/
tests/
```

## Routing Strategy

- Root route redirects to `/dashboard`.
- `app/(platform)/layout.tsx` provides shared terminal shell.
- Market routes are separated but consistent:
	- `/crypto`
	- `/idx`
	- `/us-stocks`
- Domain routes cover full workflow:
	- `/portfolio`, `/bookkeeping`, `/alerts`, `/journal`
	- `/risk-management`, `/capital-planning`, `/rankings`, `/settings`

## State Management Strategy

- TanStack Query:
	- API payload caching and periodic refresh
	- query-key segmentation by domain and market
	- no heavy payload duplication in client store
- Zustand:
	- sidebar collapse state
	- selected analysis mode
	- lightweight UI-only state
- React Hook Form + Zod:
	- capital planning calculator inputs
	- strict numerical validation

## Chart Integration Architecture

- Lightweight Charts in `components/charts`.
- Candle data fetched from `/api/analysis/candles` via TanStack Query.
- Chart rendering optimized with resize observer and client-only mount.
- Designed for smooth pan/zoom and responsive container behavior.

## Reusable Component System

- UI primitives in `components/ui`:
	- button, card, badge, input, select, progress, table
- Layout shell in `components/layout`:
	- sidebar + topbar + app shell
- Shared market analysis components in `modules/market/components`

## Dashboard Layout System

- Widget grid optimized for fast scanning.
- Includes:
	- total portfolio value
	- daily/weekly PnL
	- risk exposure
	- market sentiment context
	- allocation overview
	- recent alerts

## Analysis Panel System

Each market workspace includes:

- trend state
- bullish/bearish probability
- confidence score
- risk and volatility
- manipulation risk
- suggested style and duration
- entry zone, TP levels, cut loss
- explanation engine text bullets

IDX workspace also includes gorengan detection indicators.

## Portfolio Visualization System

- Holdings table with allocation and pricing context.
- Allocation risk policy panel for diversification control.
- Supports extension for timeline and attribution charts.

## Ranking Visualization System

- Ranking table with:
	- state (`new`, `stable`, `weakening`, `removed`)
	- rank delta versus previous rank
	- probability, confidence, risk, market quality
- Refreshes through query polling for dynamic updates.

## Responsiveness

- Mobile/tablet/desktop layouts using adaptive grid breakpoints.
- Compact blocks and readable dense typography.
- Chart and table containers remain usable on smaller screens.

## Performance Plan

- Query caching and background refresh intervals
- Avoid oversized global state
- Client-only heavy chart rendering
- Component-level memoization opportunities kept open
- Route-level code splitting via App Router

## Testing Strategy

- Vitest for utility and calculation correctness
- React Testing Library ready for component-level assertions
- Playwright for E2E route and UI verification
- Focus test priorities:
	- responsive layouts
	- chart rendering
	- ranking updates
	- risk warning visibility
	- capital planning correctness

## API Layer (Current Mocked Intelligence)

- `/api/dashboard`
- `/api/analysis`
- `/api/analysis/candles`
- `/api/rankings`
- `/api/portfolio`
- `/api/alerts`
- `/api/capital-plan`
- `/api/journal`
- `/api/bookkeeping`

These routes currently return deterministic mock intelligence suitable for UI development and should be swapped to Supabase + Python serverless analytics in the next phase.

## Run

```bash
npm run dev
```

## Validate

```bash
npm run lint
npm run build
npm run test
npm run test:e2e
```
