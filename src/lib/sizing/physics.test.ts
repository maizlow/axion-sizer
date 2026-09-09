import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { defaultInputs } from "./applications.ts";
import { calculateSizing } from "./physics.ts";
import type { CycleSegment, MotionCycle } from "./types.ts";

const G = 9.80665;

function close(actual: number, expected: number, eps = 1e-6) {
  assert.ok(
    Math.abs(actual - expected) <= eps,
    `expected ${expected}, got ${actual} (Δ ${Math.abs(actual - expected)})`,
  );
}

function cycle(segments: CycleSegment[]): MotionCycle {
  return { enabled: true, travelUnit: "mm", segments };
}

function holdSeg(payloadKg: number, v = 0.5): CycleSegment {
  return {
    id: "hold",
    inclineDir: "hold",
    accelLaw: "linear",
    vStart: v,
    vEnd: v,
    accel: 0,
    time: 1,
    distanceMm: v * 1000,
    positionMm: v * 1000,
    payloadKg,
  };
}

function accelSeg(payloadKg: number, v0: number, v1: number, time: number, dir: CycleSegment["inclineDir"]): CycleSegment {
  return {
    id: dir,
    inclineDir: dir,
    accelLaw: "linear",
    vStart: v0,
    vEnd: v1,
    accel: (v1 - v0) / time,
    time,
    distanceMm: ((v0 + v1) / 2) * time * 1000,
    positionMm: ((v0 + v1) / 2) * time * 1000,
    payloadKg,
  };
}

describe("cycle gravity", () => {
  it("keeps mg sinθ on an inclined conveyor hold / cruise", () => {
    const inputs = defaultInputs("conveyor");
    inputs.payloadKg = 100;
    inputs.beltMassKg = 0;
    inputs.mu = 0;
    inputs.inclineDeg = 10;
    inputs.pulleyDiaM = 200;
    inputs.efficiency = 100;
    inputs.dutyType = "S1";
    inputs.edHour = 100;
    const theta = (10 * Math.PI) / 180;
    const T = (100 * G * Math.sin(theta) * 0.1) / 1;
    const r = calculateSizing("conveyor", inputs, cycle([holdSeg(100)]));
    close(r.rmsTorqueNm, T, 1e-4);
    close(r.outputTorqueNm, T, 1e-4);
  });

  it("does not reverse gravity on conveyor deceleration", () => {
    const inputs = defaultInputs("conveyor");
    inputs.payloadKg = 100;
    inputs.beltMassKg = 0;
    inputs.mu = 0;
    inputs.inclineDeg = 10;
    inputs.pulleyDiaM = 200;
    inputs.efficiency = 100;
    inputs.dutyType = "S1";
    inputs.edHour = 100;
    const theta = (10 * Math.PI) / 180;
    const a = -5;
    const F = 100 * G * Math.sin(theta) + 100 * a;
    const T = Math.abs(F * 0.1);
    const r = calculateSizing("conveyor", inputs, cycle([accelSeg(100, 5, 0, 1, "decel")]));
    close(r.rmsTorqueNm, T, 1e-4);
    const reversed = Math.abs((-100 * G * Math.sin(theta) + 100 * a) * 0.1);
    assert.ok(Math.abs(r.rmsTorqueNm - reversed) > 1, "decel must not flip gravity");
  });

  it("keeps hook gravity on a hoist hold", () => {
    const inputs = defaultInputs("crane");
    inputs.payloadKg = 1000;
    inputs.counterweightKg = 0;
    inputs.drumDiaM = 400;
    inputs.falls = 2;
    inputs.efficiency = 100;
    inputs.dutyType = "S1";
    inputs.edHour = 100;
    const T = ((1000 * G) / 2) * 0.2;
    const r = calculateSizing("crane", inputs, cycle([holdSeg(1000, 0)]));
    close(r.rmsTorqueNm, T, 1e-3);
  });
});

describe("rotary cycle payload", () => {
  it("scales payload inertia with per-step mass", () => {
    const inputs = defaultInputs("rotary-table");
    inputs.tableInertia = 10;
    inputs.payloadInertia = 5;
    inputs.payloadKg = 50;
    inputs.fricTorqueNm = 0;
    inputs.unbalanceNm = 0;
    inputs.efficiency = 100;
    inputs.speedRpm = 30;
    inputs.accelTimeS = 1;
    inputs.dutyType = "S1";
    inputs.edHour = 100;
    const omega = (30 * 2 * Math.PI) / 60;
    const alpha = omega;
    const loaded: CycleSegment = {
      id: "a",
      inclineDir: "accel",
      accelLaw: "linear",
      vStart: 0,
      vEnd: omega,
      accel: alpha,
      time: 1,
      distanceMm: (omega / 2) * 1000,
      positionMm: (omega / 2) * 1000,
      payloadKg: 100,
    };
    const r = calculateSizing("rotary-table", inputs, { enabled: true, travelUnit: "deg", segments: [loaded] });
    const j = 10 + 5 * (100 / 50);
    close(r.loadInertiaKgm2, j, 1e-9);
    close(r.peakTorqueNm, j * alpha, 1e-6);
    close(r.rmsTorqueNm, j * alpha, 1e-6);
  });

  it("leaves table inertia when a step is empty", () => {
    const inputs = defaultInputs("rotary-table");
    inputs.tableInertia = 10;
    inputs.payloadInertia = 5;
    inputs.payloadKg = 50;
    inputs.fricTorqueNm = 0;
    inputs.unbalanceNm = 0;
    inputs.efficiency = 100;
    inputs.speedRpm = 30;
    inputs.accelTimeS = 1;
    inputs.dutyType = "S1";
    inputs.edHour = 100;
    const omega = (30 * 2 * Math.PI) / 60;
    const empty: CycleSegment = {
      id: "a",
      inclineDir: "accel",
      accelLaw: "linear",
      vStart: 0,
      vEnd: omega,
      accel: omega,
      time: 1,
      distanceMm: (omega / 2) * 1000,
      positionMm: (omega / 2) * 1000,
      payloadKg: 0,
    };
    const loaded: CycleSegment = { ...empty, id: "b", payloadKg: 50 };
    const r = calculateSizing("rotary-table", inputs, { enabled: true, travelUnit: "deg", segments: [empty, loaded] });
    close(r.loadInertiaKgm2, 15, 1e-9);
    close(r.peakTorqueNm, 15 * omega, 1e-6);
  });
});
