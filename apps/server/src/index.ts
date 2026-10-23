import { Hono } from "hono";
import { auth } from "./auth";
const app = new Hono();
app.on(["GET", "POST"], "/api/auth/**", (c) => auth.handler(c.req.raw));
app.get("/health", (c) => c.json({ ok: true }));
export default { fetch: app.fetch, auth };
