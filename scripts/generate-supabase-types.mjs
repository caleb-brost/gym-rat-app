#!/usr/bin/env node

import { spawn } from 'node:child_process';
import { existsSync, promises as fs } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { config as loadEnv } from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const envPath = resolve(__dirname, '../.env');

if (existsSync(envPath)) {
  loadEnv({ path: envPath });
}

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;

if (!supabaseUrl) {
  console.error('Missing EXPO_PUBLIC_SUPABASE_URL environment variable.');
  process.exit(1);
}

const projectMatch = supabaseUrl.match(/^https:\/\/([^.]+)\.supabase\.co/);

if (!projectMatch) {
  console.error(
    'Unable to derive the Supabase project reference from EXPO_PUBLIC_SUPABASE_URL.'
  );
  process.exit(1);
}

const projectRef = projectMatch[1];
const schemaEnv = process.env.SUPABASE_SCHEMAS ?? 'public';
const schemas = schemaEnv
  .split(',')
  .map((schema) => schema.trim())
  .filter(Boolean);

if (schemas.length === 0) {
  console.error('At least one schema must be provided via SUPABASE_SCHEMAS.');
  process.exit(1);
}

if (!process.env.SUPABASE_ACCESS_TOKEN) {
  console.warn(
    'Warning: SUPABASE_ACCESS_TOKEN is not set. The Supabase CLI requires an access token when generating types.'
  );
}

const baseArgs = ['gen', 'types', 'typescript', '--project-id', projectRef];
schemas.forEach((schema) => {
  baseArgs.push('--schema', schema);
});

const typesPath = resolve(__dirname, '../types/supabase.ts');
const header =
  '// Code generated via scripts/generate-supabase-types.mjs. Do not edit manually.\n\n';

const env = { ...process.env };

const runCommand = (command, args) =>
  new Promise((resolve, reject) => {
    const child = spawn(command, args, { env, stdio: ['ignore', 'pipe', 'inherit'] });

    child.once('error', (error) => {
      reject(error);
    });

    const chunks = [];
    child.stdout.setEncoding('utf8');
    child.stdout.on('data', (chunk) => {
      chunks.push(chunk);
    });

    child.on('close', (code) => {
      if (code === 0) {
        resolve(chunks.join(''));
      } else {
        const error = new Error(`${command} exited with code ${code ?? 'unknown'}`);
        error.code = code;
        reject(error);
      }
    });
  });

const writeTypesFile = async (content) => {
  const withTrailingNewline = content.endsWith('\n') ? content : `${content}\n`;
  await fs.writeFile(typesPath, `${header}${withTrailingNewline}`, 'utf8');
};

const main = async () => {
  try {
    const output = await runCommand('supabase', baseArgs).catch(async (error) => {
      if (error && error.code === 'ENOENT') {
        console.log('Supabase CLI not found on PATH. Falling back to `npx supabase`.');
        return runCommand('npx', ['supabase', ...baseArgs]);
      }

      throw error;
    });

    await writeTypesFile(output);
    console.log(`Supabase types written to ${typesPath}`);
  } catch (error) {
    console.error(error instanceof Error ? error.message : error);
    process.exit(1);
  }
};

main();
