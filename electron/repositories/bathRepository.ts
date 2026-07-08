import { getDatabase, persistDatabase } from "../services/database";

export interface BathInput {
  name: string;
  companyId: number;
  bathType: string;
  capacityLitres: number;
  operatingTemperature: string;
  currentDensity: string;
  remarks: string;
  isActive: boolean;
}

export interface BathRecord extends BathInput {
  id: number;
  companyName: string;
  createdAt: string;
  updatedAt: string;
}

export interface BathListQuery {
  search: string;
  page: number;
  pageSize: number;
}

export interface BathListResult {
  records: BathRecord[];
  total: number;
  page: number;
  pageSize: number;
}

export interface BathRepository {
  list(query: BathListQuery): BathListResult;
  create(input: BathInput): BathRecord;
  update(id: number, input: BathInput): BathRecord;
  softDelete(id: number): void;
  getById(id: number): BathRecord;
}

function queryBaths(sql: string, params: Array<string | number>): unknown[][] {
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

function mapBath(row: unknown[]): BathRecord {
  return {
    id: Number(row[0]),
    name: String(row[1]),
    companyId: Number(row[2]),
    companyName: String(row[3]),
    bathType: String(row[4]),
    capacityLitres: Number(row[5]),
    operatingTemperature: String(row[6]),
    currentDensity: String(row[7]),
    remarks: String(row[8]),
    isActive: Number(row[9]) === 1,
    createdAt: String(row[10]),
    updatedAt: String(row[11])
  };
}

function assertCompanyIsActive(companyId: number): void {
  const rows = queryBaths(
    "SELECT id FROM companies WHERE id = ? AND deleted_at IS NULL AND is_active = 1 LIMIT 1;",
    [companyId]
  );

  if (rows.length === 0) {
    throw new Error("Select an active company.");
  }
}

function assertUniqueBathName(companyId: number, name: string, currentId?: number): void {
  const rows = queryBaths(
    `SELECT id FROM baths
     WHERE company_id = ?
       AND LOWER(name) = LOWER(?)
       AND deleted_at IS NULL
       AND (? = 0 OR id != ?)
     LIMIT 1;`,
    [companyId, name, currentId ?? 0, currentId ?? 0]
  );

  if (rows.length > 0) {
    throw new Error("A bath with this name already exists for the selected company.");
  }
}

export const bathRepository: BathRepository = {
  list(query: BathListQuery): BathListResult {
    const page = Math.max(1, query.page);
    const pageSize = Math.min(Math.max(5, query.pageSize), 50);
    const offset = (page - 1) * pageSize;
    const searchTerm = `%${query.search.trim()}%`;
    const whereClause = `
      b.deleted_at IS NULL
      AND (
        ? = '%%'
        OR b.name LIKE ?
        OR b.bath_type LIKE ?
        OR c.name LIKE ?
        OR b.operating_temperature LIKE ?
        OR b.current_density LIKE ?
      )
    `;

    const countRows = queryBaths(
      `SELECT COUNT(*)
       FROM baths b
       LEFT JOIN companies c ON c.id = b.company_id
       WHERE ${whereClause};`,
      [searchTerm, searchTerm, searchTerm, searchTerm, searchTerm, searchTerm]
    );
    const total = Number(countRows[0]?.[0] ?? 0);

    const records = queryBaths(
      `SELECT b.id, b.name, b.company_id, COALESCE(c.name, ''), b.bath_type, b.capacity_litres,
              b.operating_temperature, b.current_density, b.remarks, b.is_active, b.created_at, b.updated_at
       FROM baths b
       LEFT JOIN companies c ON c.id = b.company_id
       WHERE ${whereClause}
       ORDER BY b.updated_at DESC, b.id DESC
       LIMIT ? OFFSET ?;`,
      [searchTerm, searchTerm, searchTerm, searchTerm, searchTerm, searchTerm, pageSize, offset]
    ).map(mapBath);

    return { records, total, page, pageSize };
  },

  create(input: BathInput): BathRecord {
    assertCompanyIsActive(input.companyId);
    assertUniqueBathName(input.companyId, input.name);
    const database = getDatabase();

    database.run(
      `INSERT INTO baths (
        name, company_id, bath_type, capacity_litres, operating_temperature, current_density, remarks, is_active, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP);`,
      [
        input.name,
        input.companyId,
        input.bathType,
        input.capacityLitres,
        input.operatingTemperature,
        input.currentDensity,
        input.remarks,
        input.isActive ? 1 : 0
      ]
    );
    persistDatabase();

    const id = Number(database.exec("SELECT last_insert_rowid();")[0].values[0][0]);
    return this.getById(id);
  },

  update(id: number, input: BathInput): BathRecord {
    assertCompanyIsActive(input.companyId);
    assertUniqueBathName(input.companyId, input.name, id);
    getDatabase().run(
      `UPDATE baths
       SET name = ?,
           company_id = ?,
           bath_type = ?,
           capacity_litres = ?,
           operating_temperature = ?,
           current_density = ?,
           remarks = ?,
           is_active = ?,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = ? AND deleted_at IS NULL;`,
      [
        input.name,
        input.companyId,
        input.bathType,
        input.capacityLitres,
        input.operatingTemperature,
        input.currentDensity,
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
      `UPDATE baths
       SET deleted_at = CURRENT_TIMESTAMP,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = ? AND deleted_at IS NULL;`,
      [id]
    );
    persistDatabase();
  },

  getById(id: number): BathRecord {
    const rows = queryBaths(
      `SELECT b.id, b.name, b.company_id, COALESCE(c.name, ''), b.bath_type, b.capacity_litres,
              b.operating_temperature, b.current_density, b.remarks, b.is_active, b.created_at, b.updated_at
       FROM baths b
       LEFT JOIN companies c ON c.id = b.company_id
       WHERE b.id = ? AND b.deleted_at IS NULL
       LIMIT 1;`,
      [id]
    );

    if (rows.length === 0) {
      throw new Error("Bath not found.");
    }

    return mapBath(rows[0]);
  }
};
