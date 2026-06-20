import { createFileRoute, Link } from "@tanstack/react-router";
import { useLiveQuery } from "dexie-react-hooks";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/page-header";
import { BookOpen, FileSignature, Stamp, ScrollText, ArrowRight } from "lucide-react";
import { getDB } from "@/lib/db";
import { usePengaturan } from "@/hooks/use-pengaturan";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dashboard — Buku Laporan Notaris" },
      { name: "description", content: "Ringkasan reportorium dan buku laporan notaris." },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const pengaturan = usePengaturan();
  const stats = useLiveQuery(async () => {
    const db = getDB();
    if (!db) return null;
    const tahun = String(new Date().getFullYear());
    const [akta, legal, waar, protes, wasiat] = await Promise.all([
      db.akta.toArray(),
      db.legalisasi.toArray(),
      db.waarmerking.toArray(),
      db.protes.toArray(),
      db.wasiat.toArray(),
    ]);
    const inYear = (arr: any[]) => arr.filter((x) => x.tanggal?.startsWith(tahun)).length;
    return {
      akta: { total: akta.length, tahun: inYear(akta) },
      legalisasi: { total: legal.length, tahun: inYear(legal) },
      waarmerking: { total: waar.length, tahun: inYear(waar) },
      protes: { total: protes.length, tahun: inYear(protes) },
      wasiat: { total: wasiat.length, tahun: inYear(wasiat) },
    };
  }, []);

  const cards = [
    { url: "/reportorium", icon: BookOpen, label: "Reportorium Akta", value: stats?.akta },
    { url: "/legalisasi", icon: FileSignature, label: "Legalisasi", value: stats?.legalisasi },
    { url: "/waarmerking", icon: Stamp, label: "Waarmerking", value: stats?.waarmerking },
    { url: "/protes-wasiat", icon: ScrollText, label: "Protes & Wasiat", value: { total: (stats?.protes.total ?? 0) + (stats?.wasiat.total ?? 0), tahun: (stats?.protes.tahun ?? 0) + (stats?.wasiat.tahun ?? 0) } },
  ];

  const namaLengkap = pengaturan.namaNotaris ? `${pengaturan.namaNotaris}${pengaturan.gelar ? ", " + pengaturan.gelar : ""}` : "Notaris";

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Selamat datang, ${namaLengkap}`}
        description="Ringkasan buku-buku wajib notaris. Klik tiap kartu untuk membuka, mencatat, dan mencetak."
      />

      {!pengaturan.namaNotaris && (
        <Card className="border-accent/40 bg-accent/10 p-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <div className="font-serif text-lg font-semibold">Lengkapi data notaris dulu</div>
              <p className="text-sm text-muted-foreground">Nama, SK, dan kota kedudukan akan muncul sebagai kop pada PDF.</p>
            </div>
            <Link to="/pengaturan" className="inline-flex items-center gap-1 rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
              Buka Pengaturan <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </Card>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => (
          <Link key={c.url} to={c.url} className="group">
            <Card className="h-full p-5 transition-all group-hover:border-accent group-hover:shadow-md">
              <div className="flex items-start justify-between">
                <c.icon className="h-7 w-7 text-primary" />
                <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-1" />
              </div>
              <div className="mt-4 font-serif text-base font-semibold">{c.label}</div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="font-serif text-3xl font-bold text-foreground">{c.value?.tahun ?? 0}</span>
                <span className="text-xs text-muted-foreground">tahun ini</span>
              </div>
              <div className="mt-1 text-xs text-muted-foreground">{c.value?.total ?? 0} total entri</div>
            </Card>
          </Link>
        ))}
      </div>

      <Card className="p-5">
        <div className="font-serif text-lg font-semibold">Tentang aplikasi</div>
        <p className="mt-2 text-sm text-muted-foreground">
          Aplikasi ini membantu notaris mencatat buku-buku resmi sesuai UU Jabatan Notaris (UU No. 2/2014) Pasal 58 & 61:
          Reportorium (Daftar Akta), Buku Daftar Legalisasi, Buku Daftar Waarmerking, Buku Daftar Protes, dan Daftar Wasiat.
          Seluruh data tersimpan lokal di perangkat Anda; gunakan menu <span className="font-semibold">Pengaturan</span> untuk
          membuat cadangan (backup) dan mengembalikannya.
        </p>
      </Card>
    </div>
  );
}
