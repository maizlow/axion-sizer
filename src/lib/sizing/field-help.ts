/** Short field help. Keep each string under 250 characters. */
export const FIELD_HELP: Record<string, string> = {
  payloadKg:
    "Mass the drive must move: product, carriage, tooling. Not gearbox or motor. On a rotary table this is the mass that matches payload inertia; cycle steps scale J_payload by m_step / this mass.",
  beltMassKg:
    "Equivalent mass of belt plus idlers that translate with the product. Estimate belt length × linear density plus rotating idler mass referred to the belt.",
  rollerMassKg:
    "Sum of driven roller masses in the zone. Rolling inertia is referred to the belt line as m × (r²) / r² ≈ m for solid rollers; this field is that equivalent mass.",
  hookSpeedMps: "Hook speed in metres per minute. 8 means 8 m/min, not 8 m/s. Hidden when the travel table is on.",
  lineSpeedMps: "Cable speed in metres per minute at the drum. Hidden when the travel table is on.",
  speedMps:
    "Steady running speed in the unit shown on the field. Used only when the travel table is off. Peak speed then comes from the table instead.",
  speedRpm:
    "Shaft or table speed in revolutions per minute. Process machines use this as the continuous speed. Rotary tables hide it when the travel table is on.",
  pulleyDiaM: "Pitch diameter of the drive pulley in millimetres. Torque T = F × d/2. Do not use outside diameter of a toothed pulley.",
  rollerDiaM: "Outer diameter of the driven rollers in millimetres. Converts belt force to shaft torque: T = F × d/2.",
  drumDiaM: "Pitch or mean winding diameter in millimetres. Line force becomes drum torque through this radius, times falls on a hoist.",
  pinionDiaM: "Pinion pitch-circle diameter in millimetres, not tip diameter. T = F × d/2 at the mesh.",
  leadM: "Travel per screw revolution in millimetres. T = F × lead / (2π η). Smaller lead gives more force, less speed.",
  inclineDeg:
    "Degrees above horizontal. Gravity component is m g sinθ; normal force for friction is m g cosθ. 0 is flat, 90 is a vertical lift.",
  mu: "Dimensionless drag. Sliding μ or roller equivalent c, depending on the machine. Use the list icon for typical pairs. Dirty or wet surfaces run higher.",
  accelTimeS:
    "Seconds from standstill to the speed field. Peak accel a = v / t. Hidden when the travel table is on — each step has its own time.",
  efficiency:
    "Percent of mechanical path after the catalog gearbox: screw, belt, rack, drum, couplings. 100 if this drive is the only reduction.",
  extraRatio:
    "Gearing after the catalog gearbox (sprockets, belt, extra stage). Driven / drive teeth. 1 means the gearbox output is the load shaft.",
  extraEta: "Efficiency of that extra stage, percent. Used only when additional i is not 1. Chain typically 96–98%.",
  edHour:
    "Minutes this motion profile runs per hour. 40% = 24 min/h, IEC S3-40. 100% = the cycle repeats all hour (S1). Peak torque is unchanged; only the motor S1 check uses T_rms·√ED.",
  dutyCycle:
    "Running time as a percent of the full cycle. Feeds RMS torque. Hidden when the travel table is on; then duty is computed from the steps.",
  safetyFactor:
    "Multiplier on required torque before matching. Typical 1.3–1.5 for servo axes, 1.5–1.7 for lifts. Does not replace a design code.",
  falls:
    "Count of rope parts supporting the hook. Drum speed and line load scale with falls. 1 is a single-fall winch; 4 is a common hoist.",
  counterweightKg:
    "Balance mass. Gravity uses (payload − counterweight); inertia uses (payload + counterweight). 0 if the axis is uncompensated.",
  preloadN: "Constant drag from seals, wipers or screw preload, in newtons. Added to friction, independent of gravity.",
  tableInertia:
    "kg·m² of table and fixture about the rotation axis. Solid disk ≈ ½ m r². Use the CAD inertia about this axis if you have it.",
  payloadInertia:
    "kg·m² of parts about the same axis. Point mass at radius r is m r². Leave 0 if payload is already inside the table figure.",
  fricTorqueNm: "Bearing, seal and worm-preload drag at the table shaft, in N·m. Often 5–20 N·m on a mid-size indexer.",
  unbalanceNm:
    "Gravity torque from an offset mass: m g e, with e the centre-of-mass distance from the axis. 0 if the table is balanced.",
  density: "Fluid density in kg/m³. Water is 1000, oils ~850–950, slurries higher. Enters mixer and pump power.",
  impellerDiaM: "Primary impeller diameter in millimetres. Mixer power scales with D⁵.",
  powerNumber: "Dimensionless Np from the impeller curve. Rushton disc ~5–6, pitched blade ~1.3, hydrofoil ~0.3–0.8.",
  serviceFactor: "Extra on process torque for start-up in a settled tank or non-Newtonian fluid. 1.1–1.3 is common.",
  pressurePa: "Fan or pump differential pressure in the unit shown. Converts with flow to fluid power.",
  flowM3s: "Volumetric flow in the unit shown. Fluid power ≈ Δp × Q.",
  headM: "Pump head in metres of fluid. Pressure ≈ ρ g H.",
  dutyType:
    "IEC 60034-1 thermal duty. S1 = run all day. S3 = start–run–rest, no electric brake. S5 = same cycle but the drive brakes electrically (resistor or regen) — extra heat in the motor. A holding/parking brake on the shaft is separate.",
  orientation:
    "How the axis sits. Vertical puts full gravity on raise, lower and hold. Inclined uses the angle field. Horizontal ignores lift gravity.",
  mechanism: "How force becomes shaft torque on a lift: screw lead, belt pulley radius, or rack pinion radius.",
};

export const CYCLE_HELP: Record<string, string> = {
  inclineDir:
    "Which part of the move this column is. Acceleration, deceleration, or hold/cruise (constant speed or standstill). Slope of the machine is the incline field.",
  accelLaw:
    "How speed changes inside the step. Linear is v = at. sin² is smoother. Jerk-limited caps the rate of change of acceleration.",
  vStart: "Speed at the start of this step, in the table unit. Must match the previous step’s end speed.",
  vEnd: "Speed at the end of this step, in the table unit. 0 is a stop.",
  accel: "Average acceleration in the table unit per second squared. a = (v_end − v_start) / t.",
  time: "Duration of this step in seconds. Changing time recalculates acceleration and distance.",
  distanceMm: "Travel in this step, in the table unit (m, mm or deg). s = v_avg × t.",
  payloadKg:
    "Kilograms on this step. 0 is empty. Rotary tables scale payload inertia by this mass over the form payload mass.",
  positionMm: "Axis position at the end of this step, same unit, from the start of the cycle.",
};

export function helpFor(key: string): string | undefined {
  return FIELD_HELP[key] ?? CYCLE_HELP[key];
}
