import { describe, it, expect, beforeEach } from "bun:test";
import app from "../../apps/server/src/index";
import db from "../../apps/server/src/db";

async function createTestUser(email: string) {
  const id = crypto.randomUUID();
  db.run("INSERT INTO user (id, name, email, emailVerified, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?)", 
    [id, "Test User", email, 1, new Date().toISOString(), new Date().toISOString()]);
  return { id, email };
}

describe("Board Sharing and Roles", () => {
  let owner: any;
  let viewerUser: any;
  let editorUser: any;
  let board: any;

  beforeEach(async () => {
    db.run("DELETE FROM board_shares");
    db.run("DELETE FROM board_members");
    db.run("DELETE FROM boards");
    db.run("DELETE FROM session");
    db.run("DELETE FROM user");

    owner = await createTestUser("owner@example.com");
    viewerUser = await createTestUser("viewer@example.com");
    editorUser = await createTestUser("editor@example.com");

    // Create board for owner
    const boardId = crypto.randomUUID();
    db.run("INSERT INTO boards (id, name, ownerId) VALUES (?, ?, ?)", [boardId, "Shared Board", owner.id]);
    board = { id: boardId, name: "Shared Board", ownerId: owner.id };
  });

  async function request(method: string, path: string, body?: any, userId?: string) {
    const headers = new Headers();
    if (userId) {
      headers.append("x-test-user-id", userId);
    }
    if (body) {
      headers.append("Content-Type", "application/json");
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

  it("allows owner to create viewer and editor invite links", async () => {
    const res = await request("POST", `/api/boards/${board.id}/shares`, { role: "viewer" }, owner.id);
    expect(res.status).toBe(201);
    const data = await res.json();
    expect(data.share.token).toBeDefined();
    expect(data.share.role).toBe("viewer");
  });

  it("allows invited user to join and grants correct role", async () => {
    // Owner creates viewer invite
    const createRes = await request("POST", `/api/boards/${board.id}/shares`, { role: "viewer" }, owner.id);
    const { token } = (await createRes.json()).share;

    // Viewer joins
    const joinRes = await request("POST", "/api/boards/join", { token }, viewerUser.id);
    expect(joinRes.status).toBe(200);
    const joinData = await joinRes.json();
    expect(joinData.boardId).toBe(board.id);
    expect(joinData.role).toBe("viewer");
  });

  it("denies access to revoked invite links", async () => {
    const createRes = await request("POST", `/api/boards/${board.id}/shares`, { role: "editor" }, owner.id);
    const { id: shareId, token } = (await createRes.json()).share;

    // Revoke share
    const revokeRes = await request("DELETE", `/api/boards/${board.id}/shares/${shareId}`, null, owner.id);
    expect(revokeRes.status).toBe(200);

    // Try to join with revoked token
    const joinRes = await request("POST", "/api/boards/join", { token }, editorUser.id);
    expect(joinRes.status).toBe(404);
  });
});
