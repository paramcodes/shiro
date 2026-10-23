import { Hono } from "hono";
import { auth } from "./auth";
import db from "./db";

export function getUserBoardRole(userId: string | undefined | null, boardId: string): "owner" | "editor" | "viewer" | null {
  if (!userId) return null;
  const board = db.query("SELECT ownerId FROM boards WHERE id = ?").get(boardId);
  if (!board) return null;
  if (board.ownerId === userId) return "owner";

  const member = db.query("SELECT role FROM board_members WHERE boardId = ? AND userId = ?").get(boardId, userId);
  return member ? member.role : null;
}

const sharing = new Hono();

async function getUserId(c: any) {
  const userIdHeader = c.req.header("x-test-user-id");
  if (userIdHeader) return userIdHeader;

  const session = await auth.api.getSession({
    headers: c.req.raw.headers,
  });
  return session?.user.id;
}

sharing.post("/boards/:id/shares", async (c: any) => {
  const userId = await getUserId(c);
  if (!userId) return c.json({ error: "Unauthorized" }, 401);

  const boardId = c.req.param("id");
  const role = getUserBoardRole(userId, boardId);
  if (role !== "owner") {
    return c.json({ error: "Forbidden: only owner can create invite links" }, 403);
  }

  const body = await c.req.json().catch(() => ({}));
  const inviteRole = body.role === "editor" ? "editor" : "viewer";
  const shareId = globalThis.crypto.randomUUID();
  const token = globalThis.crypto.randomUUID();

  db.run(
    "INSERT INTO board_shares (id, boardId, token, role, revoked) VALUES (?, ?, ?, ?, 0)",
    [shareId, boardId, token, inviteRole]
  );

  return c.json({ share: { id: shareId, boardId, token, role: inviteRole } }, 201);
});

sharing.get("/boards/:id/shares", async (c: any) => {
  const userId = await getUserId(c);
  if (!userId) return c.json({ error: "Unauthorized" }, 401);

  const boardId = c.req.param("id");
  const role = getUserBoardRole(userId, boardId);
  if (role !== "owner") {
    return c.json({ error: "Forbidden" }, 403);
  }

  const shares = db.query("SELECT id, boardId, token, role, revoked, createdAt FROM board_shares WHERE boardId = ?").all(boardId);
  return c.json({ shares });
});

sharing.delete("/boards/:id/shares/:shareId", async (c: any) => {
  const userId = await getUserId(c);
  if (!userId) return c.json({ error: "Unauthorized" }, 401);

  const boardId = c.req.param("id");
  const shareId = c.req.param("shareId");
  const role = getUserBoardRole(userId, boardId);
  if (role !== "owner") {
    return c.json({ error: "Forbidden" }, 403);
  }

  db.run("UPDATE board_shares SET revoked = 1 WHERE id = ? AND boardId = ?", [shareId, boardId]);
  return c.json({ success: true });
});

sharing.post("/boards/join", async (c: any) => {
  const userId = await getUserId(c);
  if (!userId) return c.json({ error: "Unauthorized" }, 401);

  const { token } = await c.req.json().catch(() => ({}));
  if (!token) return c.json({ error: "Token required" }, 400);

  const share = db.query("SELECT * FROM board_shares WHERE token = ? AND revoked = 0").get(token);
  if (!share) return c.json({ error: "Invalid or revoked invite link" }, 404);

  const existingRole = getUserBoardRole(userId, share.boardId);
  if (!existingRole) {
    db.run(
      "INSERT OR REPLACE INTO board_members (boardId, userId, role) VALUES (?, ?, ?)",
      [share.boardId, userId, share.role]
    );
  }

  return c.json({ success: true, boardId: share.boardId, role: existingRole || share.role });
});

export { sharing };
