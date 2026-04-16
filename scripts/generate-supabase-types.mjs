#!/usr/bin/env node

import { config as loadEnv } from "dotenv";
import { spawn } from "node:child_process";
import { existsSync, promises as fs } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const envPath = resolve(__dirname, "../.env");
if (existsSync(envPath)) {
  loadEnv({ path: envPath });
}

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;

if (!supabaseUrl) {
  console.error("Error: Missing EXPO_PUBLIC_SUPABASE_URL.");
  process.exit(1);
}

const cleanUrl = supabaseUrl.replace(/['"]/g, "").trim();
const projectRef = cleanUrl.split(".")[0].replace("https://", "");

if (!projectRef || projectRef.length < 5 || projectRef.includes(" ")) {
  console.error("Error: Invalid project ID parsed:", `"${projectRef}"`);
  process.exit(1);
}

const schemaEnv = process.env.SUPABASE_SCHEMAS ?? "public";
const schemas = schemaEnv
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

const rawToken = process.env.SUPABASE_ACCESS_TOKEN || "";
const authToken = rawToken.replace(/['"]/g, "").trim();

if (!authToken || !authToken.startsWith("sbp_")) {
  console.error("Error: Invalid or missing SUPABASE_ACCESS_TOKEN.");
  console.error(
    "Go to https://supabase.com/dashboard/account/tokens to generate one.",
  );
  process.exit(1);
}

const generateTypes = () => {
  // We'll use npx as the command and pass args separately
  const args = [
    "supabase",
    "gen",
    "types",
    "typescript",
    "--project-id",
    projectRef,
  ];

  schemas.forEach((s) => {
    args.push("--schema");
    args.push(s);
  });

  console.log(`Generating types for project ID: ${projectRef}...`);

  // Setting shell: false (default) and using 'npx' directly is safer
  const supabase = spawn("npx", args, {
    env: { ...process.env, SUPABASE_ACCESS_TOKEN: authToken },
    // On Windows, npx often needs shell: true, but on Mac/Linux it's better without.
    // Let's use a platform check just in case.
    shell: process.platform === "win32",
  });

  let output = "";
  let errorOutput = "";

  supabase.stdout.on("data", (data) => {
    output += data.toString();
  });

  supabase.stderr.on("data", (data) => {
    errorOutput += data.toString();
  });

  supabase.on("close", async (code) => {
    if (code !== 0) {
      console.error("Type generation failed:\n", errorOutput);
      return;
    }

    // SAFETY CHECK: If output is empty or too short, don't overwrite!
    if (output.trim().length < 100) {
      console.error(
        "Error: The CLI returned empty types. Check if your tables actually exist in the 'public' schema.",
      );
      console.log("CLI Error Output:", errorOutput);
      return;
    }

    const typesPath = resolve(__dirname, "../types/supabase.ts");
    const header =
      "// Code generated via scripts/generate-supabase-types.mjs. Do not edit manually.\n\n";

    try {
      await fs.mkdir(dirname(typesPath), { recursive: true });
      await fs.writeFile(typesPath, header + output);
      console.log(`Types successfully saved to ${typesPath}`);
    } catch (err) {
      console.error("Failed to write types file:", err);
    }
  });
};

generateTypes();
