import {
  SIEVE_MM,
  analyze,
  envelopeStatus,
  hValue,
  mixResidues,
  passOnSieve,
  type EnvelopeRow,
  type SandSource,
} from "./grading";

function ascii(s: string): string {
  return s.replace(/[^\x20-\x7E]/g, "-").replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");
}

function concat(parts: Uint8Array[]): Uint8Array {
  const n = parts.reduce((s, p) => s + p.length, 0);
  const out = new Uint8Array(n);
  let o = 0;
  for (const p of parts) {
    out.set(p, o);
    o += p.length;
  }
  return out;
}

export function buildSievePdf(sands: SandSource[], envelope: EnvelopeRow[]): { bytes: Uint8Array; name: string } {
  const mix = analyze(mixResidues(sands));
  const h = hValue(mix.passPct);
  const env = envelopeStatus(mix.passPct, envelope);
  const date = new Date().toISOString().slice(0, 10);
  const enc = new TextEncoder();

  const pages: string[] = [];
  let ops = "";
  let y = 0;

  const newPage = () => {
    if (ops) pages.push(ops);
    ops = "";
    y = 800;
  };

  const ensure = (need: number) => {
    if (y - need < 50) newPage();
  };

  const text = (str: string, x: number, yy: number, size: number, font: "F1" | "F2") => {
    ops += `BT /${font} ${size} Tf 1 0 0 1 ${x} ${yy} Tm (${ascii(str)}) Tj ET\n`;
  };

  const rule = (x: number, yy: number, w: number) => {
    ops += `0.75 w ${x} ${yy} m ${x + w} ${yy} l S\n`;
  };

  newPage();

  text("Grania", 48, y, 20, "F2");
  text("Sieve and blend report", 48, y - 18, 11, "F1");
  text(date, 420, y, 10, "F1");
  y -= 36;
  rule(48, y + 8, 500);

  text(`H  ${h.toFixed(1)}    (band 707 - 778)`, 48, y - 6, 11, "F2");
  y -= 22;
  const blend = sands
    .filter((s) => s.onSite)
    .map((s) => `${s.name} ${s.blendPct}%`)
    .join("    ");
  text(blend || "No sands on site", 48, y, 10, "F1");
  y -= 28;

  text("Combined passing", 48, y, 12, "F2");
  y -= 16;
  const cols = [48, 110, 180, 250, 330];
  text("Sieve mm", cols[0], y, 8, "F1");
  text("Min %", cols[1], y, 8, "F1");
  text("Mix %", cols[2], y, 8, "F1");
  text("Max %", cols[3], y, 8, "F1");
  text("Status", cols[4], y, 8, "F1");
  y -= 4;
  rule(48, y, 420);
  y -= 14;
  for (const e of env) {
    ensure(16);
    text(String(e.mm), cols[0], y, 9, "F1");
    text(e.min.toFixed(1), cols[1], y, 9, "F1");
    text(e.pass.toFixed(1), cols[2], y, 9, "F2");
    text(e.max.toFixed(1), cols[3], y, 9, "F1");
    text(e.ok ? "in band" : "OUT", cols[4], y, 9, "F1");
    y -= 14;
  }

  y -= 10;
  ensure(200);
  text("Curve  (% passing vs sieve mm, log)", 48, y, 12, "F2");
  y -= 12;
  const x0 = 70;
  const y0 = y - 170;
  const w = 430;
  const ht = 160;
  ops += `0.4 w ${x0} ${y0} ${w} ${ht} re S\n`;
  const lx = (mm: number) => x0 + ((Math.log10(mm) - Math.log10(0.05)) / (Math.log10(12) - Math.log10(0.05))) * w;
  const py = (p: number) => y0 + (p / 100) * ht;
  const poly = (pts: { mm: number; p: number }[], gray: string, width: string) => {
    if (pts.length < 2) return;
    ops += `${gray} ${width} w `;
    pts.forEach((pt, i) => {
      ops += `${lx(pt.mm).toFixed(1)} ${py(pt.p).toFixed(1)} ${i ? "l" : "m"} `;
    });
    ops += "S\n0 0 0 RG\n";
  };
  poly(
    envelope.map((e) => ({ mm: e.mm, p: e.min })),
    "0.55 0.55 0.55 RG",
    "0.8",
  );
  poly(
    envelope.map((e) => ({ mm: e.mm, p: e.max })),
    "0.55 0.55 0.55 RG",
    "0.8",
  );
  poly(
    SIEVE_MM.map((mm, i) => ({ mm, p: passOnSieve(mix.passPct, i) })),
    "0.15 0.45 0.42 RG",
    "1.4",
  );
  text("0.062", lx(0.062) - 10, y0 - 12, 7, "F1");
  text("0.5", lx(0.5) - 6, y0 - 12, 7, "F1");
  text("2", lx(2) - 3, y0 - 12, 7, "F1");
  text("4", lx(4) - 3, y0 - 12, 7, "F1");
  text("0", x0 - 14, y0, 7, "F1");
  text("100", x0 - 18, y0 + ht - 3, 7, "F1");
  y = y0 - 28;

  for (const s of sands) {
    const a = analyze(s.residueG);
    ensure(200);
    text(`${s.name}${s.onSite ? "" : "  (not on site)"}`, 48, y, 12, "F2");
    y -= 14;
    text(`Sample ${a.total.toFixed(0)} g    blend ${s.blendPct}%    moisture ${s.moisturePct}%`, 48, y, 9, "F1");
    y -= 16;
    text("Sieve", 48, y, 8, "F1");
    text("Residue g", 120, y, 8, "F1");
    text("Retained %", 200, y, 8, "F1");
    text("Passing %", 290, y, 8, "F1");
    y -= 4;
    rule(48, y, 340);
    y -= 13;
    const labels = ["pan", ...SIEVE_MM.map(String)];
    labels.forEach((label, i) => {
      ensure(14);
      text(label, 48, y, 9, "F1");
      text((s.residueG[i] ?? 0).toFixed(1), 120, y, 9, "F1");
      text((a.retPct[i] ?? 0).toFixed(1), 200, y, 9, "F1");
      text(i === 0 ? "-" : passOnSieve(a.passPct, i - 1).toFixed(1), 290, y, 9, "F1");
      y -= 13;
    });
    y -= 16;
  }

  if (ops) pages.push(ops);

  const contentObjs = pages.map((p) => {
    const stream = enc.encode(p);
    const head = enc.encode(`<< /Length ${stream.length} >>\nstream\n`);
    const tail = enc.encode("\nendstream");
    return concat([head, stream, tail]);
  });

  const kids = contentObjs.map((_, i) => `${6 + i} 0 R`).join(" ");
  const pageObjs = contentObjs.map((_, i) =>
    enc.encode(
      `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Contents ${6 + i} 0 R /Resources << /Font << /F1 4 0 R /F2 5 0 R >> >> >>`,
    ),
  );

  const catalog = enc.encode("<< /Type /Catalog /Pages 2 0 R >>");
  const pagesDict = enc.encode(`<< /Type /Pages /Kids [3 0 R] /Count ${pageObjs.length} >>`);
  // Fix kids: page objects start at 3
  const pageKids = pageObjs.map((_, i) => `${3 + i} 0 R`).join(" ");
  const pagesDict2 = enc.encode(`<< /Type /Pages /Kids [${pageKids}] /Count ${pageObjs.length} >>`);
  const font1 = enc.encode("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>");
  const font2 = enc.encode("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>");

  // Object order:
  // 1 catalog, 2 pages, 3.. page dicts, then fonts, then contents — keep it simple:
  // 1 catalog
  // 2 pages
  // 3 first page
  // 4 F1
  // 5 F2
  // 6+ contents  AND extra pages 7+
  //
  // Simpler fixed structure for 1-3 pages:
  // 1 catalog
  // 2 pages (kids 3,7,9...) messy.
  //
  // Use: 1 catalog, 2 pages, 3-N page, N+1 F1, N+2 F2, then contents referenced from pages.
  // Page i references content object (3 + pageCount + 2 + i)

  const pageCount = pageObjs.length;
  const font1Num = 3 + pageCount;
  const font2Num = font1Num + 1;
  const contentStart = font2Num + 1;

  const pageDicts = pageObjs.map((_, i) =>
    enc.encode(
      `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Contents ${contentStart + i} 0 R /Resources << /Font << /F1 ${font1Num} 0 R /F2 ${font2Num} 0 R >> >> >>`,
    ),
  );
  const pagesTree = enc.encode(
    `<< /Type /Pages /Kids [${pageDicts.map((_, i) => `${3 + i} 0 R`).join(" ")}] /Count ${pageCount} >>`,
  );

  const all: Uint8Array[] = [catalog, pagesTree, ...pageDicts, font1, font2, ...contentObjs];

  const header = enc.encode("%PDF-1.4\n");
  const pieces: Uint8Array[] = [header];
  const offs: number[] = [];
  let pos = header.length;
  all.forEach((obj, i) => {
    const wrap = enc.encode(`${i + 1} 0 obj\n`);
    const end = enc.encode("\nendobj\n");
    offs.push(pos);
    pieces.push(wrap, obj, end);
    pos += wrap.length + obj.length + end.length;
  });
  const xrefPos = pos;
  let xref = `xref\n0 ${all.length + 1}\n0000000000 65535 f \n`;
  for (const o of offs) xref += `${String(o).padStart(10, "0")} 00000 n \n`;
  xref += `trailer << /Size ${all.length + 1} /Root 1 0 R >>\nstartxref\n${xrefPos}\n%%EOF`;
  pieces.push(enc.encode(xref));

  void pagesDict;
  void kids;
  void font1Num;

  return { bytes: concat(pieces), name: `grania-sieve-${date}.pdf` };
}

export function downloadSieveReport(sands: SandSource[], envelope: EnvelopeRow[]): void {
  const { bytes, name } = buildSievePdf(sands, envelope);
  let bin = "";
  bytes.forEach((b) => {
    bin += String.fromCharCode(b);
  });
  const href = `data:application/pdf;base64,${btoa(bin)}`;
  const a = document.createElement("a");
  a.href = href;
  a.download = name;
  a.rel = "noopener";
  a.style.display = "none";
  document.body.appendChild(a);
  a.click();
  a.remove();
}
