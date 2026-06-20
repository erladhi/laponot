import { createFileRoute } from "@tanstack/react-router";
import { BookPage, type FieldDef } from "@/components/book-page";

const fields: FieldDef[] = [
  { name: "tanggal", label: "Tanggal", type: "date", required: true, width: 24 },
  { name: "nama", label: "Nama Penanda Tangan", required: true, width: 55 },
  { name: "alamat", label: "Alamat", type: "textarea", width: 60 },
  { name: "sifatSurat", label: "Sifat / Judul Surat", required: true, width: 60 },
  { name: "keterangan", label: "Keterangan", type: "textarea", width: 45 },
];

export const Route = createFileRoute("/legalisasi")({
  head: () => ({
    meta: [
      { title: "Legalisasi — Buku Notaris" },
      { name: "description", content: "Buku Daftar Surat di Bawah Tangan yang dilegalisasi." },
    ],
  }),
  component: () => (
    <BookPage
      title="Buku Daftar Legalisasi"
      description="Pencatatan legalisasi tanda tangan surat di bawah tangan."
      tableKey="legalisasi"
      fields={fields}
      filenameSlug="buku-legalisasi"
    />
  ),
});
