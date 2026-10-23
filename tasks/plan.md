# Implementation Plan: Shiro Whiteboard MVP

## Overview

Build a browser-based collaborative whiteboard for small teams. Users can sign in, create boards, add and arrange canvas objects, share boards with viewer/editor access, collaborate live, and present or export their work. Build it as a Bun workspace with a React/TypeScript/Vite client, a Bun server, shared TypeScript contracts, tldraw for the canvas, Better Auth for accounts, and SQLite for account, board, and persisted canvas data.

This plan follows Addy Osmani's planning-and-task-breakdown workflow: dependency-ordered vertical tasks, acceptance criteria, verification, and phase checkpoints. The project guidance in `scaffold-codebase/SKILL.md` calls for a clear module map, reproducible setup, canonical quality commands, and a verifiable user workflow.

## Architecture Decisions

- **Runtime and workspace:** Bun for package management and server runtime; a Bun workspace with `apps/web`, `apps/server`, and `packages/contracts`.
- **Client:** React, TypeScript, and Vite; Tailwind CSS and shadcn/ui for app chrome; Motion for small UI transitions. The board canvas owns its own pan, zoom, selection, and object motion.
- **Canvas:** tldraw SDK, subject to the production license being viable. Use one `TLSocketRoom` per active board over Bun WebSockets and SQLite-backed sync storage.
- **Auth and persistence:** Better Auth and SQLite. Persist board metadata and canvas state; persist uploaded assets on the self-hosted service's data volume if asset upload is included by tldraw's default editor behavior.
- **Access:** Authenticated board owners create revocable invite links with viewer or editor role. Invite links require an account; no anonymous public editing.
- **Quality tooling:** Biome for lint and formatting; tsrs as the TypeScript type checker; `bun test` for unit/integration tests; `agent-browser` with Lightpanda for browser workflows. Validate tool compatibility early and document a browser fallback only for unsupported rendering or input behavior.
- **Deployment:** One self-hosted Bun service and persistent data volume for MVP. Defer horizontal scaling.
- **Visual direction:** Miro-inspired layout and interaction patterns with Shiro's own name, assets, and design tokens.

## Task List

### Phase 1: Validate and establish the foundation

#### Task 1: Validate canvas, persistence, and development-tool fit

**Description:** Make a disposable feasibility spike for the tldraw production license, `TLSocketRoom` on Bun, SQLite persistence, Better Auth with SQLite, tsrs, and agent-browser with Lightpanda.

**Acceptance criteria:**
- The tldraw production licensing route is acceptable for this project.
- Two clients can sync a board through Bun, and the board remains after a server restart.
- Better Auth, tsrs, and the requested browser tooling can be used with the selected Bun workspace.

**Verification:** Run a two-client local sync/restart exercise; sign in through a minimal auth spike; typecheck a representative package; automate a basic page load with agent-browser/Lightpanda.

**Dependencies:** None.

**Files likely touched:** Temporary spike files only; remove them or promote only validated code during Task 2.

**Estimated scope:** Medium.

#### Task 2: Bootstrap the Bun workspace and quality baseline

**Description:** Create the web, server, and contracts workspace packages with a minimal runnable client and server, pinned dependencies, and canonical scripts.

**Acceptance criteria:**
- A clean Bun install starts the web client and API server.
- Workspace boundaries allow client and server to import shared contracts.
- Canonical scripts exist for `dev`, `build`, `lint`, `format:check`, `typecheck`, `test`, and `test:e2e`.

**Verification:** Run each canonical script from a clean checkout; confirm the initial app build succeeds.

**Dependencies:** Task 1.

**Files likely touched:** `package.json` / `bun.lock`, `apps/web`, `apps/server`, `packages/contracts`, Biome and TypeScript configuration.

**Estimated scope:** Medium.

#### Task 3: Add agent-ready project guidance

**Description:** Document setup, module map, canonical commands, environment variables, critical workflows, and definition of done.

**Acceptance criteria:**
- README setup steps work from a clean checkout.
- Root `AGENTS.md` maps responsibilities and points to the smallest relevant verification commands.
- No project command is documented unless it exists in the workspace scripts.

**Verification:** Follow the README setup and run its documented checks; review the module map against the workspace.

**Dependencies:** Task 2.

