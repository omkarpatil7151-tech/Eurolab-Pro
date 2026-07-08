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
  ensureCompanyMasterSchema(database);
  ensureBathMasterSchema(database);

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

function ensureCompanyMasterSchema(activeDatabase: Database): void {
  const columnsResult = activeDatabase.exec("PRAGMA table_info(companies);")[0];
  const columnNames = new Set(columnsResult?.values.map((column) => String(column[1])) ?? []);

  if (!columnNames.has("address")) {
    activeDatabase.run(`
      PRAGMA foreign_keys = OFF;

      CREATE TABLE IF NOT EXISTS companies_master_migration (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        address TEXT NOT NULL DEFAULT '',
        contact_person TEXT NOT NULL DEFAULT '',
        mobile_number TEXT NOT NULL DEFAULT '',
        email TEXT NOT NULL DEFAULT '',
        gst_number TEXT NOT NULL DEFAULT '',
        city TEXT NOT NULL DEFAULT '',
        state TEXT NOT NULL DEFAULT '',
        pin_code TEXT NOT NULL DEFAULT '',
        is_active INTEGER NOT NULL DEFAULT 1,
        deleted_at TEXT,
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
      );

      INSERT INTO companies_master_migration (id, name)
      SELECT id, name FROM companies;

      DROP TABLE companies;
      ALTER TABLE companies_master_migration RENAME TO companies;

      PRAGMA foreign_keys = ON;
    `);
  }

  activeDatabase.run(`
    CREATE UNIQUE INDEX IF NOT EXISTS idx_companies_active_name
    ON companies (LOWER(name))
    WHERE deleted_at IS NULL;

    CREATE INDEX IF NOT EXISTS idx_companies_search
    ON companies (name, city, state, contact_person);
  `);
}

function ensureBathMasterSchema(activeDatabase: Database): void {
  const columnsResult = activeDatabase.exec("PRAGMA table_info(baths);")[0];
  const columnNames = new Set(columnsResult?.values.map((column) => String(column[1])) ?? []);

  if (!columnNames.has("company_id")) {
    activeDatabase.run(`
      PRAGMA foreign_keys = OFF;

      CREATE TABLE IF NOT EXISTS baths_master_migration (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        company_id INTEGER,
        bath_type TEXT NOT NULL DEFAULT '',
        capacity_litres REAL NOT NULL DEFAULT 0,
        operating_temperature TEXT NOT NULL DEFAULT '',
        current_density TEXT NOT NULL DEFAULT '',
        remarks TEXT NOT NULL DEFAULT '',
        is_active INTEGER NOT NULL DEFAULT 1,
        deleted_at TEXT,
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (company_id) REFERENCES companies(id)
      );

      INSERT INTO baths_master_migration (id, name)
      SELECT id, name FROM baths;

      DROP TABLE baths;
      ALTER TABLE baths_master_migration RENAME TO baths;

      PRAGMA foreign_keys = ON;
    `);
  }

  activeDatabase.run(`
    CREATE UNIQUE INDEX IF NOT EXISTS idx_baths_company_active_name
    ON baths (company_id, LOWER(name))
    WHERE deleted_at IS NULL;

    CREATE INDEX IF NOT EXISTS idx_baths_search
    ON baths (name, bath_type, company_id);
  `);
}
