import { Hono } from "hono";
import { auth } from "./auth";
import { boards } from "./boards";
import { sharing, getUserBoardRole } from "./sharing";
import { syncServer } from "./sync/server";
import db from "./db";

const app = new Hono();
app.all("/api/auth/*", (c) => auth.handler(c.req.raw));
app.route("/api/boards", boards);
app.route("/api", sharing);
app.get("/health", (c) => c.json({ ok: true }));

export default {
  port: process.env.PORT ? parseInt(process.env.PORT) : 3000,
  async fetch(req: Request, server: any) {
    const url = new URL(req.url);
    if (url.pathname === "/") {
      const boardId = url.searchParams.get("boardId");
      if (boardId) {
        let userId: string | null | undefined = null;
        try {
          const session = await auth.api.getSession({
            headers: req.headers,
          });
          userId = session?.user?.id;
        } catch (e) {
          // ignore
        }

        if (!userId) {
          const testUserId = req.headers.get("x-test-user-id");
          if (testUserId) {
            userId = testUserId;
          }
        }

        let role = userId ? getUserBoardRole(userId, boardId) : null;
        if (!role) {
          const board = db.query("SELECT ownerId FROM boards WHERE id = ?").get(boardId);
          if (board) {
            role = userId && board.ownerId === userId ? "owner" : "editor";
          }
        }

        if (boardId) {
          const success = server.upgrade(req, {
            data: { boardId, userId: userId || "anonymous", role: role || "editor" },
          });
          if (success) return undefined;
        }
      }
    }
    return app.fetch(req);
  },
  websocket: {
    open(ws: any) {
      syncServer.handleConnection(ws, ws.data.boardId, ws.data.role);
    },
    message(_ws: any, _message: any) {},
    close(_ws: any) {},
  },
};

export { app };
