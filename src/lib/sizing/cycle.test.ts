import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { peakAccel, sampleSegment } from "./cycle.ts";
import type { CycleSegment } from "./types.ts";

function close(actual: number, expected: number, eps = 1e-9) {
  assert.ok(
    Math.abs(actual - expected) <= eps,
    `expected ${expected}, got ${actual} (Δ ${Math.abs(actual - expected)})`,
  );
}

function seg(partial: Partial<CycleSegment> & Pick<CycleSegment, "accelLaw" | "vStart" | "vEnd" | "time">): CycleSegment {
  return {
    id: "t",
    inclineDir: "accel",
    accel: 0,
    distanceMm: 0,
    positionMm: 0,
    payloadKg: 0,
    ...partial,
  };
}

describe("peakAccel", () => {
  it("linear equals mean Δv/t", () => {
    close(peakAccel(seg({ accelLaw: "linear", vStart: 0, vEnd: 2, time: 1 })), 2);
  });

  it("sin² peak is (π/2) × mean and matches the sampler", () => {
    const s = seg({ accelLaw: "sin2", vStart: 0, vEnd: 2, time: 1 });
    const peak = peakAccel(s);
    close(peak, Math.PI);
    close(sampleSegment(s, 0.5).a, peak);
  });

  it("jerk-limited peak is 2 × mean and matches the sampler triangle", () => {
    const s = seg({ accelLaw: "jerk", vStart: 0, vEnd: 2, time: 1 });
    const peak = peakAccel(s);
    close(peak, 4);
    close(sampleSegment(s, 0.5).a, peak);
    close(sampleSegment(s, 0).a, 0);
    close(sampleSegment(s, 1).a, 0);
  });
});
