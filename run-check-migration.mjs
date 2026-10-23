import { getMigrations } from 'node_modules/better-auth/dist/db/get-migration.mjs';
import { Database } from 'bun:sqlite';
import { betterAuth } from 'node_modules/better-auth/dist/auth/index.mjs';

// Initialize betterAuth
const auth = betterAuth({
  database: new Database('/home/param/Work/shiro/apps/server/data/auth.sqlite'),
  secret: 'dev-secret-dev-secret-dev-secret',
  emailAndPassword: { enabled: true },
  baseURL: 'http://localhost:3001',
});

// Get migrations - throwOnUnsafe: false to get plan instead of throwing
const result = await getMigrations(auth.config, { throwOnUnsafe: false });
console.log('=== Compiled Migrations SQL ===');
console.log(result.compileMigrations());
