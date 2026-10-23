import { storage } from "./storage";

export type SyncMessage = {
  type: "update";
  payload: string;
} | {
  type: "init";
  payload: string | null;
  role?: string;
};

export class SyncRoom {
  public clients = new Set<WebSocket>();

  constructor(public boardId: string) {}

  addClient(ws: WebSocket, role: string = "editor") {
    this.clients.add(ws);
    
    // Send initial state with role
    const state = storage.getState(this.boardId);
    ws.send(JSON.stringify({ type: "init", payload: state, role }));
  }

  removeClient(ws: WebSocket) {
    this.clients.delete(ws);
  }

  broadcast(message: SyncMessage, excludeWs?: WebSocket) {
    const data = JSON.stringify(message);
    for (const client of this.clients) {
      if (client !== excludeWs && client.readyState === WebSocket.OPEN) {
        client.send(data);
      }
    }
  }

  saveAndBroadcast(state: string, excludeWs: WebSocket) {
    storage.saveState(this.boardId, state);
    this.broadcast({ type: "update", payload: state }, excludeWs);
  }
}

export class SyncServer {
  private rooms = new Map<string, SyncRoom>();

  handleConnection(ws: WebSocket, boardId: string, role: "owner" | "editor" | "viewer" = "editor") {
    let room = this.rooms.get(boardId);
    if (!room) {
      room = new SyncRoom(boardId);
      this.rooms.set(boardId, room);
    }

    room.addClient(ws, role);

    ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data as string);
        if (message.type === "update" && typeof message.payload === "string") {
          if (role === "viewer") {
            // Viewers cannot update
            return;
          }
          room.saveAndBroadcast(message.payload, ws);
        }
      } catch (e) {
        console.error("Failed to process sync message", e);
      }
    };

    ws.onclose = () => {
      room.removeClient(ws);
      if (room.clients.size === 0) {
        this.rooms.delete(boardId);
      }
    };
  }
}

export const syncServer = new SyncServer();
