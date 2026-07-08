import initSqlJs, { type Database } from "sql.js";
import fs from "node:fs";
import path from "node:path";

let database: Database | null = null;
let activeDatabasePath: string | null = null;

export async function initializeDatabase(userDataPath: string): Promise<Database> {
  if (database) {
    return database;
  }

  const databaseDirectory = path.join(userDataPath, "database");
  const databasePath = path.join(databaseDirectory, "eurolab-pro.sqlite");
  fs.mkdirSync(databaseDirectory, { recursive: true });

  const SQL = await initSqlJs();
  const existingDatabase = fs.existsSync(databasePath) ? fs.readFileSync(databasePath) : undefined;

  database = new SQL.Database(existingDatabase);
  activeDatabasePath = databasePath;
  database.run("PRAGMA foreign_keys = ON;");
  database.run(`
    CREATE TABLE IF NOT EXISTS companies (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE
    );

    CREATE TABLE IF NOT EXISTS baths (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE
    );

    CREATE TABLE IF NOT EXISTS sample_receivings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      certificate_number TEXT NOT NULL UNIQUE,
      company_id INTEGER NOT NULL,
      bath_id INTEGER NOT NULL,
      received_date TEXT NOT NULL,
      analysis_date TEXT NOT NULL,
      submission_date TEXT NOT NULL,
      received_by TEXT NOT NULL,
      testing_type TEXT NOT NULL CHECK (testing_type IN ('AMC', 'Free', 'Chargeable')),
      billed_to TEXT NOT NULL,
      email TEXT NOT NULL,
      mobile TEXT NOT NULL,
      sample_description TEXT NOT NULL,
      remarks TEXT,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (company_id) REFERENCES companies(id),
      FOREIGN KEY (bath_id) REFERENCES baths(id)
    );
  `);

  return database;
}

export function getDatabase(): Database {
  if (!database) {
    throw new Error("Database has not been initialized.");
  }

  return database;
}

export function persistDatabase(): void {
  if (!database || !activeDatabasePath) {
    throw new Error("Database has not been initialized.");
  }

  fs.writeFileSync(activeDatabasePath, Buffer.from(database.export()));
}
