import { Database } from "bun:sqlite";

const db = new Database(process.cwd() + "/apps/server/data/auth.sqlite");

// Initialize tables
db.run(`
  CREATE TABLE IF NOT EXISTS boards (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    ownerId TEXT NOT NULL,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (ownerId) REFERENCES user(id)
  )
`);

db.run(`
  CREATE TABLE IF NOT EXISTS canvas_state (
    boardId TEXT PRIMARY KEY,
    data TEXT NOT NULL,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (boardId) REFERENCES boards(id)
  )
`);

db.run(`
  CREATE TABLE IF NOT EXISTS board_shares (
    id TEXT PRIMARY KEY,
    boardId TEXT NOT NULL,
    token TEXT UNIQUE NOT NULL,
    role TEXT NOT NULL CHECK(role IN ('viewer', 'editor')),
    revoked INTEGER DEFAULT 0,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (boardId) REFERENCES boards(id)
  )
`);

db.run(`
  CREATE TABLE IF NOT EXISTS board_members (
    boardId TEXT NOT NULL,
    userId TEXT NOT NULL,
    role TEXT NOT NULL CHECK(role IN ('owner', 'editor', 'viewer')),
    PRIMARY KEY (boardId, userId),
    FOREIGN KEY (boardId) REFERENCES boards(id),
    FOREIGN KEY (userId) REFERENCES user(id)
  )
`);

export default db;
