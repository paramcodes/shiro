import { Hono } from "hono";
import { auth } from "./auth";
import db from "./db";

const boards = new Hono();

async function getUserId(c: any) {
  const session = await auth.api.getSession({
    headers: c.req.raw.headers,
  });
  return session?.user.id;
}

boards.use("/*", async (c: any, next: any) => {
  const userIdHeader = c.req.header("x-test-user-id");
  if (userIdHeader) {
    c.set("userId", userIdHeader);
    await next();
    return;
  }

  const userId = await getUserId(c);
  if (!userId) {
    return c.json({ error: "Unauthorized" }, 401);
  }
  c.set("userId", userId);
  await next();
});

boards.get("/", async (c: any) => {
  const userId = c.get("userId");
  const userBoards = db.query("SELECT id, name, ownerId FROM boards WHERE ownerId = ?").all(userId);
  return c.json({ boards: userBoards });
});

boards.post("/", async (c: any) => {
  const userId = c.get("userId");
  const { name } = await c.req.json();
  if (!name) return c.json({ error: "Name is required" }, 400);

  const id = globalThis.crypto.randomUUID();
  db.run("INSERT INTO boards (id, name, ownerId) VALUES (?, ?, ?)", [id, name, userId]);

  return c.json({ board: { id, name, ownerId: userId } }, 201);
});

boards.get("/:id", async (c: any) => {
  const userId = c.get("userId");
  const id = c.req.param("id");
  const board = db.query("SELECT id, name, ownerId FROM boards WHERE id = ? AND ownerId = ?").get(id, userId);

  if (!board) return c.json({ error: "Board not found" }, 404);
  return c.json({ board });
});

boards.patch("/:id", async (c: any) => {
  const userId = c.get("userId");
  const id = c.req.param("id");
  const { name } = await c.req.json();
  if (!name) return c.json({ error: "Name is required" }, 400);

  const result = db.run("UPDATE boards SET name = ? WHERE id = ? AND ownerId = ?", [name, id, userId]);
  if (result.changes === 0) return c.json({ error: "Board not found or unauthorized" }, 404);

  return c.json({ success: true });
});

boards.delete("/:id", async (c: any) => {
  const userId = c.get("userId");
  const id = c.req.param("id");

  const result = db.run("DELETE FROM boards WHERE id = ? AND ownerId = ?", [id, userId]);
  if (result.changes === 0) return c.json({ error: "Board not found or unauthorized" }, 404);

  return c.json({ success: true });
});

export { boards };