**Files likely touched:** `README.md`, `AGENTS.md`.

**Estimated scope:** Small.

### Checkpoint: Foundation

- [ ] Licensing and technical spike accepted.
- [ ] Clean install, app build, lint, format check, typecheck, and tests succeed.
- [ ] README and `AGENTS.md` accurately describe the repo.

### Phase 2: Accounts, boards, and persisted editing

#### Task 4: Implement account registration and sessions

**Description:** Add Better Auth registration, sign-in, sign-out, and server-side session enforcement backed by SQLite.

**Acceptance criteria:**
- Users can register, sign in, refresh with a valid session, and sign out.
- Protected board routes and APIs reject unauthenticated requests.
- Session behavior is covered for valid, expired, and invalid credentials.

**Verification:** Run auth unit/integration tests and complete registration/sign-in/sign-out in the browser.

**Dependencies:** Tasks 2–3.

**Files likely touched:** `apps/server/src/auth`, `apps/web/src/auth`, auth tests.

**Estimated scope:** Medium.

#### Task 5: Deliver board dashboard and ownership CRUD

**Description:** Let authenticated users create, list, rename, duplicate, open, and delete their own boards.

**Acceptance criteria:**
- Dashboard only lists boards visible to the current user.
- Board metadata persists across server restarts.
- A user cannot read, edit metadata for, or delete another user's private board.

**Verification:** Test board CRUD and owner isolation; use the browser to create, rename, reopen, duplicate, and delete a board.

**Dependencies:** Task 4.

**Files likely touched:** `apps/server/src/boards`, `apps/web/src/dashboard`, board persistence/tests.

**Estimated scope:** Medium.

#### Task 6: Add the tldraw editor and core canvas tools

**Description:** Mount tldraw for a board and provide the initial whiteboard workflow with sticky notes, text, shapes, connectors, selection, movement, resizing, pan/zoom, and undo/redo.

**Acceptance criteria:**
- Users can create, edit, arrange, and delete supported objects.
- The board title is visible and editable from the editor.
- Core navigation and editing are usable by mouse and trackpad.

**Verification:** Browser workflow creates and edits each supported object type; confirm undo/redo and pan/zoom behavior.

**Dependencies:** Task 5.

**Files likely touched:** `apps/web/src/board`, tldraw integration and styles, editor tests.

**Estimated scope:** Large; split canvas integration and individual tool groups into separate tasks before implementation if needed.

#### Task 7: Persist and restore canvas state

**Description:** Connect each board to its Bun-hosted tldraw sync room and durable SQLite-backed document storage.

**Acceptance criteria:**
- Edits save and load for the correct board after reload and server restart.
- A board cannot be loaded by changing only the room identifier.
- Failed or interrupted connections recover without silently replacing newer persisted content.

**Verification:** Integration test save/load and authorization; browser test edit, restart server, and reopen the board.

**Dependencies:** Task 6 and the validated sync approach in Task 1.

**Files likely touched:** `apps/server/src/sync`, board storage adapter, web sync adapter, persistence tests.

**Estimated scope:** Medium.

### Checkpoint: Single-user board

- [ ] Sign-in through create/edit/reopen works end-to-end.
- [ ] Canvas state persists across refresh and server restart.
- [ ] User and board access isolation tests pass.

### Phase 3: Sharing and collaboration

#### Task 8: Add revocable viewer/editor invite links

**Description:** Allow board owners to create, copy, and revoke invite links granting viewer or editor access to authenticated users.

**Acceptance criteria:**
- Viewer links allow viewing but block canvas writes.
- Editor links allow editing.
- Revoked, malformed, or unknown links are denied by HTTP and WebSocket entrypoints.

**Verification:** Test role enforcement and revocation; browser-check with separate owner, viewer, and editor accounts.

**Dependencies:** Task 7.

**Files likely touched:** `apps/server/src/sharing`, share dialog, access-control tests.

**Estimated scope:** Medium.

#### Task 9: Deliver live collaboration and presence

**Description:** Connect authorized collaborators to the same board room and display collaborator presence and remote cursors.

**Acceptance criteria:**
- Simultaneous changes from two clients converge and appear live.
- Reconnecting clients receive the current board and do not overwrite newer content.
- Viewer sessions remain read-only while presence remains visible.

