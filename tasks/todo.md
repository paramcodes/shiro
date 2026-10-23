# Shiro MVP Task Checklist

Task details, dependencies, risks, and implementation decisions are in [`plan.md`](plan.md).

Canonical verification commands to establish in Task 2: `bun run lint`, `bun run format:check`, `bun run typecheck`, `bun test`, `bun run build`, and `bun run test:e2e`.

## Phase 1: Validate and establish the foundation

- [x] **Task 1 — Validate canvas, persistence, and development-tool fit**
  - Acceptance: tldraw license is viable; Bun-hosted two-client sync persists across restart; Better Auth, tsrs, and agent-browser/Lightpanda work in the chosen workspace.
  - Verify: Run sync/restart, auth, typecheck, and browser automation spikes.
  - Dependencies: None.
- [x] **Task 2 — Bootstrap the Bun workspace and quality baseline**
  - Acceptance: Web, server, and contracts packages install, run, build, and expose canonical quality scripts.
  - Verify: Run all canonical commands from a clean checkout.
  - Dependencies: Task 1.
- [x] **Task 3 — Add agent-ready project guidance**
  - Acceptance: README and AGENTS.md document setup, module map, commands, and definition of done accurately.
  - Verify: Follow documented setup and commands from a clean checkout.
  - Dependencies: Task 2.

### Checkpoint: Foundation

- [x] Licensing and technical spike accepted; clean install, build, quality checks, and docs verified.

## Phase 2: Accounts, boards, and persisted editing

- [x] **Task 4 — Implement account registration and sessions**
  - Acceptance: Users can register, sign in, refresh sessions, sign out; protected APIs reject unauthenticated requests.
  - Verify: Auth tests and browser sign-in flow.
  - Dependencies: Tasks 2–3.
- [x] **Task 5 — Deliver board dashboard and ownership CRUD**
  - Acceptance: Users can create/list/rename/duplicate/open/delete their boards; other users' private boards are isolated.
  - Verify: Board CRUD and ownership tests; dashboard browser workflow.
  - Dependencies: Task 4.
- [x] **Task 6 — Add the tldraw editor and core canvas tools**
  - Acceptance: Sticky notes, text, shapes, connectors, selection, movement, resize, pan/zoom, undo/redo work.
  - Verify: Browser workflow covers each editing and navigation action.
  - Dependencies: Task 5.
- [x] **Task 7 — Persist and restore canvas state**
  - Acceptance: Authorized board state survives reload/restart; board IDs cannot bypass access checks; reconnect does not silently replace newer content.
  - Verify: Persistence integration tests and restart/reopen browser flow.
  - Dependencies: Task 6 and Task 1 spike.

### Checkpoint: Single-user board

- [x] Sign-in, board CRUD, canvas editing, persistence, and ownership isolation pass end-to-end.
## Phase 3: Sharing and collaboration

- [x] **Task 8 — Add revocable viewer/editor invite links**
  - Acceptance: Viewer is read-only; editor can edit; revoked/invalid links are denied on HTTP and WebSocket.
  - Verify: Role/revocation tests with owner, viewer, and editor accounts.
  - Dependencies: Task 7.
- [x] **Task 9 — Deliver live collaboration and presence**
  - Acceptance: Concurrent edits converge; presence/cursors update; reconnect restores latest board; viewers remain read-only.
  - Verify: Two-browser concurrent edit/disconnect/reconnect workflow.
  - Dependencies: Task 8.

### Checkpoint: Collaboration

- [x] Owner, editor, viewer, revocation, live edits, and reconnect paths pass.

## Phase 4: Presentation and MVP release

- [x] **Task 10 — Add frames and presentation mode**
  - Acceptance: Frames can be created, renamed, ordered, presented, and synced.
  - Verify: Frame persistence tests and presentation browser flow.
  - Dependencies: Task 9.
- [x] **Task 11 — Add starter templates and export**
  - Acceptance: Three starter templates produce editable content; board/frame export is complete and correctly bounded.
  - Verify: Template assertions and inspect exported image/PDF in browser workflow.
  - Dependencies: Task 10.
- [x] **Task 12 — Harden and deploy the single-instance MVP**
  - Acceptance: Documented self-hosted deployment persists/restores data and protects HTTP/WebSocket access.
  - Verify: Clean deployment, backup restore, and complete two-user browser flow via agent-browser/Lightpanda.
  - Dependencies: Tasks 8–11.

### Checkpoint: MVP release

- [x] All planned behavior and quality checks pass; deployment, backup, and restore instructions are verified.
