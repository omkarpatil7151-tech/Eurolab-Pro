import { getDatabase, persistDatabase } from "../services/database";

export type TestingType = "AMC" | "Free" | "Chargeable";

export interface SelectOptionRecord {
  id: number;
  name: string;
}

export interface SampleReceivingInput {
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
}

function mapOptionRows(tableName: "companies" | "baths", companyId?: number): SelectOptionRecord[] {
  const database = getDatabase();
  const result = database.exec(
    tableName === "companies"
      ? "SELECT id, name FROM companies WHERE deleted_at IS NULL AND is_active = 1 ORDER BY name ASC;"
      : `SELECT id, name FROM baths
         WHERE deleted_at IS NULL
           AND is_active = 1
           AND company_id = ${Number(companyId ?? 0)}
         ORDER BY name ASC;`
  )[0];

  if (!result) {
    return [];
  }

  return result.values.map(([id, name]) => ({
    id: Number(id),
    name: String(name)
  }));
}

export const sampleReceivingRepository: SampleReceivingRepository = {
  getNextCertificateNumber() {
    const database = getDatabase();
    const year = new Date().getFullYear();
    const prefix = `EUR-${year}-`;
    const result = database.exec(
      `SELECT certificate_number FROM sample_receivings
       WHERE certificate_number LIKE '${prefix}%'
       ORDER BY certificate_number DESC
       LIMIT 1;`
    )[0];

    const lastCertificate = result?.values[0]?.[0];
    const nextSequence = lastCertificate ? Number(String(lastCertificate).replace(prefix, "")) + 1 : 1;

    return `${prefix}${String(nextSequence).padStart(6, "0")}`;
  },

  listCompanies() {
    return mapOptionRows("companies");
  },

  listBaths(companyId) {
    return mapOptionRows("baths", companyId);
  },

  save(input) {
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
  }
};
