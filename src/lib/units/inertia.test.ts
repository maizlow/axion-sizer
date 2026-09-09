import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { inertiaAboutCm, referToMotor, withOffset } from "./inertia.ts";

function close(actual: number, expected: number, eps = 1e-12) {
  assert.ok(
    Math.abs(actual - expected) <= eps,
    `expected ${expected}, got ${actual} (Δ ${Math.abs(actual - expected)})`,
  );
}

describe("inertiaAboutCm", () => {
  it("point mass m r²", () => {
    close(inertiaAboutCm("point", { m: 2, r: 0.5 }), 0.5);
  });

  it("solid cylinder ⅛ m D² = ½ m r²", () => {
    close(inertiaAboutCm("cylAxis", { m: 8, Do: 0.4 }), 0.16);
  });

  it("hollow cylinder ⅛ m (Do² + Di²)", () => {
    close(inertiaAboutCm("cylHollow", { m: 10, Do: 0.4, Di: 0.2 }), 0.25);
  });

  it("clamps inner diameter to outer", () => {
    close(
      inertiaAboutCm("cylHollow", { m: 10, Do: 0.4, Di: 0.9 }),
      inertiaAboutCm("cylHollow", { m: 10, Do: 0.4, Di: 0.4 }),
    );
  });

  it("thin ring ¼ m D² = m r²", () => {
    close(inertiaAboutCm("ring", { m: 4, Do: 0.5 }), 0.25);
  });

  it("solid sphere ⅒ m D² = ⅖ m r²", () => {
    close(inertiaAboutCm("sphere", { m: 10, Do: 0.2 }), 0.04);
  });

  it("rectangular plate m(a²+b²)/12", () => {
    close(inertiaAboutCm("plate", { m: 12, a: 0.6, b: 0.4 }), 0.52);
  });

  it("rod through centre m L² / 12", () => {
    close(inertiaAboutCm("rod", { m: 6, L: 1 }), 0.5);
  });

  it("rod through end m L² / 3 (Steiner of centre formula)", () => {
    close(inertiaAboutCm("rodEnd", { m: 6, L: 1 }), 2);
    const fromSteiner = inertiaAboutCm("rod", { m: 6, L: 1 }) + 6 * 0.5 * 0.5;
    close(inertiaAboutCm("rodEnd", { m: 6, L: 1 }), fromSteiner);
  });

  it("translating mass on a pulley m (D/2)²", () => {
    close(inertiaAboutCm("linPulley", { m: 5, Do: 0.2 }), 0.05);
  });

  it("translating mass on a screw m (P/2π)²", () => {
    close(inertiaAboutCm("linScrew", { m: 4, lead: 2 * Math.PI }), 4);
  });

  it("returns 0 for empty mass", () => {
    close(inertiaAboutCm("cylAxis", { m: 0, Do: 1 }), 0);
  });
});

describe("withOffset / referToMotor", () => {
  it("Steiner J_cm + m d²", () => {
    close(withOffset(1, 2, 0.5), 1.5);
  });

  it("J_motor = J_load / i²", () => {
    close(referToMotor(16, 4), 1);
  });
});
