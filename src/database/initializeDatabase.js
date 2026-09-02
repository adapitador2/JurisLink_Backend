import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import pool from "./database.js";

const currentDirectory = path.dirname(fileURLToPath(import.meta.url));
const schemaPath = path.resolve(currentDirectory, "../../docker/mysql/init/01_schema.sql");

export default async function initializeDatabase() {
  const schema = await fs.readFile(schemaPath, "utf8");
  await pool.query(schema);
  console.log("[database] Schema do JurisLink verificado com sucesso");
}
