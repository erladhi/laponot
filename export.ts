import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import { formatTanggalShort } from "./format";
import type { Pengaturan } from "./db";

export interface PDFColumn {
  header: string;
  width?: number;
}

export interface PDFOptions {
  judul: string;
  subjudul?: string;
  pengaturan?: Pengaturan | null;
  columns: PDFColumn[];
  rows: (string | number)[][];
  filename: string;
}

export function exportPDF(opts: PDFOptions) {
  const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
  const pageW = doc.internal.pageSize.getWidth();

  // Kop
  doc.setFont("times", "bold");
  doc.setFontSize(13);
  const nama = opts.pengaturan?.namaNotaris ?? "NOTARIS";
  const gelar = opts.pengaturan?.gelar ?? "";
  doc.text(`${nama}${gelar ? ", " + gelar : ""}`.toUpperCase(), pageW / 2, 12, { align: "center" });
  doc.setFont("times", "normal");
  doc.setFontSize(10);
  if (opts.pengaturan?.skPengangkatan)
    doc.text(`SK Pengangkatan: ${opts.pengaturan.skPengangkatan}`, pageW / 2, 17, { align: "center" });
  if (opts.pengaturan?.wilayahJabatan)
    doc.text(`Wilayah Jabatan: ${opts.pengaturan.wilayahJabatan} — Kedudukan: ${opts.pengaturan?.kotaKedudukan ?? ""}`, pageW / 2, 22, { align: "center" });
  if (opts.pengaturan?.alamatKantor)
    doc.text(opts.pengaturan.alamatKantor, pageW / 2, 27, { align: "center" });

  doc.setDrawColor(30);
  doc.line(10, 30, pageW - 10, 30);

  doc.setFont("times", "bold");
  doc.setFontSize(12);
  doc.text(opts.judul.toUpperCase(), pageW / 2, 37, { align: "center" });
  if (opts.subjudul) {
    doc.setFont("times", "normal");
    doc.setFontSize(10);
    doc.text(opts.subjudul, pageW / 2, 42, { align: "center" });
  }

  autoTable(doc, {
    startY: opts.subjudul ? 46 : 41,
    head: [opts.columns.map((c) => c.header)],
    body: opts.rows,
    styles: { font: "times", fontSize: 9, cellPadding: 1.5, lineColor: [60, 60, 60], lineWidth: 0.1 },
    headStyles: { fillColor: [27, 42, 78], textColor: 255, halign: "center" },
    columnStyles: Object.fromEntries(
      opts.columns.map((c, i) => [i, c.width ? { cellWidth: c.width } : {}])
    ),
    theme: "grid",
    didDrawPage: (data) => {
      const str = `Halaman ${doc.getNumberOfPages()}`;
      doc.setFontSize(8);
      doc.text(str, pageW - 15, doc.internal.pageSize.getHeight() - 8);
    },
  });

  // Tanda tangan
  const finalY = (doc as any).lastAutoTable.finalY + 12;
  const ttdY = finalY + 28 > doc.internal.pageSize.getHeight() - 10 ? undefined : finalY;
  if (ttdY) {
    const kota = opts.pengaturan?.kotaKedudukan ?? "";
    const tgl = formatTanggalShort(new Date().toISOString().slice(0, 10));
    doc.setFont("times", "normal");
    doc.setFontSize(10);
    doc.text(`${kota}, ${tgl}`, pageW - 60, ttdY);
    doc.text("Notaris,", pageW - 60, ttdY + 6);
    doc.setFont("times", "bold");
    doc.text(`${nama}${gelar ? ", " + gelar : ""}`, pageW - 60, ttdY + 28);
  }

  doc.save(opts.filename);
}

export function exportExcel(filename: string, sheetName: string, headers: string[], rows: (string | number)[][]) {
  const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, sheetName.slice(0, 31));
  XLSX.writeFile(wb, filename);
}
