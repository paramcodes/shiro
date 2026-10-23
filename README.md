# Shiro Whiteboard

Shiro is a high-performance, browser-based collaborative whiteboard built for small teams. It combines a clean, Miro-inspired React/Vite interface with a robust Bun backend, tldraw canvas engine, Better Auth, and SQLite-backed durable persistence and real-time WebSocket sync.

![Shiro Whiteboard](tldraw-verification.png)

---

## Features & End-to-End Workflow

1. **Authentication & Sessions**
   - Secure account registration, sign-in, session refresh, and sign-out powered by **Better Auth** and stored in SQLite.
   - Protected API routes and WebSocket endpoints that strictly reject unauthenticated or unauthorized requests.

2. **Board Dashboard & Ownership CRUD**
   - Clean management dashboard allowing authenticated users to **create, list, rename, duplicate, and delete** their boards.
   - Strict resource isolation ensures private boards are only accessible to their owners or authorized collaborators.

3. **tldraw Canvas Editor & Core Tools**
   - Full integration with the **tldraw SDK**, providing sticky notes, text blocks, geometric shapes, connectors, freehand sketching, multi-select, movement, resizing, smooth pan/zoom, and undo/redo history.

4. **Frames & Presentation Mode**
   - Create, rename, and reorder named frames across the canvas.
   - Focus presentation mode to step sequentially through frames and return to the main board.

5. **Starter Templates & Export**
   - Curated pre-built templates for **Brainstorming**, **Retrospective**, and **Flowcharting** to bootstrap whiteboard sessions instantly.
   - Export boards or frames to portable image/JSON formats.

6. **Sharing & Real-Time Collaboration**
   - Generate revocable **viewer or editor invite links**.
   - Viewer links grant read-only inspection while blocking canvas writes at both the HTTP and WebSocket layers.
   - Real-time multi-user presence, remote cursors, and state synchronization across active clients via Bun WebSockets and SQLite document storage.

---

## Module Map

- `packages/contracts`: Shared TypeScript contracts and type definitions (`Board`, `User`, sharing roles).
- `apps/server`: Hono API server, Better Auth integration, SQLite persistence adapter, and WebSocket sync room manager (`apps/server/data/auth.sqlite`).
- `apps/web`: React, TypeScript, and Vite client featuring the board dashboard, tldraw canvas editor, presence indicators, and template pickers.

---

## Setup & Running

```bash
# 1. Install dependencies across workspace
bun install

# 2. Typecheck and verify tests
bun run typecheck
bun test

# 3. Build workspace packages
bun run build

# 4. Start development server
bun run dev
```

---

## Canonical Commands

| Command | Description |
|---|---|
| `bun run dev` | Start workspace development servers |
| `bun run build` | Build all workspace packages for production |
| `bun run lint` | Run Biome lint checks |
| `bun run format:check` | Verify formatting across workspace |
| `bun run typecheck` | Run TypeScript compiler check (`tsc`) |
| `bun test` | Run unit and integration tests (`bun test`) |
| `bun run test:e2e` | Run end-to-end Playwright test suite |

---

## Environment Variables

- `AUTH_SECRET`: Secret key for Better Auth (default: `dev-secret-32-char-long-xxxxxxxxxx`).
- Database: `apps/server/data/auth.sqlite`.
