import type { ReactNode } from "react";
import type { ApplicationId } from "@/lib/sizing/types";

const ink = "#d5dbe2";
const mute = "#8b929c";
const accent = "#6f8f8a";

function Svg({ children, wide }: { children: ReactNode; wide?: boolean }) {
  return (
    <svg
      viewBox={wide ? "0 0 320 88" : "0 0 56 40"}
      className={wide ? "h-[88px] w-full" : "h-10 w-14 shrink-0"}
      fill="none"
      aria-hidden
    >
      {children}
    </svg>
  );
}

export function FieldGlyph({ id }: { id?: string }) {
  if (!id) return null;
  return (
    <Svg>
      {id === "mass" && (
        <>
          <rect x="14" y="10" width="28" height="18" rx="2" stroke={ink} />
          <text x="28" y="23" textAnchor="middle" fill={mute} fontSize="8">
            m
          </text>
        </>
      )}
      {id === "speed" && (
        <>
          <path d="M8 22 H44" stroke={mute} />
          <path d="M34 16 L44 22 L34 28" stroke={accent} />
          <text x="20" y="18" fill={ink} fontSize="8">
            v
          </text>
        </>
      )}
      {id === "pulley" && (
        <>
          <circle cx="28" cy="20" r="12" stroke={ink} />
          <circle cx="28" cy="20" r="3" fill={accent} />
          <path d="M16 20 H8 M40 20 H48" stroke={mute} />
        </>
      )}
      {id === "roller" && (
        <>
          <ellipse cx="18" cy="20" rx="6" ry="10" stroke={ink} />
          <ellipse cx="38" cy="20" rx="6" ry="10" stroke={ink} />
          <path d="M18 10 H38 M18 30 H38" stroke={mute} />
        </>
      )}
      {id === "incline" && (
        <>
          <path d="M8 32 L48 12" stroke={ink} />
          <path d="M8 32 H32" stroke={mute} />
          <path d="M20 32 A18 18 0 0 0 26.5 24" stroke={accent} />
        </>
      )}
      {id === "lead" && (
        <>
          <path d="M16 8 V32" stroke={mute} />
          <path d="M16 12 H40 M16 20 H36 M16 28 H32" stroke={ink} />
          <text x="42" y="16" fill={accent} fontSize="7">
            P
          </text>
        </>
      )}
      {id === "drum" && (
        <>
          <rect x="14" y="10" width="28" height="20" rx="6" stroke={ink} />
          <circle cx="18" cy="20" r="2" fill={accent} />
          <circle cx="38" cy="20" r="2" fill={accent} />
        </>
      )}
      {id === "falls" && (
        <>
          <path d="M16 8 V32 M28 8 V32 M40 8 V32" stroke={ink} />
          <path d="M16 32 H40" stroke={accent} />
        </>
      )}
      {id === "hoist" && (
        <>
          <path d="M12 10 H44 V16" stroke={ink} />
          <path d="M28 16 V30" stroke={accent} />
          <path d="M22 30 H34" stroke={ink} />
        </>
      )}
      {id === "pinion" && (
        <>
          <circle cx="22" cy="22" r="8" stroke={ink} />
          <path d="M30 22 H50" stroke={accent} />
          <path d="M34 18 V26 M42 18 V26 M50 18 V26" stroke={mute} />
        </>
      )}
      {id === "counterweight" && (
        <>
          <path d="M28 8 V20" stroke={mute} />
          <rect x="10" y="20" width="16" height="12" rx="1" stroke={ink} />
          <rect x="30" y="22" width="14" height="10" rx="1" stroke={accent} />
        </>
      )}
      {id === "inertia" && (
        <>
          <ellipse cx="28" cy="20" rx="16" ry="10" stroke={ink} />
          <path d="M28 10 V30" stroke={accent} />
        </>
      )}
      {id === "rpm" && (
        <>
          <circle cx="28" cy="20" r="11" stroke={ink} />
          <path d="M28 20 L36 14" stroke={accent} />
        </>
      )}
      {id === "torque" && (
        <>
          <circle cx="28" cy="20" r="10" stroke={ink} />
          <path d="M28 10 A10 10 0 0 1 38 20" stroke={accent} />
          <path d="M36 16 L38 20 L33 21" stroke={accent} />
        </>
      )}
      {id === "impeller" && (
        <>
          <circle cx="28" cy="20" r="12" stroke={mute} />
          <path d="M28 20 L16 14 M28 20 L40 14 M28 20 L28 32" stroke={ink} />
        </>
      )}
      {id === "flow" && (
        <>
          <path d="M8 20 C16 10, 24 30, 32 20 C40 10, 48 26, 52 20" stroke={accent} />
        </>
      )}
      {id === "pressure" && (
        <>
          <rect x="16" y="8" width="24" height="24" rx="2" stroke={ink} />
          <path d="M28 14 V26" stroke={accent} />
        </>
      )}
      {id === "head" && (
        <>
          <path d="M16 32 V12 H40 V32" stroke={ink} />
          <path d="M20 12 V8 M36 12 V8" stroke={mute} />
          <path d="M20 22 H36" stroke={accent} />
        </>
      )}
      {id === "density" && (
        <>
          <rect x="16" y="10" width="24" height="20" rx="2" stroke={ink} />
          <path d="M16 24 H40" fill="none" stroke={accent} />
        </>
      )}
    </Svg>
  );
}

