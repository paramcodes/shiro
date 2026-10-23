import db from "../db";

export interface StorageAdapter {
  saveState(boardId: string, state: string): void;
  getState(boardId: string): string | null;
}

export class SQLiteStorageAdapter implements StorageAdapter {
  saveState(boardId: string, state: string): void {
    db.run(
      "INSERT INTO canvas_state (boardId, data, updatedAt) VALUES (?, ?, CURRENT_TIMESTAMP) ON CONFLICT(boardId) DO UPDATE SET data = excluded.data, updatedAt = excluded.updatedAt",
      [boardId, state]
    );
  }

  getState(boardId: string): string | null {
    const row = db.query("SELECT data FROM canvas_state WHERE boardId = ?").get(boardId);
    return row ? (row.data as string) : null;
  }
}

export const storage = new SQLiteStorageAdapter();
