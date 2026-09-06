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

function pdfBytes(parts: string[]): Uint8Array {
  const enc = new TextEncoder();
  const chunks = parts.map((p) => enc.encode(p));
  let n = 0;
  for (const c of chunks) n += c.length;
  const out = new Uint8Array(n);
  let o = 0;
  for (const c of chunks) {
    out.set(c, o);
    o += c.length;
  }
  return out;
}

function ascii(s: string): string {
  return s.replace(/[^\x20-\x7E]/g, "-").replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");
}

export function buildSievePdf(sands: SandSource[], envelope: EnvelopeRow[]): { bytes: Uint8Array; name: string } {
  const mix = analyze(mixResidues(sands));
  const h = hValue(mix.passPct);
  const env = envelopeStatus(mix.passPct, envelope);
  const date = new Date().toISOString().slice(0, 10);

  const lines: string[] = [
    "Grania sieve report",
    date,
    `H = ${h.toFixed(1)}`,
    `Blend: ${sands.filter((s) => s.onSite).map((s) => `${s.name} ${s.blendPct}%`).join(" | ") || "-"}`,
    "",
    "Mix passing %   min   mix   max",
    ...env.map(
      (e) =>
        `${String(e.mm).padStart(6)} ${e.min.toFixed(1).padStart(6)} ${e.pass.toFixed(1).padStart(6)} ${e.max.toFixed(1).padStart(6)}${e.ok ? "" : " OUT"}`,
    ),
  ];
  for (const s of sands) {
    const a = analyze(s.residueG);
    lines.push("");
    lines.push(`${s.name}${s.onSite ? "" : " off"} ${a.total.toFixed(0)} g`);
    lines.push("sieve        g   ret%  pass%");
    lines.push(`   pan ${(s.residueG[0] ?? 0).toFixed(1).padStart(8)} ${(a.retPct[0] ?? 0).toFixed(1).padStart(6)}`);
    SIEVE_MM.forEach((mm, i) => {
      lines.push(
        `${mm.toFixed(3).padStart(6)} ${(s.residueG[i + 1] ?? 0).toFixed(1).padStart(8)} ${(a.retPct[i + 1] ?? 0).toFixed(1).padStart(6)} ${passOnSieve(a.passPct, i).toFixed(1).padStart(6)}`,
      );
    });
  }

  let y = 800;
  const contentLines = ["BT /F1 10 Tf"];
  for (const row of lines) {
    if (y < 48) break;
    contentLines.push(`1 0 0 1 40 ${y} Tm (${ascii(row)}) Tj`);
    y -= row ? 12 : 8;
  }
  contentLines.push("ET");
  const stream = contentLines.join("\n") + "\n";
  const streamBytes = new TextEncoder().encode(stream);

  const objs: Uint8Array[] = [];
  const push = (s: string) => objs.push(new TextEncoder().encode(s));
  push("<< /Type /Catalog /Pages 2 0 R >>");
  push("<< /Type /Pages /Kids [3 0 R] /Count 1 >>");
  push("<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>");
  push(`<< /Length ${streamBytes.length} >>\nstream\n${stream}endstream`);
  push("<< /Type /Font /Subtype /Type1 /BaseFont /Courier >>");

  const header = new TextEncoder().encode("%PDF-1.4\n");
  const pieces: Uint8Array[] = [header];
  const offs: number[] = [];
  let pos = header.length;
  objs.forEach((obj, i) => {
    const wrap = new TextEncoder().encode(`${i + 1} 0 obj\n`);
    const end = new TextEncoder().encode("\nendobj\n");
    offs.push(pos);
    pieces.push(wrap, obj, end);
    pos += wrap.length + obj.length + end.length;
  });
  const xrefPos = pos;
  let xref = `xref\n0 ${objs.length + 1}\n0000000000 65535 f \n`;
  for (const o of offs) xref += `${String(o).padStart(10, "0")} 00000 n \n`;
  xref += `trailer << /Size ${objs.length + 1} /Root 1 0 R >>\nstartxref\n${xrefPos}\n%%EOF`;
  pieces.push(new TextEncoder().encode(xref));
  return { bytes: pdfBytes(pieces.map((u) => new TextDecoder().decode(u))), name: `grania-sieve-${date}.pdf` };
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