export function ApplicationDiagram({ id }: { id: ApplicationId }) {
  return (
    <div className="overflow-hidden rounded-[var(--radius-md)] border border-border bg-muted/40 px-3 py-2">
      <Svg wide>
        {id === "conveyor" && (
          <>
            <path d="M24 62 L280 28" stroke={ink} strokeWidth="3" />
            <circle cx="40" cy="60" r="10" stroke={accent} />
            <circle cx="260" cy="30" r="10" stroke={mute} />
            <rect x="110" y="34" width="36" height="16" rx="2" stroke={ink} />
            <text x="24" y="82" fill={mute} fontSize="10">
              D pulley
            </text>
            <text x="128" y="28" fill={mute} fontSize="10">
              m
            </text>
            <text x="200" y="18" fill={mute} fontSize="10">
              v →
            </text>
            <text x="70" y="78" fill={mute} fontSize="10">
              θ
            </text>
          </>
        )}
        {id === "roller-conveyor" && (
          <>
            <ellipse cx="50" cy="48" rx="10" ry="16" stroke={ink} />
            <ellipse cx="100" cy="48" rx="10" ry="16" stroke={ink} />
            <ellipse cx="150" cy="48" rx="10" ry="16" stroke={accent} />
            <ellipse cx="200" cy="48" rx="10" ry="16" stroke={ink} />
            <ellipse cx="250" cy="48" rx="10" ry="16" stroke={ink} />
            <rect x="120" y="18" width="60" height="16" rx="2" stroke={ink} />
            <text x="20" y="80" fill={mute} fontSize="10">
              D roller
            </text>
            <text x="230" y="20" fill={mute} fontSize="10">
              v →
            </text>
          </>
        )}
        {(id === "crane" || id === "winch") && (
          <>
            <rect x="40" y="28" width="70" height="28" rx="8" stroke={ink} />
            <path d="M110 42 H160 V70" stroke={accent} />
            {id === "crane" && <path d="M148 42 V70 M172 42 V70" stroke={mute} />}
            <path d="M150 70 H180" stroke={ink} />
            <text x="50" y="80" fill={mute} fontSize="10">
              D drum
            </text>
            <text x="188" y="74" fill={mute} fontSize="10">
              m
            </text>
            <text x="168" y="24" fill={mute} fontSize="10">
              v↑
            </text>
          </>
        )}
        {id === "ball-screw" && (
          <>
            <path d="M70 16 V72" stroke={mute} />
            <path d="M70 22 H200 M70 36 H188 M70 50 H176 M70 64 H164" stroke={ink} />
            <rect x="200" y="28" width="44" height="24" rx="2" stroke={accent} />
            <text x="24" y="44" fill={mute} fontSize="10">
              lead P
            </text>
            <text x="252" y="44" fill={mute} fontSize="10">
              m
            </text>
            <text x="210" y="20" fill={mute} fontSize="10">
              v
            </text>
          </>
        )}
        {id === "rack-pinion" && (
          <>
            <circle cx="70" cy="44" r="16" stroke={accent} />
            <path d="M86 44 H280" stroke={ink} strokeWidth="3" />
            <path d="M110 36 V52 M150 36 V52 M190 36 V52 M230 36 V52" stroke={mute} />
            <text x="30" y="80" fill={mute} fontSize="10">
              D pinion
            </text>
            <text x="240" y="28" fill={mute} fontSize="10">
              v →
            </text>
          </>
        )}
        {id === "gantry" && (
          <>
            <circle cx="48" cy="48" r="12" stroke={accent} />
            <path d="M60 48 H270" stroke={ink} strokeWidth="2" />
            <rect x="140" y="30" width="40" height="18" rx="2" stroke={ink} />
            <text x="20" y="80" fill={mute} fontSize="10">
              D pulley
            </text>
            <text x="230" y="28" fill={mute} fontSize="10">
              v →
            </text>
          </>
        )}
        {id === "rotary-table" && (
          <>
            <ellipse cx="160" cy="46" rx="70" ry="26" stroke={ink} />
            <circle cx="160" cy="46" r="4" fill={accent} />
            <path d="M160 20 A70 26 0 0 1 220 40" stroke={accent} />
            <text x="24" y="80" fill={mute} fontSize="10">
              J, n
            </text>
          </>
        )}
        {id === "mixer" && (
          <>
            <rect x="110" y="12" width="100" height="64" rx="4" stroke={ink} />
            <path d="M160 12 V52" stroke={accent} />
            <path d="M136 52 H184 M148 60 H172" stroke={ink} />
            <text x="24" y="44" fill={mute} fontSize="10">
              D
            </text>
          </>
        )}
        {id === "fan" && (
          <>
            <circle cx="160" cy="44" r="28" stroke={ink} />
            <path d="M160 44 L140 28 M160 44 L184 28 M160 44 L160 70" stroke={accent} />
            <text x="24" y="28" fill={mute} fontSize="10">
              Q, Δp
            </text>
          </>
        )}
        {id === "pump" && (
          <>
            <circle cx="150" cy="44" r="24" stroke={ink} />
            <path d="M174 44 H230 V28" stroke={accent} />
            <path d="M126 44 H90" stroke={mute} />
            <text x="200" y="22" fill={mute} fontSize="10">
              H
            </text>
            <text x="24" y="48" fill={mute} fontSize="10">
              Q
            </text>
          </>
        )}
      </Svg>
    </div>
  );
}
