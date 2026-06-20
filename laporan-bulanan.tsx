import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table as UITable, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PageHeader } from "@/components/page-header";
import { FileDown, FileSpreadsheet } from "lucide-react";
import { getDB } from "@/lib/db";
import { usePengaturan } from "@/hooks/use-pengaturan";
import { exportPDF, exportExcel } from "@/lib/export";
import { NAMA_BULAN, formatTanggalShort } from "@/lib/format";

export const Route = createFileRoute("/laporan-bulanan")({
  head: () => ({
    meta: [
      { title: "Laporan Bulanan — Buku Notaris" },
      { name: "description", content: "Rekap bulanan akta, legalisasi, waarmerking, dan wasiat untuk MPD." },
    ],
  }),
  component: LaporanBulanan,
});

function LaporanBulanan() {
  const now = new Date();
  const pengaturan = usePengaturan();
  const [bulan, setBulan] = useState(String(now.getMonth() + 1).padStart(2, "0"));
  const [tahun, setTahun] = useState(String(now.getFullYear()));

  const data = useLiveQuery(async () => {
    const db = getDB();
    if (!db) return null;
    return {
      akta: await db.akta.toArray(),
      legalisasi: await db.legalisasi.toArray(),
      waarmerking: await db.waarmerking.toArray(),
      protes: await db.protes.toArray(),
      wasiat: await db.wasiat.toArray(),
    };
  }, []);

  const periode = `${tahun}-${bulan}`;
  const filterByMonth = <T extends { tanggal: string }>(arr: T[]): T[] =>
    arr.filter((x) => x.tanggal?.startsWith(periode));

  const summary = useMemo(() => {
    if (!data) return null;
    const akta = filterByMonth(data.akta);
    const byJenis: Record<string, number> = {};
    akta.forEach((a: any) => { byJenis[a.judul || "Lain-lain"] = (byJenis[a.judul || "Lain-lain"] || 0) + 1; });
    return {
      akta, byJenis,
      legalisasi: filterByMonth(data.legalisasi),
      waarmerking: filterByMonth(data.waarmerking),
      protes: filterByMonth(data.protes),
      wasiat: filterByMonth(data.wasiat),
    };
  }, [data, periode]);

  const judul = `Laporan Bulanan Notaris — ${NAMA_BULAN[parseInt(bulan, 10) - 1]} ${tahun}`;

  function handlePDF() {
    if (!summary) return;
    const rows: (string | number)[][] = [
      ["1", "Jumlah Akta", String(summary.akta.length)],
      ["2", "Jumlah Legalisasi", String(summary.legalisasi.length)],
      ["3", "Jumlah Waarmerking", String(summary.waarmerking.length)],
      ["4", "Jumlah Protes Wesel/Cek", String(summary.protes.length)],
      ["5", "Jumlah Akta Wasiat", String(summary.wasiat.length)],
    ];
    Object.entries(summary.byJenis).forEach(([jenis, n], i) => {
      rows.push([`5.${i + 1}`, `   — ${jenis}`, String(n)]);
    });
    exportPDF({
      judul,
      subjudul: pengaturan.kotaKedudukan ? `Kedudukan: ${pengaturan.kotaKedudukan}` : undefined,
      pengaturan,
      columns: [
        { header: "No.", width: 18 },
        { header: "Uraian", width: 180 },
        { header: "Jumlah", width: 40 },
      ],
      rows,
      filename: `laporan-bulanan-${periode}.pdf`,
    });
  }

  function handleXLSX() {
    if (!summary) return;
    const headers = ["No.", "Uraian", "Jumlah"];
    const rows: (string | number)[][] = [
      [1, "Jumlah Akta", summary.akta.length],
      [2, "Jumlah Legalisasi", summary.legalisasi.length],
      [3, "Jumlah Waarmerking", summary.waarmerking.length],
      [4, "Jumlah Protes Wesel/Cek", summary.protes.length],
      [5, "Jumlah Akta Wasiat", summary.wasiat.length],
    ];
    Object.entries(summary.byJenis).forEach(([jenis, n], i) => rows.push([`5.${i + 1}`, `   — ${jenis}`, n]));
    exportExcel(`laporan-bulanan-${periode}.xlsx`, "Rekap", headers, rows);
  }

  function handleWasiatPDF() {
    if (!summary) return;
    exportPDF({
      judul: `Daftar Akta Wasiat — ${NAMA_BULAN[parseInt(bulan, 10) - 1]} ${tahun}`,
      subjudul: "Untuk dilaporkan ke Daftar Pusat Wasiat, Kemenkumham RI",
      pengaturan,
      columns: [
        { header: "No.", width: 14 },
        { header: "Tanggal", width: 28 },
        { header: "Nomor Akta", width: 35 },
        { header: "Nama Pewasiat", width: 70 },
        { header: "Jenis Wasiat", width: 45 },
        { header: "Keterangan", width: 60 },
      ],
      rows: summary.wasiat.map((w: any, i) => [
        i + 1, formatTanggalShort(w.tanggal), w.nomorAkta, w.pewasiat, w.jenisWasiat, w.keterangan ?? "",
      ]),
      filename: `laporan-wasiat-${periode}.pdf`,
    });
  }

  const tahunOptions = Array.from({ length: 10 }, (_, i) => String(now.getFullYear() - 5 + i));

  return (
    <div className="space-y-6">
      <PageHeader
        title="Laporan Bulanan"
        description="Rekap bulanan untuk dilaporkan ke Majelis Pengawas Daerah (MPD) dan Kementerian Hukum & HAM."
      />

      <Card className="flex flex-wrap items-end gap-4 p-4">
        <div>
          <Label className="text-xs">Bulan</Label>
          <Select value={bulan} onValueChange={setBulan}>
            <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
            <SelectContent>
              {NAMA_BULAN.map((b, i) => (
                <SelectItem key={b} value={String(i + 1).padStart(2, "0")}>{b}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="text-xs">Tahun</Label>
          <Select value={tahun} onValueChange={setTahun}>
            <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
            <SelectContent>
              {tahunOptions.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="ml-auto flex gap-2">
          <Button variant="outline" onClick={handleXLSX}><FileSpreadsheet className="mr-2 h-4 w-4" /> Excel</Button>
          <Button onClick={handlePDF}><FileDown className="mr-2 h-4 w-4" /> Cetak Laporan</Button>
        </div>
      </Card>

      {summary && (
        <>
          <Card className="p-5">
            <div className="font-serif text-xl font-semibold">{judul}</div>
            {pengaturan.namaNotaris && (
              <div className="mt-1 text-sm text-muted-foreground">
                {pengaturan.namaNotaris}{pengaturan.gelar && `, ${pengaturan.gelar}`}
                {pengaturan.kotaKedudukan && ` — ${pengaturan.kotaKedudukan}`}
              </div>
            )}
            <UITable className="mt-4">
              <TableHeader>
                <TableRow className="bg-primary/5">
                  <TableHead className="w-16">No.</TableHead>
                  <TableHead>Uraian</TableHead>
                  <TableHead className="w-32 text-right">Jumlah</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <RekapRow no="1" label="Jumlah Akta" n={summary.akta.length} />
                {Object.entries(summary.byJenis).map(([jenis, n], i) => (
                  <RekapRow key={jenis} no={`1.${i + 1}`} label={`— ${jenis}`} n={n} muted />
                ))}
                <RekapRow no="2" label="Jumlah Legalisasi" n={summary.legalisasi.length} />
                <RekapRow no="3" label="Jumlah Waarmerking" n={summary.waarmerking.length} />
                <RekapRow no="4" label="Jumlah Protes Wesel/Cek" n={summary.protes.length} />
                <RekapRow no="5" label="Jumlah Akta Wasiat" n={summary.wasiat.length} />
              </TableBody>
            </UITable>
          </Card>

          {summary.wasiat.length > 0 && (
            <Card className="p-5">
              <div className="mb-3 flex items-center justify-between">
                <div>
                  <div className="font-serif text-lg font-semibold">Daftar Akta Wasiat</div>
                  <p className="text-sm text-muted-foreground">Wajib dilaporkan ke Daftar Pusat Wasiat (DPW) Kemenkumham paling lambat tanggal 5 bulan berikutnya.</p>
                </div>
                <Button variant="outline" onClick={handleWasiatPDF}>
                  <FileDown className="mr-2 h-4 w-4" /> Cetak Daftar Wasiat
                </Button>
              </div>
              <UITable>
                <TableHeader>
                  <TableRow className="bg-primary/5">
                    <TableHead>Tanggal</TableHead>
                    <TableHead>Nomor Akta</TableHead>
                    <TableHead>Pewasiat</TableHead>
                    <TableHead>Jenis</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {summary.wasiat.map((w: any) => (
                    <TableRow key={w.id}>
                      <TableCell>{formatTanggalShort(w.tanggal)}</TableCell>
                      <TableCell>{w.nomorAkta}</TableCell>
                      <TableCell>{w.pewasiat}</TableCell>
                      <TableCell>{w.jenisWasiat}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </UITable>
            </Card>
          )}
        </>
      )}
    </div>
  );
}

function RekapRow({ no, label, n, muted }: { no: string; label: string; n: number; muted?: boolean }) {
  return (
    <TableRow className={muted ? "text-muted-foreground" : "font-medium"}>
      <TableCell>{no}</TableCell>
      <TableCell>{label}</TableCell>
      <TableCell className="text-right tabular-nums">{n}</TableCell>
    </TableRow>
  );
    }
