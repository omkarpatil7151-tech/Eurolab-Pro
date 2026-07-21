import { getDatabase, persistDatabase } from "../services/database";

export type TestingType = "AMC" | "Free" | "Chargeable";

export interface SelectOptionRecord {
  id: number;
  name: string;
}

export interface SampleReceivingInput {
  id?: number;
  certificateNumber: string;
  companyId: number;
  bathId: number;
  receivedDate: string;
  analysisDate: string;
  submissionDate: string;
  receivedBy: string;
  testingType: TestingType;
  billedTo: string;
  email: string;
  mobile: string;
  sampleDescription: string;
  remarks: string;
}

export interface SampleReceivingRepository {
  getNextCertificateNumber(): string;
  listCompanies(): SelectOptionRecord[];
  listBaths(companyId: number): SelectOptionRecord[];
  save(input: SampleReceivingInput): { id: number; certificateNumber: string };
  listSamples(): SampleReceivingInput[];
  getSampleById(id: number): SampleReceivingInput | undefined;
  update(input: SampleReceivingInput): void;
}

function mapOptionRows(tableName: "companies" | "baths", companyId?: number): SelectOptionRecord[] {
  const database = getDatabase();
  const statement = database.prepare(
    tableName === "companies"
      ? "SELECT id, name FROM companies WHERE deleted_at IS NULL AND is_active = 1 ORDER BY name ASC;"
      : `SELECT id, name FROM baths
         WHERE deleted_at IS NULL
           AND is_active = 1
           AND company_id = ?
         ORDER BY name ASC;`
  );
  const rows: unknown[][] = [];

  try {
    if (tableName === "baths") {
      statement.bind([Number(companyId ?? 0)]);
    }

    while (statement.step()) {
      rows.push(statement.get());
    }
  } finally {
    statement.free();
  }

  return rows.map(([id, name]) => ({
    id: Number(id),
    name: String(name)
  }));
}

function assertActiveSampleReferences(companyId: number, bathId: number): void {
  const statement = getDatabase().prepare(
    `SELECT b.id
     FROM baths b
     INNER JOIN companies c ON c.id = b.company_id
     WHERE b.id = ?
       AND b.company_id = ?
       AND b.deleted_at IS NULL
       AND b.is_active = 1
       AND c.deleted_at IS NULL
       AND c.is_active = 1
     LIMIT 1;`
  );

  try {
    statement.bind([bathId, companyId]);
    if (!statement.step()) {
      throw new Error("Select an active bath belonging to the selected active company.");
    }
  } finally {
    statement.free();
  }
}

export const sampleReceivingRepository: SampleReceivingRepository = {
  getNextCertificateNumber() {
    const database = getDatabase();
    const year = new Date().getFullYear();
    const month = new Date().getMonth() + 1;
    const prefix = `LAB.${String(month).padStart(2, "0")}.${year}.`;
    const result = database.exec(
      `SELECT certificate_number FROM sample_receivings
       WHERE certificate_number LIKE '${prefix}%'
       ORDER BY certificate_number DESC
       LIMIT 1;`
    )[0];

    const lastCertificate = result?.values[0]?.[0];
    const INITIAL_SERIAL = 10790;
    const lastSerial = lastCertificate ? Number(String(lastCertificate).replace(prefix, "")) : INITIAL_SERIAL;
    const nextSerial = lastSerial + 1;

    return `${prefix}${nextSerial}`;
  },

  listCompanies() {
    return mapOptionRows("companies");
  },

  listBaths(companyId) {
    return mapOptionRows("baths", companyId);
  },

  save(input) {
    assertActiveSampleReferences(input.companyId, input.bathId);
    const database = getDatabase();
    database.run(
      `INSERT INTO sample_receivings (
        certificate_number,
        company_id,
        bath_id,
        received_date,
        analysis_date,
        submission_date,
        received_by,
        testing_type,
        billed_to,
        email,
        mobile,
        sample_description,
        remarks
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
      [
        input.certificateNumber,
        input.companyId,
        input.bathId,
        input.receivedDate,
        input.analysisDate,
        input.submissionDate,
        input.receivedBy,
        input.testingType,
        input.billedTo,
        input.email,
        input.mobile,
        input.sampleDescription,
        input.remarks
      ]
    );
    persistDatabase();

    const idResult = database.exec("SELECT last_insert_rowid();")[0];
    const id = Number(idResult.values[0][0]);

    return { id, certificateNumber: input.certificateNumber };
  },

  listSamples(): SampleReceivingInput[] {
    const database = getDatabase();
    const statement = database.prepare("SELECT * FROM sample_receivings WHERE deleted_at IS NULL;");
    const rows: unknown[][] = [];

    try {
      while (statement.step()) {
        rows.push(statement.get());
      }
    } finally {
      statement.free();
    }

    return rows.map((row: any) => ({
      id: row.id,
      certificateNumber: row.certificate_number,
      companyId: row.company_id,
      bathId: row.bath_id,
      receivedDate: row.received_date,
      analysisDate: row.analysis_date,
      submissionDate: row.submission_date,
      receivedBy: row.received_by,
      testingType: row.testing_type,
      billedTo: row.billed_to,
      email: row.email,
      mobile: row.mobile,
      sampleDescription: row.sample_description,
      remarks: row.remarks
    }));
  },

  getSampleById(id: number): SampleReceivingInput | undefined {
    const database = getDatabase();
    const statement = database.prepare("SELECT * FROM sample_receivings WHERE id = ? AND deleted_at IS NULL;");
    let sample: SampleReceivingInput | undefined;

    try {
      statement.bind([id]);
      if (statement.step()) {
        const row: any = statement.get();
        sample = {
          id: row.id,
          certificateNumber: row.certificate_number,
          companyId: row.company_id,
          bathId: row.bath_id,
          receivedDate: row.received_date,
          analysisDate: row.analysis_date,
          submissionDate: row.submission_date,
          receivedBy: row.received_by,
          testingType: row.testing_type,
          billedTo: row.billed_to,
          email: row.email,
          mobile: row.mobile,
          sampleDescription: row.sample_description,
          remarks: row.remarks
        };
      }
    } finally {
      statement.free();
    }

    return sample;
  },

  update(input: SampleReceivingInput): void {
    assertActiveSampleReferences(input.companyId, input.bathId);
    if (!input.id) {
      throw new Error("Sample ID is required for update.");
    }
    const database = getDatabase();
    database.run(
      `UPDATE sample_receivings SET
        certificate_number = ?,
        company_id = ?,
        bath_id = ?,
        received_date = ?,
        analysis_date = ?,
        submission_date = ?,
        received_by = ?,
        testing_type = ?,
        billed_to = ?,
        email = ?,
        mobile = ?,
        sample_description = ?,
        remarks = ?
      WHERE id = ?;`,
      [
        input.certificateNumber,
        input.companyId,
        input.bathId,
        input.receivedDate,
        input.analysisDate,
        input.submissionDate,
        input.receivedBy,
        input.testingType,
        input.billedTo,
        input.email,
        input.mobile,
        input.sampleDescription,
        input.remarks,
        input.id
      ]
    );
    persistDatabase();
  }
};
