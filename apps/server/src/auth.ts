import { betterAuth } from "better-auth";
import { Database } from "bun:sqlite";
export const auth = betterAuth({
  database: new Database("/home/param/Work/shiro/apps/server/data/auth.sqlite"),
  secret: process.env.AUTH_SECRET || "dev-secret",
  emailAndPassword: { enabled: true },
  baseURL: "http://localhost:3001",
});
