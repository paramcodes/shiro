import { getMigrations } from './node_modules/.bun/better-auth@1.7.12+ab9c01e4ccdf52df/node_modules/better-auth/dist/db/get-migration.mjs';
import { Database } from 'bun:sqlite';
import { betterAuth } from './node_modules/.bun/better-auth@1.7.12+ab9c01e4ccdf52df/node_modules/better-auth/dist/auth/index.mjs';

// Initialize betterAuth
const auth = betterAuth({
  database: new Database('/home/param/Work/shiro/apps/server/data/auth.sqlite'),
  secret: 'dev-secret',
  emailAndPassword: { enabled: true },
  baseURL: 'http://localhost:3001',
});

// Get migrations - throwOnUnsafe: false to get plan instead of throwing
const result = await getMigrations(auth.config, { throwOnUnsafe: false });
console.log('=== Compiled Migrations SQL ===');
console.log(result.compileMigrations());
console.log('=== To Be Created ===');
console.log(JSON.stringify(result.toBeCreated, null, 2));
console.log('=== To Be Added ===');
console.log(JSON.stringify(result.toBeAdded, null, 2));
console.log('=== Unsafe Changes ===');
console.log(JSON.stringify(result.unsafeChanges, null, 2));
console.log('=== Schema Problems ===');
console.log(JSON.stringify(result.schemaProblems, null, 2));
