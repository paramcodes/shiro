# AGENTS.md — Shiro

## Responsibilities

- `packages/contracts`: types only; no logic.
- `apps/server`: auth, board CRUD, WebSocket sync.
- `apps/web`: canvas UI; tldraw integration.

## Smallest verification loop

```bash
bun install && bun run typecheck && bun run build
```

## Definition of done

Every deliverable in `tasks/plan.md` has passing verification per its Acceptance criteria; `README.md` and this file match the repo.
