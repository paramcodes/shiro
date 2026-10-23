import { describe, it, expect, beforeEach } from "bun:test";
import app from "../../apps/server/src/index";
import db from "../../apps/server/src/db";

async function createTestUser(email: string) {
  const id = crypto.randomUUID();
  db.run("INSERT INTO user (id, name, email, emailVerified, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?)", 
    [id, "Test User", email, 1, new Date().toISOString(), new Date().toISOString()]);
  return { id, email };
}

async function createSession(userId: string) {
  const sessionId = crypto.randomUUID();
  const token = crypto.randomUUID();
  const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString();
  
  db.run("INSERT INTO session (id, token, userId, expiresAt, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?)",
    [sessionId, token, userId, expiresAt, new Date().toISOString(), new Date().toISOString()]);
    
  return token;
}

describe("Board CRUD and Isolation", () => {
  let userA: any;
  let userB: any;
  let tokenA: string;
  let tokenB: string;

  beforeEach(async () => {
    db.run("DELETE FROM boards");
    db.run("DELETE FROM session");
    db.run("DELETE FROM user");

    userA = await createTestUser("userA@example.com");
    userB = await createTestUser("userB@example.com");
    tokenA = await createSession(userA.id);
    tokenB = await createSession(userB.id);
  });

  async function request(method: string, path: string, body?: any, userId?: string) {
    const headers = new Headers();
    if (userId) {
      headers.append("x-test-user-id", userId);
    }
    
    const res = await app.fetch(new Request(`http://localhost:3000${path}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    }));
    
    return {
      status: res.status,
      json: async () => await res.json(),
    };
  }

  it("allows user to create and list their own boards", async () => {
    const createRes = await request("POST", "/api/boards", { name: "Board A1" }, userA.id);
    expect(createRes.status).toBe(201);
    const board = (await createRes.json()).board;

    const listRes = await request("GET", "/api/boards", null, userA.id);
    expect(listRes.status).toBe(200);
    const { boards } = await listRes.json();
    expect(boards).toContainEqual(expect.objectContaining({ id: board.id, name: "Board A1" }));
  });

  it("ensures user cannot see another user's boards", async () => {
    // User A creates a board
    const createRes = await request("POST", "/api/boards", { name: "Private Board" }, userA.id);
    const board = (await createRes.json()).board;

    // User B tries to list boards
    const listRes = await request("GET", "/api/boards", null, userB.id);
    const { boards } = await listRes.json();
    expect(boards).not.toContainEqual(expect.objectContaining({ id: board.id }));
  });

  it("prevents accessing another user's board by ID", async () => {
    const createRes = await request("POST", "/api/boards", { name: "Private Board" }, userA.id);
    const board = (await createRes.json()).board;

    const getRes = await request("GET", `/api/boards/${board.id}`, null, userB.id);
    expect(getRes.status).toBe(404);
  });

  it("prevents updating another user's board", async () => {
    const createRes = await request("POST", "/api/boards", { name: "Private Board" }, userA.id);
    const board = (await createRes.json()).board;

    const updateRes = await request("PATCH", `/api/boards/${board.id}`, { name: "Hacked" }, userB.id);
    expect(updateRes.status).toBe(404);
  });

  it("prevents deleting another user's board", async () => {
    const createRes = await request("POST", "/api/boards", { name: "Private Board" }, userA.id);
    const board = (await createRes.json()).board;

    const deleteRes = await request("DELETE", `/api/boards/${board.id}`, null, userB.id);
    expect(deleteRes.status).toBe(404);
  });

  it("allows updating and deleting own boards", async () => {
    const createRes = await request("POST", "/api/boards", { name: "My Board" }, userA.id);
    const board = (await createRes.json()).board;

    const updateRes = await request("PATCH", `/api/boards/${board.id}`, { name: "Updated Name" }, userA.id);
    expect(updateRes.status).toBe(200);

    const deleteRes = await request("DELETE", `/api/boards/${board.id}`, null, userA.id);
    expect(deleteRes.status).toBe(200);

    const getRes = await request("GET", `/api/boards/${board.id}`, null, userA.id);
    expect(getRes.status).toBe(404);
  });
});
