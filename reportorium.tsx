import { createFileRoute } from "@tanstack/react-router";
import { BookPage, type FieldDef } from "@/components/book-page";

const fields: FieldDef[] = [
  { name: "tanggal", label: "Tanggal", type: "date", required: true, width: 24 },
  { name: "nomorAkta", label: "Nomor Akta", required: true, width: 28 },
  { name: "bentuk", label: "Bentuk", type: "select", options: ["Akta Pihak", "Akta Pejabat", "Berita Acara"], required: true, width: 28 },
  { name: "judul", label: "Judul / Sifat Akta", required: true, width: 50, placeholder: "Jual Beli, Kuasa, Hibah, Wasiat, ..." },
  { name: "penghadap", label: "Nama Penghadap", type: "textarea", required: true, width: 55, placeholder: "Satu nama per baris" },
  { name: "saksi", label: "Saksi-saksi", type: "textarea", width: 45 },
  { name: "keterangan", label: "Keterangan", type: "textarea", width: 40 },
];

export const Route = createFileRoute("/reportorium")({
  head: () => ({
    meta: [
      { title: "Reportorium Akta — Buku Notaris" },
      { name: "description", content: "Daftar akta (reportorium) sesuai Pasal 58 UUJN." },
    ],
  }),
  component: () => (
    <BookPage
      title="Reportorium / Daftar Akta"
      description="Catatan seluruh akta yang dibuat. Nomor urut diberikan otomatis per tahun berdasarkan tanggal."
      tableKey="akta"
      fields={fields}
      filenameSlug="reportorium-akta"
    />
  ),
});
