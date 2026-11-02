#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const schemaPath = path.join(__dirname, '..', 'prisma', 'schema.prisma');
if (!fs.existsSync(schemaPath)) {
  process.exit(0);
}

const schemaContent = fs.readFileSync(schemaPath, 'utf8');

const databaseUrl = (process.env.DATABASE_URL || '').trim();
const databaseProvider = (process.env.DATABASE_PROVIDER || '').trim().toLowerCase();
const nodeEnv = (process.env.NODE_ENV || '').trim().toLowerCase();

let targetProvider = 'sqlite';

if (databaseProvider === 'postgresql' || databaseProvider === 'postgres') {
  targetProvider = 'postgresql';
} else if (databaseProvider === 'sqlite') {
  targetProvider = 'sqlite';
} else if (databaseUrl.startsWith('postgresql://') || databaseUrl.startsWith('postgres://')) {
  targetProvider = 'postgresql';
} else if (nodeEnv === 'production' && !databaseUrl.startsWith('file:')) {
  targetProvider = 'postgresql';
} else {
  targetProvider = 'sqlite';
}

const currentProviderMatch = schemaContent.match(
  /datasource\s+db\s*\{[\s\S]*?provider\s*=\s*"([^"]+)"/
);
const currentProvider = currentProviderMatch ? currentProviderMatch[1] : null;

if (currentProvider !== targetProvider) {
  const updatedContent = schemaContent.replace(
    /datasource\s+db\s*\{[\s\S]*?provider\s*=\s*"[^"]+"/,
    (match) => match.replace(/provider\s*=\s*"[^"]+"/, `provider = "${targetProvider}"`)
  );
  fs.writeFileSync(schemaPath, updatedContent, 'utf8');
  console.log(
    `[db-provider] Configured Prisma provider: ${targetProvider} (was: ${currentProvider})`
  );
}
