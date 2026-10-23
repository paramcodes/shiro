declare module "bun:sqlite" {
  export class Database {
    constructor(path: string);
    run(sql: string, params?: any[] | Record<string, any>): { changes: number; lastInsertRowid: number | bigint };
    query(sql: string): {
      get(...params: any[]): any;
      all(...params: any[]): any[];
    };
  }
}

declare namespace NodeJS {
  interface ProcessEnv {
    [key: string]: string | undefined;
  }
}

declare const process: {
  env: NodeJS.ProcessEnv;
  cwd(): string;
};
