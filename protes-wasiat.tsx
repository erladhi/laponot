import { createFileRoute } from "@tanstack/react-router";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookPage, type FieldDef } from "@/components/book-page";

const protesFields: FieldDef[] = [
  { name: "tanggal", label: "Tanggal", type: "date", required: true, width: 24 },
  { name: "jenisSurat", label: "Jenis Surat Berharga", type: "select", options: ["Wesel", "Cek", "Surat Sanggup", "Lain-lain"], required: true, width: 35 },
  { name: "nomorSurat", label: "Nomor Surat", required: true, width: 40 },
  { name: "pihak", label: "Pihak Terkait", type: "textarea", required: true, width: 70 },
  { name: "keterangan", label: "Keterangan", type: "textarea", width: 60 },
];

const wasiatFields: FieldDef[] = [
  { name: "tanggal", label: "Tanggal Akta", type: "date", required: true, width: 24 },
  { name: "nomorAkta", label: "Nomor Akta", required: true, width: 30 },
  { name: "pewasiat", label: "Nama Pewasiat", required: true, width: 60 },
  { name: "jenisWasiat", label: "Jenis Wasiat", type: "select", options: ["Wasiat Umum", "Wasiat Olografis", "Wasiat Rahasia", "Pencabutan Wasiat"], required: true, width: 40 },
  { name: "keterangan", label: "Keterangan", type: "textarea", width: 60 },
];

export const Route = createFileRoute("/protes-wasiat")({
  head: () => ({
    meta: [
      { title: "Protes & Wasiat — Buku Notaris" },
      { name: "description", content: "Buku Daftar Protes wesel/cek dan Daftar Akta Wasiat." },
    ],
  }),
  component: ProtesWasiat,
});

function ProtesWasiat() {
  return (
    <Tabs defaultValue="protes" className="space-y-4">
      <TabsList>
        <TabsTrigger value="protes">Buku Daftar Protes</TabsTrigger>
        <TabsTrigger value="wasiat">Daftar Akta Wasiat</TabsTrigger>
      </TabsList>
      <TabsContent value="protes">
        <BookPage
          title="Buku Daftar Protes"
          description="Catatan protes terhadap wesel, cek, dan surat sanggup."
          tableKey="protes"
          fields={protesFields}
          filenameSlug="buku-protes"
        />
      </TabsContent>
      <TabsContent value="wasiat">
        <BookPage
          title="Daftar Akta Wasiat"
          description="Daftar akta wasiat untuk dilaporkan ke Daftar Pusat Wasiat (Kemenkumham)."
          tableKey="wasiat"
          fields={wasiatFields}
          filenameSlug="daftar-wasiat"
        />
      </TabsContent>
    </Tabs>
  );
}
