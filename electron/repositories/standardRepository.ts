import { getDatabase, persistDatabase } from "../services/database";

export interface StandardInput {
  metal: string;
  standardName: string;
  originalConcentration: number;
  unit: string;
  remarks: string;
  isActive: boolean;
}

export interface StandardRecord extends StandardInput {
  id: number;
  createdAt: string;
  updatedAt: string;
}

export interface StandardListQuery {
  search: string;
  page: number;
  pageSize: number;
}

export interface StandardListResult {
  records: StandardRecord[];
  total: number;
  page: number;
  pageSize: number;
}

export interface StandardRepository {
  list(query: StandardListQuery): StandardListResult;
  create(input: StandardInput): StandardRecord;
  update(id: number, input: StandardInput): StandardRecord;
  softDelete(id: number): void;
  getById(id: number): StandardRecord;
}

function queryStandards(sql: string, params: Array<string | number>): unknown[][] {
  const statement = getDatabase().prepare(sql);
  const rows: unknown[][] = [];

  try {
    statement.bind(params);
    while (statement.step()) {
      rows.push(statement.get());
    }
  } finally {
    statement.free();
  }

  return rows;
}

function mapStandard(row: unknown[]): StandardRecord {
  return {
    id: Number(row[0]),
    metal: String(row[1]),
    standardName: String(row[2]),
    originalConcentration: Number(row[3]),
    unit: String(row[4]),
    remarks: String(row[5]),
    isActive: Number(row[6]) === 1,
    createdAt: String(row[7]),
    updatedAt: String(row[8])
  };
}

function assertUniqueStandardName(metal: string, standardName: string, currentId?: number): void {
  const rows = queryStandards(
    `SELECT id FROM standard_master
     WHERE LOWER(metal) = LOWER(?)
       AND LOWER(standard_name) = LOWER(?)
       AND deleted_at IS NULL
       AND (? = 0 OR id != ?)
     LIMIT 1;`,
    [metal, standardName, currentId ?? 0, currentId ?? 0]
  );

  if (rows.length > 0) {
    throw new Error("A standard with this name already exists for the selected metal.");
  }
}

export const standardRepository: StandardRepository = {
  list(query: StandardListQuery): StandardListResult {
    const page = Math.max(1, query.page);
    const pageSize = Math.min(Math.max(5, query.pageSize), 50);
    const offset = (page - 1) * pageSize;
    const searchTerm = `%${query.search.trim()}%`;
    const whereClause = `
      deleted_at IS NULL
      AND (
        ? = '%%'
        OR metal LIKE ?
        OR standard_name LIKE ?
        OR unit LIKE ?
        OR remarks LIKE ?
      )
    `;

    const countRows = queryStandards(
      `SELECT COUNT(*) FROM standard_master WHERE ${whereClause};`,
      [searchTerm, searchTerm, searchTerm, searchTerm, searchTerm]
    );
    const total = Number(countRows[0]?.[0] ?? 0);

    const records = queryStandards(
      `SELECT id, metal, standard_name, original_concentration, unit, remarks, is_active, created_at, updated_at
       FROM standard_master
       WHERE ${whereClause}
       ORDER BY updated_at DESC, id DESC
       LIMIT ? OFFSET ?;`,
      [searchTerm, searchTerm, searchTerm, searchTerm, searchTerm, pageSize, offset]
    ).map(mapStandard);

    return { records, total, page, pageSize };
  },

  create(input: StandardInput): StandardRecord {
    assertUniqueStandardName(input.metal, input.standardName);
    const database = getDatabase();

    database.run(
      `INSERT INTO standard_master (
        metal, standard_name, original_concentration, unit, remarks, is_active, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP);`,
      [
        input.metal,
        input.standardName,
        input.originalConcentration,
        input.unit,
        input.remarks,
        input.isActive ? 1 : 0
      ]
    );
    persistDatabase();

    const id = Number(database.exec("SELECT last_insert_rowid();")[0].values[0][0]);
    return this.getById(id);
  },

  update(id: number, input: StandardInput): StandardRecord {
    assertUniqueStandardName(input.metal, input.standardName, id);

    getDatabase().run(
      `UPDATE standard_master
       SET metal = ?,
           standard_name = ?,
           original_concentration = ?,
           unit = ?,
           remarks = ?,
           is_active = ?,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = ? AND deleted_at IS NULL;`,
      [
        input.metal,
        input.standardName,
        input.originalConcentration,
        input.unit,
        input.remarks,
        input.isActive ? 1 : 0,
        id
      ]
    );
    persistDatabase();

    return this.getById(id);
  },

  softDelete(id: number): void {
    getDatabase().run(
      `UPDATE standard_master
       SET deleted_at = CURRENT_TIMESTAMP,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = ? AND deleted_at IS NULL;`,
      [id]
    );
    persistDatabase();
  },

  getById(id: number): StandardRecord {
    const rows = queryStandards(
      `SELECT id, metal, standard_name, original_concentration, unit, remarks, is_active, created_at, updated_at
       FROM standard_master
       WHERE id = ? AND deleted_at IS NULL
       LIMIT 1;`,
      [id]
    );

    if (rows.length === 0) {
      throw new Error("Standard not found.");
    }

    return mapStandard(rows[0]);
  }
};
