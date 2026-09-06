# Axion

Axion is a first-pass drive sizer for industrial motion. You pick the machine type, enter masses, geometry and a travel cycle, and it computes force, torque, speed and inertia at the load shaft. It then ranks a small set of **CM3C / CM3P** servomotors and matching gear units so you have a starting type code — not a purchase order.

It is **not** affiliated with SEW-EURODRIVE and is **not** a substitute for [SEW Workbench](https://www.sew-eurodrive.com/software-and-engineering/engineering-software/movisuite-and-workbench) or the [official catalogs](https://www.sew-eurodrive.com/products/motors/servomotors).

## What it does

1. Choose an application. Physics change with the machine: conveyor, crane / hoist, vertical lift, ball screw, rotary table, winch, mixer, fan, pump, gantry, rack & pinion.
2. Fill SI inputs (mass, stroke, speed, friction, efficiency, safety factor). Field glyphs show what each quantity is.
3. Optional motion cycle: each column is a segment (inclination, acceleration law, start / end velocity, accel, time, distance, position). Peak and RMS torque use that profile when enabled.
4. Results show raise / lower / hold when gravity acts, plus a ranked list of motor + gearbox pairs that pass a flange / speed / torque screen.

## Applications

| Application | What the model uses |
|---|---|
| Conveyor | Belt / load mass, incline, friction, pulley diameter, accel |
| Crane / hoist / lift | Payload, counterweight, drum, raise vs lower vs hold |
| Ball screw | Pitch, efficiency, reflected inertia, table mass |
| Rotary table | Inertia, angular accel, friction torque |
| Winch | Line pull, drum, wrapping |
| Mixer / fan / pump | Process torque or flow-style load |
| Gantry / rack & pinion | Linear mass, pinion radius, rack friction |

## Motion cycle

Each segment can set:

- Direction of inclination (uphill / downhill / level)
- Acceleration law (linear / sin² / jerk-limited)
- Start and end velocity in m/s
- Acceleration in m/s²
- Time in s
- Distance and cumulative position in mm

Kinematics stay consistent: changing time or velocities recomputes distance; gravity sign follows incline.

## Catalog used for matching

The built-in table is a **representative calculation set**, not a licensed or complete catalog.

- CM3C / CM3P standstill torque, peak torque, speed class, inertia
- PS.F / PS.C published integer ratio lists
- PxG, R and K **preferred-ratio ladders** — not every catalog iN
- Pairing is frame + n1 max + output torque class. It does not check shaft, brake, encoder, ambient or thermal duty.

Always confirm the type code in official PDFs / Workbench:

- [Servomotors](https://www.sew-eurodrive.com/products/motors/servomotors)
- [Gear units](https://www.sew-eurodrive.com/products/gear-units)
- [Workbench / MOVISUITE](https://www.sew-eurodrive.com/software-and-engineering/engineering-software/movisuite-and-workbench)

## Limits

- SI units only
- No S1–S8 thermal model, no ambient derating, no bearing-life check
- Compatibility is a heuristic, not the manufacturer mounting matrix
- Do not treat a green match as an approved order

## License

Application code in this repository is for the project owner. SEW-EURODRIVE names, type codes and catalog figures remain their property and are used only as an unofficial preliminary reference.
