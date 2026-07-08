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
  createDatabaseFreezeV1Schema(database);
  ensureCompanyMasterSchema(database);
  ensureBathMasterSchema(database);
  ensureSampleReceivingSchema(database);
  ensureStandardMasterSchema(database);
  createDatabaseFreezeV1Indexes(database);
  markSchemaVersion(database, 1, "database-freeze-v1");
  persistDatabase();

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

function createDatabaseFreezeV1Schema(activeDatabase: Database): void {
  activeDatabase.run(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      version INTEGER PRIMARY KEY,
      name TEXT NOT NULL UNIQUE,
      applied_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS companies (
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
      is_active INTEGER NOT NULL DEFAULT 1 CHECK (is_active IN (0, 1)),
      deleted_at TEXT,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CHECK (LENGTH(TRIM(name)) > 0)
    );

    CREATE TABLE IF NOT EXISTS baths (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      company_id INTEGER NOT NULL,
      bath_type TEXT NOT NULL DEFAULT '',
      capacity_litres REAL NOT NULL DEFAULT 0 CHECK (capacity_litres >= 0),
      operating_temperature TEXT NOT NULL DEFAULT '',
      current_density TEXT NOT NULL DEFAULT '',
      remarks TEXT NOT NULL DEFAULT '',
      is_active INTEGER NOT NULL DEFAULT 1 CHECK (is_active IN (0, 1)),
      deleted_at TEXT,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CHECK (LENGTH(TRIM(name)) > 0),
      FOREIGN KEY (company_id) REFERENCES companies(id) ON UPDATE CASCADE ON DELETE RESTRICT
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
      remarks TEXT NOT NULL DEFAULT '',
      is_active INTEGER NOT NULL DEFAULT 1 CHECK (is_active IN (0, 1)),
      deleted_at TEXT,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CHECK (LENGTH(TRIM(certificate_number)) > 0),
      FOREIGN KEY (company_id) REFERENCES companies(id) ON UPDATE CASCADE ON DELETE RESTRICT,
      FOREIGN KEY (bath_id) REFERENCES baths(id) ON UPDATE CASCADE ON DELETE RESTRICT
    );

    CREATE TABLE IF NOT EXISTS formula_master (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      code TEXT NOT NULL,
      name TEXT NOT NULL,
      expression TEXT NOT NULL,
      unit TEXT NOT NULL DEFAULT '',
      description TEXT NOT NULL DEFAULT '',
      is_active INTEGER NOT NULL DEFAULT 1 CHECK (is_active IN (0, 1)),
      deleted_at TEXT,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CHECK (LENGTH(TRIM(code)) > 0),
      CHECK (LENGTH(TRIM(name)) > 0),
      CHECK (LENGTH(TRIM(expression)) > 0)
    );

    CREATE TABLE IF NOT EXISTS standard_master (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      metal TEXT NOT NULL,
      standard_name TEXT NOT NULL,
      original_concentration REAL NOT NULL CHECK (original_concentration > 0),
      unit TEXT NOT NULL DEFAULT '',
      remarks TEXT NOT NULL DEFAULT '',
      is_active INTEGER NOT NULL DEFAULT 1 CHECK (is_active IN (0, 1)),
      deleted_at TEXT,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CHECK (LENGTH(TRIM(metal)) > 0),
      CHECK (LENGTH(TRIM(standard_name)) > 0),
      CHECK (LENGTH(TRIM(unit)) > 0)
    );

    CREATE TABLE IF NOT EXISTS calibration_runs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      standard_id INTEGER,
      instrument_name TEXT NOT NULL,
      calibration_date TEXT NOT NULL,
      due_date TEXT,
      performed_by TEXT NOT NULL,
      result_status TEXT NOT NULL CHECK (result_status IN ('Pass', 'Fail', 'Conditional')),
      remarks TEXT NOT NULL DEFAULT '',
      is_active INTEGER NOT NULL DEFAULT 1 CHECK (is_active IN (0, 1)),
      deleted_at TEXT,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CHECK (LENGTH(TRIM(instrument_name)) > 0),
      CHECK (LENGTH(TRIM(performed_by)) > 0),
      FOREIGN KEY (standard_id) REFERENCES standard_master(id) ON UPDATE CASCADE ON DELETE RESTRICT
    );

    CREATE TABLE IF NOT EXISTS analyses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      sample_receiving_id INTEGER NOT NULL,
      status TEXT NOT NULL DEFAULT 'Pending' CHECK (status IN ('Pending', 'In Progress', 'Completed', 'Approved', 'Rejected')),
      analyst_name TEXT NOT NULL DEFAULT '',
      started_at TEXT,
      completed_at TEXT,
      remarks TEXT NOT NULL DEFAULT '',
      is_active INTEGER NOT NULL DEFAULT 1 CHECK (is_active IN (0, 1)),
      deleted_at TEXT,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (sample_receiving_id) REFERENCES sample_receivings(id) ON UPDATE CASCADE ON DELETE RESTRICT
    );

    CREATE TABLE IF NOT EXISTS analysis_results (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      analysis_id INTEGER NOT NULL,
      formula_id INTEGER,
      standard_id INTEGER,
      calibration_run_id INTEGER,
      parameter_name TEXT NOT NULL,
      unit TEXT NOT NULL DEFAULT '',
      raw_value REAL,
      calculated_value REAL,
      result_text TEXT NOT NULL DEFAULT '',
      specification TEXT NOT NULL DEFAULT '',
      result_status TEXT NOT NULL DEFAULT 'Pending' CHECK (result_status IN ('Pending', 'Pass', 'Fail', 'Not Applicable')),
      remarks TEXT NOT NULL DEFAULT '',
      is_active INTEGER NOT NULL DEFAULT 1 CHECK (is_active IN (0, 1)),
      deleted_at TEXT,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CHECK (LENGTH(TRIM(parameter_name)) > 0),
      FOREIGN KEY (analysis_id) REFERENCES analyses(id) ON UPDATE CASCADE ON DELETE RESTRICT,
      FOREIGN KEY (formula_id) REFERENCES formula_master(id) ON UPDATE CASCADE ON DELETE RESTRICT,
      FOREIGN KEY (standard_id) REFERENCES standard_master(id) ON UPDATE CASCADE ON DELETE RESTRICT,
      FOREIGN KEY (calibration_run_id) REFERENCES calibration_runs(id) ON UPDATE CASCADE ON DELETE RESTRICT
    );

    CREATE TABLE IF NOT EXISTS report_history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      sample_receiving_id INTEGER NOT NULL,
      analysis_id INTEGER,
      report_number TEXT NOT NULL UNIQUE,
      report_type TEXT NOT NULL CHECK (report_type IN ('Word', 'PDF', 'Excel')),
      file_path TEXT NOT NULL,
      generated_by TEXT NOT NULL,
      generated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      is_active INTEGER NOT NULL DEFAULT 1 CHECK (is_active IN (0, 1)),
      deleted_at TEXT,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CHECK (LENGTH(TRIM(report_number)) > 0),
      CHECK (LENGTH(TRIM(file_path)) > 0),
      CHECK (LENGTH(TRIM(generated_by)) > 0),
      FOREIGN KEY (sample_receiving_id) REFERENCES sample_receivings(id) ON UPDATE CASCADE ON DELETE RESTRICT,
      FOREIGN KEY (analysis_id) REFERENCES analyses(id) ON UPDATE CASCADE ON DELETE RESTRICT
    );

    CREATE TABLE IF NOT EXISTS audit_log (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      entity_type TEXT NOT NULL,
      entity_id INTEGER,
      action TEXT NOT NULL CHECK (action IN ('CREATE', 'UPDATE', 'SOFT_DELETE', 'RESTORE', 'LOGIN', 'LOGOUT', 'EXPORT', 'PRINT')),
      summary TEXT NOT NULL,
      metadata_json TEXT NOT NULL DEFAULT '{}',
      performed_by TEXT NOT NULL DEFAULT 'system',
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CHECK (LENGTH(TRIM(entity_type)) > 0),
      CHECK (LENGTH(TRIM(summary)) > 0),
      CHECK (LENGTH(TRIM(performed_by)) > 0)
    );
  `);
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

function ensureSampleReceivingSchema(activeDatabase: Database): void {
  addColumnIfMissing(activeDatabase, "sample_receivings", "is_active", "INTEGER NOT NULL DEFAULT 1");
  addColumnIfMissing(activeDatabase, "sample_receivings", "deleted_at", "TEXT");
  addColumnIfMissing(activeDatabase, "sample_receivings", "updated_at", "TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP");

  activeDatabase.run(`
    UPDATE sample_receivings
    SET remarks = COALESCE(remarks, ''),
        updated_at = COALESCE(updated_at, created_at, CURRENT_TIMESTAMP)
    WHERE remarks IS NULL OR updated_at IS NULL;
  `);
}

function ensureStandardMasterSchema(activeDatabase: Database): void {
  const columnsResult = activeDatabase.exec("PRAGMA table_info(standard_master);")[0];
  const columnNames = new Set(columnsResult?.values.map((column) => String(column[1])) ?? []);

  if (!columnNames.has("metal")) {
    activeDatabase.run(`
      PRAGMA foreign_keys = OFF;

      CREATE TABLE IF NOT EXISTS standard_master_migration (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        metal TEXT NOT NULL,
        standard_name TEXT NOT NULL,
        original_concentration REAL NOT NULL CHECK (original_concentration > 0),
        unit TEXT NOT NULL DEFAULT '',
        remarks TEXT NOT NULL DEFAULT '',
        is_active INTEGER NOT NULL DEFAULT 1 CHECK (is_active IN (0, 1)),
        deleted_at TEXT,
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CHECK (LENGTH(TRIM(metal)) > 0),
        CHECK (LENGTH(TRIM(standard_name)) > 0),
        CHECK (LENGTH(TRIM(unit)) > 0)
      );

      INSERT INTO standard_master_migration (
        id, metal, standard_name, original_concentration, unit, remarks, is_active, deleted_at, created_at, updated_at
      )
      SELECT
        id,
        COALESCE(NULLIF(TRIM(code), ''), 'Unknown'),
        COALESCE(NULLIF(TRIM(name), ''), 'Standard'),
        COALESCE(NULLIF(nominal_value, 0), 1),
        COALESCE(NULLIF(TRIM(unit), ''), 'ppm'),
        COALESCE(remarks, ''),
        COALESCE(is_active, 1),
        deleted_at,
        COALESCE(created_at, CURRENT_TIMESTAMP),
        COALESCE(updated_at, CURRENT_TIMESTAMP)
      FROM standard_master;

      DROP TABLE standard_master;
      ALTER TABLE standard_master_migration RENAME TO standard_master;

      PRAGMA foreign_keys = ON;
    `);
  }
}

function createDatabaseFreezeV1Indexes(activeDatabase: Database): void {
  activeDatabase.run(`
    CREATE UNIQUE INDEX IF NOT EXISTS idx_companies_active_name
    ON companies (LOWER(name))
    WHERE deleted_at IS NULL;

    CREATE INDEX IF NOT EXISTS idx_companies_active
    ON companies (is_active, deleted_at);

    CREATE INDEX IF NOT EXISTS idx_companies_search
    ON companies (name, city, state, contact_person);

    CREATE UNIQUE INDEX IF NOT EXISTS idx_baths_company_active_name
    ON baths (company_id, LOWER(name))
    WHERE deleted_at IS NULL;

    CREATE INDEX IF NOT EXISTS idx_baths_company_active
    ON baths (company_id, is_active, deleted_at);

    CREATE INDEX IF NOT EXISTS idx_baths_search
    ON baths (name, bath_type, company_id);

    CREATE INDEX IF NOT EXISTS idx_sample_receivings_company
    ON sample_receivings (company_id, deleted_at);

    CREATE INDEX IF NOT EXISTS idx_sample_receivings_bath
    ON sample_receivings (bath_id, deleted_at);

    CREATE INDEX IF NOT EXISTS idx_sample_receivings_dates
    ON sample_receivings (received_date, analysis_date, submission_date);

    CREATE UNIQUE INDEX IF NOT EXISTS idx_formula_master_active_code
    ON formula_master (LOWER(code))
    WHERE deleted_at IS NULL;

    CREATE UNIQUE INDEX IF NOT EXISTS idx_formula_master_active_name
    ON formula_master (LOWER(name))
    WHERE deleted_at IS NULL;

    CREATE UNIQUE INDEX IF NOT EXISTS idx_standard_master_active_identity
    ON standard_master (LOWER(metal), LOWER(standard_name))
    WHERE deleted_at IS NULL;

    CREATE INDEX IF NOT EXISTS idx_standard_master_search
    ON standard_master (metal, standard_name, unit);

    CREATE INDEX IF NOT EXISTS idx_standard_master_active
    ON standard_master (is_active, deleted_at);

    CREATE INDEX IF NOT EXISTS idx_calibration_runs_standard
    ON calibration_runs (standard_id, calibration_date, deleted_at);

    CREATE INDEX IF NOT EXISTS idx_calibration_runs_due
    ON calibration_runs (due_date, result_status, deleted_at);

    CREATE INDEX IF NOT EXISTS idx_analyses_sample
    ON analyses (sample_receiving_id, deleted_at);

    CREATE INDEX IF NOT EXISTS idx_analyses_status
    ON analyses (status, deleted_at);

    CREATE INDEX IF NOT EXISTS idx_analysis_results_analysis
    ON analysis_results (analysis_id, deleted_at);

    CREATE INDEX IF NOT EXISTS idx_analysis_results_references
    ON analysis_results (formula_id, standard_id, calibration_run_id);

    CREATE INDEX IF NOT EXISTS idx_report_history_sample
    ON report_history (sample_receiving_id, generated_at, deleted_at);

    CREATE INDEX IF NOT EXISTS idx_report_history_analysis
    ON report_history (analysis_id, generated_at, deleted_at);

    CREATE INDEX IF NOT EXISTS idx_audit_log_entity
    ON audit_log (entity_type, entity_id, created_at);

    CREATE INDEX IF NOT EXISTS idx_audit_log_action
    ON audit_log (action, created_at);
  `);
}

function addColumnIfMissing(activeDatabase: Database, tableName: string, columnName: string, columnDefinition: string): void {
  const columnsResult = activeDatabase.exec(`PRAGMA table_info(${tableName});`)[0];
  const columnNames = new Set(columnsResult?.values.map((column) => String(column[1])) ?? []);

  if (!columnNames.has(columnName)) {
    activeDatabase.run(`ALTER TABLE ${tableName} ADD COLUMN ${columnName} ${columnDefinition};`);
  }
}

function markSchemaVersion(activeDatabase: Database, version: number, name: string): void {
  activeDatabase.run(
    `INSERT OR IGNORE INTO schema_migrations (version, name)
     VALUES (?, ?);`,
    [version, name]
  );
}
