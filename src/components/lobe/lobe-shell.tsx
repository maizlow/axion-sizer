import { useMemo, useRef, useState } from "react";
import { LobeMark } from "@/components/brand/lobe-mark";
import { cn } from "@/lib/cn";
import { useLocale, useT } from "@/lib/i18n/locale";
import { useTheme } from "@/lib/theme";
import { downloadLobeCwc } from "@/lib/lobe/cwc-export";
import { hubHref } from "@/lib/tools";
import { Moon, Sun } from "lucide-react";

export interface CamPt {
  id: string;
  x: number;
  y: number;
}

const LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

export function LobeShell() {
  const t = useT();
  const locale = useLocale((s) => s.locale);
  const setLocale = useLocale((s) => s.setLocale);
  const theme = useTheme((s) => s.theme);
  const toggleTheme = useTheme((s) => s.toggle);

  const [xMin, setXMin] = useState(0);
  const [xMax, setXMax] = useState(360);
  const [yMin, setYMin] = useState(0);
  const [yMax, setYMax] = useState(100);
  const [pts, setPts] = useState<CamPt[]>([
    { id: "p0", x: 0, y: 0 },
    { id: "p1", x: 180, y: 80 },
    { id: "p2", x: 360, y: 0 },
  ]);
  const drag = useRef<{ id: string; ptr: number } | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  const W = 720;
  const H = 420;
  const pad = { l: 48, r: 20, t: 20, b: 36 };
  const innerW = W - pad.l - pad.r;
  const innerH = H - pad.t - pad.b;
  const spanX = Math.max(1e-6, xMax - xMin);
  const spanY = Math.max(1e-6, yMax - yMin);
  const toX = (x: number) => pad.l + ((x - xMin) / spanX) * innerW;
  const toY = (y: number) => pad.t + innerH - ((y - yMin) / spanY) * innerH;

  const ordered = useMemo(() => [...pts].sort((a, b) => a.x - b.x), [pts]);
  const path = ordered.map((p, i) => `${i ? "L" : "M"} ${toX(p.x).toFixed(1)} ${toY(p.y).toFixed(1)}`).join(" ");

  const xTicks = 8;
  const yTicks = 5;
  const gridX = Array.from({ length: xTicks + 1 }, (_, i) => xMin + (spanX * i) / xTicks);
  const gridY = Array.from({ length: yTicks + 1 }, (_, i) => yMin + (spanY * i) / yTicks);

  function dataFromClient(cx: number, cy: number): { x: number; y: number } {
    const svg = svgRef.current;
    if (!svg) return { x: xMin, y: yMin };
    const r = svg.getBoundingClientRect();
    const px = ((cx - r.left) / r.width) * W;
    const py = ((cy - r.top) / r.height) * H;
    const x = xMin + ((px - pad.l) / innerW) * spanX;
    const y = yMin + ((pad.t + innerH - py) / innerH) * spanY;
    return { x, y };
  }

  function movePoint(id: string, rawX: number, rawY: number) {
    setPts((cur) => {
      const sorted = [...cur].sort((a, b) => a.x - b.x);
      const i = sorted.findIndex((p) => p.id === id);
      if (i < 0) return cur;
      const eps = spanX * 0.002;
      const lo = i === 0 ? xMin : sorted[i - 1].x + eps;
      const hi = i === sorted.length - 1 ? xMax : sorted[i + 1].x - eps;
      const x = Math.min(hi, Math.max(lo, rawX));
      const y = Math.min(yMax, Math.max(yMin, rawY));
      return cur.map((p) => (p.id === id ? { ...p, x, y } : p));
    });
  }

  function onPointerDown(id: string, e: React.PointerEvent) {
    e.preventDefault();
    (e.target as Element).setPointerCapture?.(e.pointerId);
    drag.current = { id, ptr: e.pointerId };
  }

  function onPointerMove(e: React.PointerEvent) {
    if (!drag.current) return;
    const d = dataFromClient(e.clientX, e.clientY);
    movePoint(drag.current.id, d.x, d.y);
  }

  function onPointerUp() {
    drag.current = null;
  }

  function addPoint() {
    setPts((cur) => {
      const sorted = [...cur].sort((a, b) => a.x - b.x);
      let best = 0;
      let gap = -1;
      for (let i = 0; i < sorted.length - 1; i++) {
        const g = sorted[i + 1].x - sorted[i].x;
        if (g > gap) {
          gap = g;
          best = i;
        }
      }
      if (sorted.length < 2) {
        return [...cur, { id: `p${Date.now()}`, x: (xMin + xMax) / 2, y: (yMin + yMax) / 2 }];
      }
      const a = sorted[best];
      const b = sorted[best + 1];
      return [...cur, { id: `p${Date.now()}`, x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 }];
    });
  }

  function removePoint(id: string) {
    setPts((cur) => (cur.length <= 2 ? cur : cur.filter((p) => p.id !== id)));
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-20 border-b border-border bg-background/95 backdrop-blur-sm">
        <div className="mx-auto flex max-w-[1100px] items-center gap-2 px-3 py-2 sm:px-6 sm:py-3">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <LobeMark className="size-8" />
              <div className="min-w-0">
                <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground sm:text-xs">
                  <a href={hubHref()} className="hover:text-foreground">
                    {t("hub.short")}
                  </a>
                  <span className="mx-1.5 text-border">/</span>
                  {t("lobe.name")}
                </div>
                <h1 className="truncate text-xs font-medium tracking-tight sm:text-base">{t("lobe.tag")}</h1>
              </div>
            </div>
          </div>
          <div className="flex h-8 items-center gap-1.5">
            <div className="inline-flex h-8 items-center rounded-[var(--radius-sm)] border border-border p-0.5">
              {(["en", "sv"] as const).map((code) => (
                <button
                  key={code}
                  type="button"
                  onClick={() => setLocale(code)}
                  className={cn(
                    "h-7 min-w-8 rounded-[calc(var(--radius-sm)-2px)] px-2 font-mono text-xs",
                    locale === code ? "bg-muted text-foreground" : "text-muted-foreground",
                  )}
                >
                  {t(`lang.${code}`)}
                </button>
              ))}
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={theme === "light"}
              aria-label={t("theme.toggle")}
              onClick={toggleTheme}
              className="flex h-8 w-14 items-center overflow-hidden rounded-[var(--radius-sm)] border border-border bg-muted p-1"
            >
              <span
                className={cn(
                  "grid size-6 place-items-center rounded-full bg-foreground text-background transition-transform",
                  theme === "light" ? "translate-x-6" : "translate-x-0",
                )}
              >
                {theme === "light" ? <Sun className="size-3" /> : <Moon className="size-3" />}
              </span>
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto flex max-w-[1100px] flex-col gap-4 px-4 py-6 sm:px-6">
        <section className="rounded-[var(--radius-lg)] border border-border bg-card p-4 sm:p-5">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <label className="text-[11px] text-muted-foreground">
              X min
              <input type="number" className="mt-1 h-9 w-full rounded-[var(--radius-sm)] border border-border bg-input px-2 font-mono text-sm text-foreground" value={xMin} onChange={(e) => setXMin(Number(e.target.value))} />
            </label>
            <label className="text-[11px] text-muted-foreground">
              X max
              <input type="number" className="mt-1 h-9 w-full rounded-[var(--radius-sm)] border border-border bg-input px-2 font-mono text-sm text-foreground" value={xMax} onChange={(e) => setXMax(Number(e.target.value))} />
            </label>
            <label className="text-[11px] text-muted-foreground">
              Y min
              <input type="number" className="mt-1 h-9 w-full rounded-[var(--radius-sm)] border border-border bg-input px-2 font-mono text-sm text-foreground" value={yMin} onChange={(e) => setYMin(Number(e.target.value))} />
            </label>
            <label className="text-[11px] text-muted-foreground">
              Y max
              <input type="number" className="mt-1 h-9 w-full rounded-[var(--radius-sm)] border border-border bg-input px-2 font-mono text-sm text-foreground" value={yMax} onChange={(e) => setYMax(Number(e.target.value))} />
            </label>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">{t("lobe.hint")}</p>
          <svg
            ref={svgRef}
            viewBox={`0 0 ${W} ${H}`}
            className="mt-3 w-full touch-none select-none rounded-[var(--radius-sm)] border border-border bg-background"
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={onPointerUp}
          >
            {gridX.map((x) => (
              <line
                key={`vx-${x}`}
                x1={toX(x)}
                y1={pad.t}
                x2={toX(x)}
                y2={pad.t + innerH}
                stroke="var(--color-border)"
                strokeWidth="1"
              />
            ))}
            {gridY.map((y) => (
              <line
                key={`hy-${y}`}
                x1={pad.l}
                y1={toY(y)}
                x2={pad.l + innerW}
                y2={toY(y)}
                stroke="var(--color-border)"
                strokeWidth="1"
              />
            ))}
            {gridX.map((x) => (
              <text key={`tx-${x}`} x={toX(x)} y={H - 10} textAnchor="middle" fill="var(--color-muted-foreground)" fontSize="9">
                {Number.isInteger(x) ? String(x) : x.toFixed(1)}
              </text>
            ))}
            {gridY.map((y) => (
              <text key={`ty-${y}`} x={pad.l - 6} y={toY(y) + 3} textAnchor="end" fill="var(--color-muted-foreground)" fontSize="9">
                {Number.isInteger(y) ? String(y) : y.toFixed(1)}
              </text>
            ))}
            <path d={path} fill="none" stroke="var(--color-brand)" strokeWidth="2" />
            {ordered.map((p, i) => (
              <g key={p.id}>
                <circle
                  cx={toX(p.x)}
                  cy={toY(p.y)}
                  r="9"
                  fill="var(--color-foreground)"
                  className="cursor-grab"
                  onPointerDown={(e) => onPointerDown(p.id, e)}
                />
                <text
                  x={toX(p.x)}
                  y={toY(p.y) - 14}
                  textAnchor="middle"
                  fill="var(--color-muted-foreground)"
                  fontSize="11"
                  className="pointer-events-none"
                >
                  {LETTERS[i] ?? i + 1}
                </text>
              </g>
            ))}
            <text x={W / 2} y={H - 8} textAnchor="middle" fill="var(--color-muted-foreground)" fontSize="10">
              X
            </text>
            <text x={14} y={H / 2} textAnchor="middle" fill="var(--color-muted-foreground)" fontSize="10" transform={`rotate(-90 14 ${H / 2})`}>
              Y
            </text>
          </svg>
          <div className="mt-3 flex flex-wrap gap-2">
            <button type="button" className="h-9 rounded-[var(--radius-sm)] border border-border px-3 text-sm" onClick={addPoint}>
              {t("lobe.add")}
            </button>
            <button
              type="button"
              className="h-9 rounded-[var(--radius-sm)] border border-border px-3 text-sm"
              onClick={() => downloadLobeCwc({ points: ordered, xMin, xMax, yMin, yMax })}
            >
              {t("lobe.cwc")}
            </button>
          </div>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[20rem] text-left text-sm">
              <thead className="text-xs text-muted-foreground">
                <tr>
                  <th className="py-1 font-medium"> </th>
                  <th className="py-1 font-medium">X</th>
                  <th className="py-1 font-medium">Y</th>
                  <th className="py-1 font-medium"> </th>
                </tr>
              </thead>
              <tbody>
                {ordered.map((p, i) => (
                  <tr key={p.id} className="border-t border-border">
                    <td className="py-1 font-mono">{LETTERS[i] ?? i + 1}</td>
                    <td className="py-1 font-mono tabular-nums">{p.x.toFixed(1)}</td>
                    <td className="py-1 font-mono tabular-nums">{p.y.toFixed(1)}</td>
                    <td className="py-1">
                      {pts.length > 2 && (
                        <button type="button" className="text-xs text-muted-foreground" onClick={() => removePoint(p.id)}>
                          {t("lobe.remove")}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </main>
      <footer className="mx-auto max-w-[1100px] px-4 pb-8 text-xs text-muted-foreground sm:px-6">{t("hub.footer")}</footer>
    </div>
  );
}
