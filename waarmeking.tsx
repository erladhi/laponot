import { createFileRoute } from "@tanstack/react-router";
import { BookPage, type FieldDef } from "@/components/book-page";

const fields: FieldDef[] = [
  { name: "tanggal", label: "Tanggal", type: "date", required: true, width: 24 },
  { name: "nama", label: "Nama Pendaftar", required: true, width: 55 },
  { name: "alamat", label: "Alamat", type: "textarea", width: 60 },
  { name: "sifatSurat", label: "Sifat / Judul Surat", required: true, width: 60 },
  { name: "keterangan", label: "Keterangan", type: "textarea", width: 45 },
];

export const Route = createFileRoute("/waarmerking")({
  head: () => ({
    meta: [
      { title: "Waarmerking — Buku Notaris" },
      { name: "description", content: "Buku Daftar Surat di Bawah Tangan yang didaftarkan (waarmerking)." },
    ],
  }),
  component: () => (
    <BookPage
      title="Buku Daftar Waarmerking"
      description="Pendaftaran surat-surat di bawah tangan (waarmerking)."
      tableKey="waarmerking"
      fields={fields}
      filenameSlug="buku-waarmerking"
    />
  ),
});
