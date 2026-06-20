import Dexie, { type Table } from "dexie";

export interface Akta {
  id?: number;
  nomorUrut: number;
  tanggal: string; // ISO yyyy-mm-dd
  nomorAkta: string;
  bentuk: "Akta Pihak" | "Akta Pejabat" | "Berita Acara";
  judul: string;
  penghadap: string;
  saksi: string;
  keterangan: string;
  isWasiat?: boolean;
}

export interface Legalisasi {
  id?: number;
  nomorUrut: number;
  tanggal: string;
  nama: string;
  alamat: string;
  sifatSurat: string;
  keterangan: string;
}

export interface Waarmerking {
  id?: number;
  nomorUrut: number;
  tanggal: string;
  nama: string;
  alamat: string;
  sifatSurat: string;
  keterangan: string;
}

export interface Protes {
  id?: number;
  nomorUrut: number;
  tanggal: string;
  jenisSurat: string; // wesel/cek
  nomorSurat: string;
  pihak: string;
  keterangan: string;
}

export interface Wasiat {
  id?: number;
  nomorUrut: number;
  tanggal: string;
  nomorAkta: string;
  pewasiat: string;
  jenisWasiat: string;
  keterangan: string;
}

export interface Pengaturan {
  id: "main";
  namaNotaris: string;
  gelar: string;
  skPengangkatan: string;
  wilayahJabatan: string;
  kotaKedudukan: string;
  alamatKantor: string;
}

export class NotarisDB extends Dexie {
  akta!: Table<Akta, number>;
  legalisasi!: Table<Legalisasi, number>;
  waarmerking!: Table<Waarmerking, number>;
  protes!: Table<Protes, number>;
  wasiat!: Table<Wasiat, number>;
  pengaturan!: Table<Pengaturan, string>;

  constructor() {
    super("NotarisDB");
    this.version(1).stores({
      akta: "++id, nomorUrut, tanggal, nomorAkta, judul, isWasiat",
      legalisasi: "++id, nomorUrut, tanggal, nama",
      waarmerking: "++id, nomorUrut, tanggal, nama",
      protes: "++id, nomorUrut, tanggal",
      wasiat: "++id, nomorUrut, tanggal, pewasiat",
      pengaturan: "id",
    });
  }
}

let _db: NotarisDB | null = null;
export function getDB(): NotarisDB {
  if (typeof window === "undefined") {
    // SSR placeholder — never used at runtime in components
    return null as unknown as NotarisDB;
  }
  if (!_db) _db = new NotarisDB();
  return _db;
}

export async function nextNomorUrut(table: Table<{ nomorUrut: number }, number>, tahun: number): Promise<number> {
  const all = await table.toArray();
  const tahunSama = all.filter((x: any) => (x.tanggal ?? "").startsWith(String(tahun)));
  const max = tahunSama.reduce((m, x) => Math.max(m, x.nomorUrut ?? 0), 0);
  return max + 1;
}

export async function exportAllJSON(): Promise<string> {
  const db = getDB();
  const data = {
    version: 1,
    exportedAt: new Date().toISOString(),
    akta: await db.akta.toArray(),
    legalisasi: await db.legalisasi.toArray(),
    waarmerking: await db.waarmerking.toArray(),
    protes: await db.protes.toArray(),
    wasiat: await db.wasiat.toArray(),
    pengaturan: await db.pengaturan.toArray(),
  };
  return JSON.stringify(data, null, 2);
}

export async function importAllJSON(json: string): Promise<void> {
  const data = JSON.parse(json);
  const db = getDB();
  await db.transaction(
    "rw",
    [db.akta, db.legalisasi, db.waarmerking, db.protes, db.wasiat, db.pengaturan],
    async () => {
      await Promise.all([
        db.akta.clear(),
        db.legalisasi.clear(),
        db.waarmerking.clear(),
        db.protes.clear(),
        db.wasiat.clear(),
        db.pengaturan.clear(),
      ]);
      if (Array.isArray(data.akta)) await db.akta.bulkAdd(data.akta.map(stripId));
      if (Array.isArray(data.legalisasi)) await db.legalisasi.bulkAdd(data.legalisasi.map(stripId));
      if (Array.isArray(data.waarmerking)) await db.waarmerking.bulkAdd(data.waarmerking.map(stripId));
      if (Array.isArray(data.protes)) await db.protes.bulkAdd(data.protes.map(stripId));
      if (Array.isArray(data.wasiat)) await db.wasiat.bulkAdd(data.wasiat.map(stripId));
      if (Array.isArray(data.pengaturan)) await db.pengaturan.bulkPut(data.pengaturan);
    }
  );
}

function stripId<T extends { id?: number }>(x: T): T {
  const { id: _id, ...rest } = x;
  return rest as T;
}
