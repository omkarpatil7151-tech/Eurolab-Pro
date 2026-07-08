import { getDatabase, persistDatabase } from "../services/database";

export interface CompanyInput {
  name: string;
  address: string;
  contactPerson: string;
  mobileNumber: string;
  email: string;
  gstNumber: string;
  city: string;
  state: string;
  pinCode: string;
  isActive: boolean;
}

export interface CompanyRecord extends CompanyInput {
  id: number;
  createdAt: string;
  updatedAt: string;
}

export interface CompanyListQuery {
  search: string;
  page: number;
  pageSize: number;
}

export interface CompanyListResult {
  records: CompanyRecord[];
  total: number;
  page: number;
  pageSize: number;
}

export interface CompanyRepository {
  list(query: CompanyListQuery): CompanyListResult;
  create(input: CompanyInput): CompanyRecord;
  update(id: number, input: CompanyInput): CompanyRecord;
  softDelete(id: number): void;
  getById(id: number): CompanyRecord;
}

function mapCompany(row: unknown[]): CompanyRecord {
  return {
    id: Number(row[0]),
    name: String(row[1]),
    address: String(row[2]),
    contactPerson: String(row[3]),
    mobileNumber: String(row[4]),
    email: String(row[5]),
    gstNumber: String(row[6]),
    city: String(row[7]),
    state: String(row[8]),
    pinCode: String(row[9]),
    isActive: Number(row[10]) === 1,
    createdAt: String(row[11]),
    updatedAt: String(row[12])
  };
}

function queryCompanies(sql: string, params: Array<string | number>): unknown[][] {
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

function assertUniqueCompanyName(name: string, currentId?: number): void {
  const rows = queryCompanies(
    `SELECT id FROM companies
     WHERE LOWER(name) = LOWER(?)
       AND deleted_at IS NULL
       AND (? = 0 OR id != ?)
     LIMIT 1;`,
    [name, currentId ?? 0, currentId ?? 0]
  );

  if (rows.length > 0) {
    throw new Error("A company with this name already exists.");
  }
}

export const companyRepository: CompanyRepository = {
  list(query: CompanyListQuery): CompanyListResult {
    const page = Math.max(1, query.page);
    const pageSize = Math.min(Math.max(5, query.pageSize), 50);
    const offset = (page - 1) * pageSize;
    const searchTerm = `%${query.search.trim()}%`;
    const whereClause = `
      deleted_at IS NULL
      AND (
        ? = '%%'
        OR name LIKE ?
        OR contact_person LIKE ?
        OR mobile_number LIKE ?
        OR email LIKE ?
        OR city LIKE ?
        OR state LIKE ?
        OR gst_number LIKE ?
      )
    `;

    const countRows = queryCompanies(
      `SELECT COUNT(*) FROM companies WHERE ${whereClause};`,
      [searchTerm, searchTerm, searchTerm, searchTerm, searchTerm, searchTerm, searchTerm, searchTerm]
    );
    const total = Number(countRows[0]?.[0] ?? 0);

    const records = queryCompanies(
      `SELECT id, name, address, contact_person, mobile_number, email, gst_number, city, state, pin_code, is_active, created_at, updated_at
       FROM companies
       WHERE ${whereClause}
       ORDER BY updated_at DESC, id DESC
       LIMIT ? OFFSET ?;`,
      [searchTerm, searchTerm, searchTerm, searchTerm, searchTerm, searchTerm, searchTerm, searchTerm, pageSize, offset]
    ).map(mapCompany);

    return { records, total, page, pageSize };
  },

  create(input: CompanyInput): CompanyRecord {
    assertUniqueCompanyName(input.name);
    const database = getDatabase();

    database.run(
      `INSERT INTO companies (
        name, address, contact_person, mobile_number, email, gst_number, city, state, pin_code, is_active, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP);`,
      [
        input.name,
        input.address,
        input.contactPerson,
        input.mobileNumber,
        input.email,
        input.gstNumber,
        input.city,
        input.state,
        input.pinCode,
        input.isActive ? 1 : 0
      ]
    );
    persistDatabase();

    const id = Number(database.exec("SELECT last_insert_rowid();")[0].values[0][0]);
    return this.getById(id);
  },

  update(id: number, input: CompanyInput): CompanyRecord {
    assertUniqueCompanyName(input.name, id);
    const database = getDatabase();

    database.run(
      `UPDATE companies
       SET name = ?,
           address = ?,
           contact_person = ?,
           mobile_number = ?,
           email = ?,
           gst_number = ?,
           city = ?,
           state = ?,
           pin_code = ?,
           is_active = ?,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = ? AND deleted_at IS NULL;`,
      [
        input.name,
        input.address,
        input.contactPerson,
        input.mobileNumber,
        input.email,
        input.gstNumber,
        input.city,
        input.state,
        input.pinCode,
        input.isActive ? 1 : 0,
        id
      ]
    );

    if (!input.isActive) {
      database.run(
        `UPDATE baths
         SET is_active = 0,
             updated_at = CURRENT_TIMESTAMP
         WHERE company_id = ? AND deleted_at IS NULL;`,
        [id]
      );
    }

    persistDatabase();

    return this.getById(id);
  },

  softDelete(id: number): void {
    const database = getDatabase();

    database.run(
      `UPDATE companies
       SET deleted_at = CURRENT_TIMESTAMP,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = ? AND deleted_at IS NULL;`,
      [id]
    );
    database.run(
      `UPDATE baths
       SET is_active = 0,
           deleted_at = CURRENT_TIMESTAMP,
           updated_at = CURRENT_TIMESTAMP
       WHERE company_id = ? AND deleted_at IS NULL;`,
      [id]
    );
    persistDatabase();
  },

  getById(id: number): CompanyRecord {
    const rows = queryCompanies(
      `SELECT id, name, address, contact_person, mobile_number, email, gst_number, city, state, pin_code, is_active, created_at, updated_at
       FROM companies
       WHERE id = ? AND deleted_at IS NULL
       LIMIT 1;`,
      [id]
    );

    if (rows.length === 0) {
      throw new Error("Company not found.");
    }

    return mapCompany(rows[0]);
  }
};
