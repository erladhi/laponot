import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { PageHeader } from "@/components/page-header";
import { Download, Upload, Save } from "lucide-react";
import { toast } from "sonner";
import { getDB, exportAllJSON, importAllJSON, type Pengaturan } from "@/lib/db";
import { usePengaturan } from "@/hooks/use-pengaturan";
import { todayISO } from "@/lib/format";

export const Route = createFileRoute("/pengaturan")({
  head: () => ({
    meta: [
      { title: "Pengaturan — Buku Notaris" },
      { name: "description", content: "Identitas notaris dan cadangan data." },
    ],
  }),
  component: PengaturanPage,
});

function PengaturanPage() {
  const current = usePengaturan();
  const [form, setForm] = useState<Pengaturan>(current);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => { setForm(current); }, [current.namaNotaris, current.gelar, current.skPengangkatan, current.wilayahJabatan, current.kotaKedudukan, current.alamatKantor]);

  async function save() {
    const db = getDB();
    await db.pengaturan.put({ ...form, id: "main" });
    toast.success("Pengaturan disimpan");
  }

  async function handleBackup() {
    const json = await exportAllJSON();
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `backup-notaris-${todayISO()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Backup diunduh");
  }

  async function handleRestore(file: File) {
    if (!confirm("Memulihkan akan MENGGANTI seluruh data saat ini. Lanjutkan?")) return;
    try {
      const text = await file.text();
      await importAllJSON(text);
      toast.success("Data berhasil dipulihkan");
    } catch (e: any) {
      toast.error("Gagal memulihkan: " + (e?.message ?? "format tidak valid"));
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Pengaturan Notaris"
        description="Identitas yang akan tercetak sebagai kop pada PDF, dan menu cadangan data."
      />

      <Card className="p-6">
        <div className="mb-4 font-serif text-lg font-semibold">Identitas Notaris</div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Field label="Nama Lengkap"><Input value={form.namaNotaris} onChange={(e) => setForm({ ...form, namaNotaris: e.target.value })} placeholder="contoh: Budi Santoso" /></Field>
          <Field label="Gelar"><Input value={form.gelar} onChange={(e) => setForm({ ...form, gelar: e.target.value })} placeholder="S.H., M.Kn." /></Field>
          <Field label="SK Pengangkatan"><Input value={form.skPengangkatan} onChange={(e) => setForm({ ...form, skPengangkatan: e.target.value })} placeholder="Nomor & tanggal SK Menkumham" /></Field>
          <Field label="Wilayah Jabatan"><Input value={form.wilayahJabatan} onChange={(e) => setForm({ ...form, wilayahJabatan: e.target.value })} placeholder="contoh: Provinsi Jawa Barat" /></Field>
          <Field label="Kota Kedudukan"><Input value={form.kotaKedudukan} onChange={(e) => setForm({ ...form, kotaKedudukan: e.target.value })} placeholder="contoh: Bandung" /></Field>
          <Field label="Alamat Kantor" full><Textarea value={form.alamatKantor} onChange={(e) => setForm({ ...form, alamatKantor: e.target.value })} rows={2} /></Field>
        </div>
        <div className="mt-5">
          <Button onClick={save}><Save className="mr-2 h-4 w-4" /> Simpan Pengaturan</Button>
        </div>
      </Card>

      <Card className="p-6">
        <div className="mb-2 font-serif text-lg font-semibold">Cadangan Data</div>
        <p className="mb-4 text-sm text-muted-foreground">
          Data disimpan di browser perangkat ini. Lakukan backup berkala dan simpan file <code>.json</code> di tempat aman.
          Untuk berpindah perangkat, gunakan menu "Pulihkan dari File".
        </p>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={handleBackup}><Download className="mr-2 h-4 w-4" /> Backup ke File</Button>
          <Button variant="outline" onClick={() => fileRef.current?.click()}><Upload className="mr-2 h-4 w-4" /> Pulihkan dari File</Button>
          <input
            ref={fileRef}
            type="file"
            accept="application/json"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) handleRestore(f);
              e.target.value = "";
            }}
          />
        </div>
      </Card>
    </div>
  );
}

function Field({ label, children, full }: { label: string; children: React.ReactNode; full?: boolean }) {
  return (
    <div className={full ? "md:col-span-2" : ""}>
      <Label className="text-xs">{label}</Label>
      {children}
    </div>
  );
}
