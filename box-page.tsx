import { useMemo, useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import type { Table } from "dexie";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Table as UITable, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/page-header";
import { Plus, Pencil, Trash2, FileDown, FileSpreadsheet, Search } from "lucide-react";
import { toast } from "sonner";
import { getDB, nextNomorUrut } from "@/lib/db";
import { usePengaturan } from "@/hooks/use-pengaturan";
import { formatTanggalShort, todayISO } from "@/lib/format";
import { exportPDF, exportExcel } from "@/lib/export";

export interface FieldDef {
  name: string;
  label: string;
  type?: "text" | "textarea" | "date" | "select";
  options?: string[];
  required?: boolean;
  width?: number; // for PDF
  placeholder?: string;
}

export interface BookPageProps {
  title: string;
  description: string;
  tableKey: "akta" | "legalisasi" | "waarmerking" | "protes" | "wasiat";
  fields: FieldDef[];
  filenameSlug: string;
}

export function BookPage({ title, description, tableKey, fields, filenameSlug }: BookPageProps) {
  const pengaturan = usePengaturan();
  const [query, setQuery] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [editing, setEditing] = useState<any | null>(null);
  const [open, setOpen] = useState(false);

  const rows = useLiveQuery(async () => {
    const db = getDB();
    if (!db) return [];
    return (db as any)[tableKey].orderBy("nomorUrut").toArray();
  }, [tableKey]) ?? [];

  const filtered = useMemo(() => {
    return rows.filter((r: any) => {
      if (from && r.tanggal < from) return false;
      if (to && r.tanggal > to) return false;
      if (query) {
        const q = query.toLowerCase();
        return Object.values(r).some((v) => String(v ?? "").toLowerCase().includes(q));
      }
      return true;
    });
  }, [rows, query, from, to]);

  async function handleSave(data: any) {
    const db = getDB();
    const table: Table<any, number> = (db as any)[tableKey];
    if (editing?.id) {
      await table.update(editing.id, data);
      toast.success("Data diperbarui");
    } else {
      const tahun = parseInt((data.tanggal ?? todayISO()).slice(0, 4), 10);
      const nomorUrut = await nextNomorUrut(table, tahun);
      await table.add({ ...data, nomorUrut });
      toast.success("Data ditambahkan");
    }
    setEditing(null);
    setOpen(false);
  }

  async function handleDelete(id: number) {
    if (!confirm("Hapus baris ini?")) return;
    const db = getDB();
    await (db as any)[tableKey].delete(id);
    toast.success("Data dihapus");
  }

  function rowToArray(r: any): (string | number)[] {
    return [
      r.nomorUrut,
      formatTanggalShort(r.tanggal),
      ...fields.filter((f) => f.name !== "tanggal").map((f) => String(r[f.name] ?? "")),
    ];
  }

  function handlePDF() {
    const subjudul =
      from || to ? `Periode ${from ? formatTanggalShort(from) : "—"} s.d. ${to ? formatTanggalShort(to) : "—"}` : undefined;
    exportPDF({
      judul: title,
      subjudul,
      pengaturan,
      columns: [
        { header: "No. Urut", width: 18 },
        { header: "Tanggal", width: 24 },
        ...fields.filter((f) => f.name !== "tanggal").map((f) => ({ header: f.label, width: f.width })),
      ],
      rows: filtered.map(rowToArray),
      filename: `${filenameSlug}-${todayISO()}.pdf`,
    });
  }

  function handleXLSX() {
    exportExcel(
      `${filenameSlug}-${todayISO()}.xlsx`,
      title,
      ["No. Urut", "Tanggal", ...fields.filter((f) => f.name !== "tanggal").map((f) => f.label)],
      filtered.map(rowToArray)
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={title}
        description={description}
        actions={
          <>
            <Button variant="outline" onClick={handleXLSX} disabled={!filtered.length}>
              <FileSpreadsheet className="mr-2 h-4 w-4" /> Excel
            </Button>
            <Button variant="outline" onClick={handlePDF} disabled={!filtered.length}>
              <FileDown className="mr-2 h-4 w-4" /> Cetak PDF
            </Button>
            <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) setEditing(null); }}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" /> Tambah
                </Button>
              </DialogTrigger>
              <EntryDialog
                title={title}
                fields={fields}
                initial={editing}
                onSubmit={handleSave}
              />
            </Dialog>
          </>
        }
      />

      <Card className="p-4">
        <div className="flex flex-wrap items-end gap-3">
          <div className="flex-1 min-w-[200px]">
            <Label className="text-xs">Cari</Label>
            <div className="relative">
              <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input className="pl-8" placeholder="Nomor / nama / kata kunci..." value={query} onChange={(e) => setQuery(e.target.value)} />
            </div>
          </div>
          <div>
            <Label className="text-xs">Dari</Label>
            <Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
          </div>
          <div>
            <Label className="text-xs">s.d.</Label>
            <Input type="date" value={to} onChange={(e) => setTo(e.target.value)} />
          </div>
          {(query || from || to) && (
            <Button variant="ghost" onClick={() => { setQuery(""); setFrom(""); setTo(""); }}>
              Reset
            </Button>
          )}
          <div className="ml-auto text-sm text-muted-foreground">
            {filtered.length} baris
          </div>
        </div>
      </Card>

      <Card className="overflow-hidden p-0">
        <div className="overflow-x-auto">
          <UITable>
            <TableHeader>
              <TableRow className="bg-primary/5">
                <TableHead className="w-20">No. Urut</TableHead>
                <TableHead className="w-28">Tanggal</TableHead>
                {fields.filter((f) => f.name !== "tanggal").map((f) => (
                  <TableHead key={f.name}>{f.label}</TableHead>
                ))}
                <TableHead className="w-24 text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={fields.length + 2} className="py-12 text-center text-sm text-muted-foreground">
                    Belum ada data. Klik "Tambah" untuk mulai mencatat.
                  </TableCell>
                </TableRow>
              )}
              {filtered.map((r: any) => (
                <TableRow key={r.id}>
                  <TableCell className="font-medium">{r.nomorUrut}</TableCell>
                  <TableCell>{formatTanggalShort(r.tanggal)}</TableCell>
                  {fields.filter((f) => f.name !== "tanggal").map((f) => (
                    <TableCell key={f.name} className="whitespace-pre-wrap align-top">
                      {String(r[f.name] ?? "")}
                    </TableCell>
                  ))}
                  <TableCell className="text-right">
                    <Button size="icon" variant="ghost" onClick={() => { setEditing(r); setOpen(true); }}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button size="icon" variant="ghost" onClick={() => handleDelete(r.id)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </UITable>
        </div>
      </Card>
    </div>
  );
}

function EntryDialog({
  title, fields, initial, onSubmit,
}: {
  title: string;
  fields: FieldDef[];
  initial: any | null;
  onSubmit: (data: any) => void;
}) {
  const [data, setData] = useState<any>(() => {
    const base: any = { tanggal: todayISO() };
    fields.forEach((f) => { base[f.name] = ""; });
    return initial ?? base;
  });

  function update(name: string, value: any) {
    setData((d: any) => ({ ...d, [name]: value }));
  }

  function submit() {
    for (const f of fields) {
      if (f.required && !String(data[f.name] ?? "").trim()) {
        toast.error(`${f.label} wajib diisi`);
        return;
      }
    }
    onSubmit(data);
  }

  return (
    <DialogContent className="max-w-2xl">
      <DialogHeader>
        <DialogTitle className="font-serif">{initial ? "Edit" : "Tambah"} — {title}</DialogTitle>
      </DialogHeader>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {fields.map((f) => (
          <div key={f.name} className={f.type === "textarea" ? "md:col-span-2" : ""}>
            <Label className="text-xs">{f.label}{f.required && <span className="text-destructive"> *</span>}</Label>
            {f.type === "textarea" ? (
              <Textarea rows={3} value={data[f.name] ?? ""} onChange={(e) => update(f.name, e.target.value)} placeholder={f.placeholder} />
            ) : f.type === "select" ? (
              <Select value={data[f.name] ?? ""} onValueChange={(v) => update(f.name, v)}>
                <SelectTrigger><SelectValue placeholder="Pilih..." /></SelectTrigger>
                <SelectContent>
                  {f.options?.map((opt) => (
                    <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <Input
                type={f.type === "date" ? "date" : "text"}
                value={data[f.name] ?? ""}
                onChange={(e) => update(f.name, e.target.value)}
                placeholder={f.placeholder}
              />
            )}
          </div>
        ))}
      </div>
      <DialogFooter>
        <Button onClick={submit}>{initial ? "Simpan Perubahan" : "Simpan"}</Button>
      </DialogFooter>
    </DialogContent>
  );
                                                                                      }
