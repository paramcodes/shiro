declare module "bun:sqlite" {
  export class Database {
    constructor(path: string);
  }
}
declare const process: { env: Record<string, string | undefined> };
