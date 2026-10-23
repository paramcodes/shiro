# Shiro

Collaborative whiteboard MVP. Bun workspace with React/Vite client, Bun server, shared contracts, SQLite auth, and tldraw canvas.

## Setup

```bash
bun install
bun run dev
```

## Module map

- `packages/contracts`: shared TypeScript contracts (`Board`, `User`).
- `apps/server`: Hono API + Better Auth (SQLite) + sync room setup.
- `apps/web`: React + tldraw canvas.

## Canonical commands

- `bun run dev` — start workspace
- `bun run build`
- `bun run lint`
- `bun run format:check`
- `bun run typecheck`
- `bun run test`
- `bun run test:e2e`

## Environment

- `AUTH_SECRET` (default: `dev-secret-32-char-long-xxxxxxxxxx`)
- Database: `apps/server/data/auth.sqlite`
