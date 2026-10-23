import { Hono } from "hono";
import { auth } from "./auth";
import { boards } from "./boards";
import { sharing, getUserBoardRole } from "./sharing";
import { syncServer } from "./sync/server";

const app = new Hono();
app.all("/api/auth/*", (c) => auth.handler(c.req.raw));
app.route("/api/boards", boards);
app.route("/api", sharing);
app.get("/health", (c) => c.json({ ok: true }));

export default {
  fetch: app.fetch,
  auth,
  websocket: {
    async handleRequest(req: any, ws: any) {
      const url = new URL(req.url);
      const boardId = url.searchParams.get("boardId");
      const userIdParam = url.searchParams.get("userId");

      if (!boardId) {
        ws.close();
        return;
      }

      let userId: string | null | undefined = userIdParam;
      if (!userId) {
        try {
          const session = await auth.api.getSession({
            headers: req.headers,
          });
          userId = session?.user?.id;
        } catch (e) {
          // ignore
        }
      }

      if (!userId) {
        ws.close();
        return;
      }

      const role = getUserBoardRole(userId, boardId);
      if (!role) {
        ws.close();
        return;
      }

      syncServer.handleConnection(ws, boardId, role);
    },
  },
};