**Verification:** Two-browser collaboration test covering concurrent edits, disconnect/reconnect, and viewer restrictions.

**Dependencies:** Task 8.

**Files likely touched:** `apps/server/src/sync`, room registry, `apps/web/src/board/presence`, sync tests.

**Estimated scope:** Medium.

### Checkpoint: Collaboration

- [ ] Owner, editor, and viewer paths behave correctly.
- [ ] Live edits and cursors work across two sessions.
- [ ] Revocation and reconnect behavior pass automated and browser checks.

### Phase 4: Presentation and MVP release

#### Task 10: Add frames and presentation mode

**Description:** Support named frames, ordering, and focused presentation navigation.

**Acceptance criteria:**
- Users can create, rename, and reorder frames.
- Presentation advances through frames in order and returns to the board.
- Frame state persists and syncs with collaborators.

**Verification:** Unit/integration tests cover ordering and persistence; browser-check create/reorder/present/exit.

**Dependencies:** Task 9.

**Files likely touched:** `apps/web/src/board/frames`, presentation controls, frame tests.

**Estimated scope:** Medium.

#### Task 11: Add starter templates and export

**Description:** Provide curated brainstorming, retrospective, and flowchart templates, plus frame/board export.

**Acceptance criteria:**
- Each template creates an editable board with the expected starter structure.
- Users can export a frame or board to a portable image or PDF format supported by the chosen editor integration.
- Exported content matches the selected scope and is not blank or clipped.

**Verification:** Test template contents; browser-check template creation and inspect generated export files.

**Dependencies:** Task 10.

**Files likely touched:** Template definitions, template picker, export UI/adapter, tests.

**Estimated scope:** Medium.

#### Task 12: Harden and deploy the single-instance MVP

**Description:** Add production configuration, persistent volumes, backup/restore guidance, safe request limits, error states, and deployment documentation.

**Acceptance criteria:**
- Self-hosted setup works using documented steps and environment variables.
- SQLite and asset data survive restart and can be restored from backup.
- HTTP and WebSocket authorization, invite handling, and input limits are covered by the server verification suite.

**Verification:** Deploy to a clean environment, restore a backup, then run the full two-user browser flow with agent-browser and Lightpanda.

**Dependencies:** Tasks 8–11.

**Files likely touched:** Deployment config, server configuration, backup utility, deployment docs, smoke checks.

**Estimated scope:** Medium.

### Checkpoint: MVP release

- [ ] All acceptance criteria are complete.
- [ ] Canonical checks and the full browser workflow pass.
- [ ] Setup, deployment, backup, and restore steps are verified.

## Parallelization

- Tasks 2 and 3 are sequential because project docs depend on the established commands and structure.
- Auth and board ownership (Tasks 4–5) precede board editing and sharing.
- After Task 7 defines and stabilizes board and room contracts, independent UI polish and focused tests can be developed in parallel.
- Database changes and sync-room lifecycle changes remain sequential to avoid conflicting persistence assumptions.

## Risks and Mitigations

| Risk | Impact | Mitigation |
|---|---|---|
| tldraw production license is unsuitable | High | Decide in Task 1 before product implementation. |
| Bun sync-room lifecycle or SQLite adapter differs from the spike | High | Prove two-client sync and restart persistence in Task 1; retain the spike as a runnable reference until Task 7 is complete. |
| tsrs or Lightpanda lacks required compatibility | Medium | Validate in Task 1; keep canonical commands isolated so the incompatible tool can be replaced without restructuring product code. |
| Invite access is bypassed through HTTP or WebSocket paths | High | Centralize board-role checks and test both entrypoints. |
| Single Bun process becomes a scale limit | Medium | Explicitly scope MVP to one instance; design a later scaling project after measuring load. |

## Scope Defaults

- **Included:** authenticated accounts, owned boards, invite links with viewer/editor roles, core canvas editing, durable board state, live collaboration/presence, frames/presentation, starter templates, and export.
- **Deferred:** anonymous guest access, comments, voting/timers, AI, integrations, organization administration, and native mobile apps.
- **Operational default:** one self-hosted Bun instance with SQLite and a persistent data volume; no horizontal scaling in MVP.
- **Task tracking:** `tasks/todo.md`; no external tracker has been designated.
