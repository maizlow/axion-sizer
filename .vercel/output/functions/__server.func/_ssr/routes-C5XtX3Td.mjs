import { i as __toESM } from "../_runtime.mjs";
import { L as require_react, v as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { a as RotateCw, c as Layers, d as Cog, f as Check, i as Sailboat, l as Gauge, m as ArrowUpDown, n as Truck, o as RotateCcw, p as Boxes, r as TriangleAlert, s as MoveHorizontal, t as Wind, u as Fan } from "../_libs/lucide-react.mjs";
import { n as clsx, t as cva } from "../_libs/class-variance-authority+clsx.mjs";
import { t as twMerge } from "../_libs/tailwind-merge.mjs";
import { t as create } from "../_libs/zustand.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-C5XtX3Td.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var APPLICATIONS = [
	{
		id: "conveyor",
		name: "Belt conveyor",
		short: "Belt",
		group: "linear",
		description: "Horizontal or inclined belt conveying bulk or unit loads. Sizes the drive pulley from belt pull, speed and acceleration.",
		fields: [
			{
				key: "payloadKg",
				label: "Payload on belt",
				unitMetric: "kg",
				unitImperial: "lb",
				metricToSi: 1,
				imperialToSi: .453592,
				defaultValue: 800,
				min: 1,
				max: 5e4,
				step: 10,
				hint: "Total moving mass on the carrying side, including product."
			},
			{
				key: "beltMassKg",
				label: "Belt + idler equivalent mass",
				unitMetric: "kg",
				unitImperial: "lb",
				metricToSi: 1,
				imperialToSi: .453592,
				defaultValue: 220,
				min: 0,
				max: 2e4,
				step: 5,
				hint: "Rotating parts reflected as equivalent translating mass."
			},
			{
				key: "speedMps",
				label: "Belt speed",
				unitMetric: "m/s",
				unitImperial: "ft/min",
				metricToSi: 1,
				imperialToSi: .00508,
				defaultValue: .6,
				min: .01,
				max: 8,
				step: .05,
				hint: "Steady-state conveying speed."
			},
			{
				key: "pulleyDiaM",
				label: "Drive pulley diameter",
				unitMetric: "mm",
				unitImperial: "in",
				metricToSi: .001,
				imperialToSi: .0254,
				defaultValue: 220,
				min: 40,
				max: 2e3,
				step: 5,
				hint: "Pitch diameter of the drive drum or pulley."
			},
			{
				key: "inclineDeg",
				label: "Incline",
				unitMetric: "deg",
				unitImperial: "deg",
				metricToSi: 1,
				imperialToSi: 1,
				defaultValue: 8,
				min: 0,
				max: 30,
				step: .5,
				hint: "Positive uphill in the conveying direction."
			},
			{
				key: "mu",
				label: "Equivalent friction μ",
				unitMetric: "—",
				unitImperial: "—",
				metricToSi: 1,
				imperialToSi: 1,
				defaultValue: .12,
				min: .02,
				max: .6,
				step: .01,
				hint: "Lumped idler, belt and skirt friction. 0.08–0.15 typical for roller beds."
			},
			{
				key: "accelTimeS",
				label: "Acceleration time",
				unitMetric: "s",
				unitImperial: "s",
				metricToSi: 1,
				imperialToSi: 1,
				defaultValue: 1.5,
				min: .1,
				max: 30,
				step: .1,
				hint: "Time to reach belt speed from standstill."
			},
			{
				key: "efficiency",
				label: "Drive efficiency",
				unitMetric: "%",
				unitImperial: "%",
				metricToSi: .01,
				imperialToSi: .01,
				defaultValue: 92,
				min: 40,
				max: 99,
				step: 1,
				hint: "Pulley wrap, couplings and any existing reduction."
			},
			{
				key: "dutyCycle",
				label: "Duty cycle",
				unitMetric: "%",
				unitImperial: "%",
				metricToSi: .01,
				imperialToSi: .01,
				defaultValue: 80,
				min: 5,
				max: 100,
				step: 5,
				hint: "Running time as a fraction of the cycle."
			},
			{
				key: "safetyFactor",
				label: "Safety factor",
				unitMetric: "—",
				unitImperial: "—",
				metricToSi: 1,
				imperialToSi: 1,
				defaultValue: 1.4,
				min: 1,
				max: 3,
				step: .05,
				hint: "Covers start-up, wear and unmodelled drag."
			}
		],
		selects: [{
			key: "dutyType",
			label: "IEC duty",
			defaultValue: "S1",
			hint: "S1 continuous, S3 intermittent, S5 intermittent with electric braking.",
			options: [
				{
					value: "S1",
					label: "S1 — continuous"
				},
				{
					value: "S3",
					label: "S3 — intermittent"
				},
				{
					value: "S5",
					label: "S5 — intermittent + braking"
				}
			]
		}]
	},
	{
		id: "roller-conveyor",
		name: "Driven roller conveyor",
		short: "Rollers",
		group: "linear",
		description: "Line-shaft or motorized-roller beds. Pull is dominated by rolling resistance and acceleration of product plus rollers.",
		fields: [
			{
				key: "payloadKg",
				label: "Product mass",
				unitMetric: "kg",
				unitImperial: "lb",
				metricToSi: 1,
				imperialToSi: .453592,
				defaultValue: 450,
				min: 1,
				max: 2e4,
				step: 5,
				hint: "Maximum simultaneous product on the driven zone."
			},
			{
				key: "rollerMassKg",
				label: "Driven roller mass",
				unitMetric: "kg",
				unitImperial: "lb",
				metricToSi: 1,
				imperialToSi: .453592,
				defaultValue: 80,
				min: 0,
				max: 5e3,
				step: 1,
				hint: "Sum of rotating roller masses in the zone."
			},
			{
				key: "speedMps",
				label: "Transport speed",
				unitMetric: "m/s",
				unitImperial: "ft/min",
				metricToSi: 1,
				imperialToSi: .00508,
				defaultValue: .45,
				min: .01,
				max: 4,
				step: .05,
				hint: "Linear speed of the package."
			},
			{
				key: "rollerDiaM",
				label: "Roller diameter",
				unitMetric: "mm",
				unitImperial: "in",
				metricToSi: .001,
				imperialToSi: .0254,
				defaultValue: 50,
				min: 20,
				max: 200,
				step: 1,
				hint: "Outer diameter of the driven rollers."
			},
			{
				key: "mu",
				label: "Rolling resistance c",
				unitMetric: "—",
				unitImperial: "—",
				metricToSi: 1,
				imperialToSi: 1,
				defaultValue: .03,
				min: .005,
				max: .2,
				step: .005,
				hint: "0.02–0.04 for clean steel rollers on cartons."
			},
			{
				key: "accelTimeS",
				label: "Acceleration time",
				unitMetric: "s",
				unitImperial: "s",
				metricToSi: 1,
				imperialToSi: 1,
				defaultValue: .6,
				min: .1,
				max: 10,
				step: .1,
				hint: "Zone start time."
			},
			{
				key: "efficiency",
				label: "Drive efficiency",
				unitMetric: "%",
				unitImperial: "%",
				metricToSi: .01,
				imperialToSi: .01,
				defaultValue: 88,
				min: 40,
				max: 99,
				step: 1,
				hint: "Poly-V, line-shaft or MDR gearbox efficiency."
			},
			{
				key: "dutyCycle",
				label: "Duty cycle",
				unitMetric: "%",
				unitImperial: "%",
				metricToSi: .01,
				imperialToSi: .01,
				defaultValue: 55,
				min: 5,
				max: 100,
				step: 5,
				hint: "Accumulation lines often sit well below 100%."
			},
			{
				key: "safetyFactor",
				label: "Safety factor",
				unitMetric: "—",
				unitImperial: "—",
				metricToSi: 1,
				imperialToSi: 1,
				defaultValue: 1.5,
				min: 1,
				max: 3,
				step: .05,
				hint: "Covers dirty rollers and misaligned packages."
			}
		],
		selects: [{
			key: "dutyType",
			label: "IEC duty",
			defaultValue: "S3",
			hint: "Indexed zones are usually S3.",
			options: [
				{
					value: "S1",
					label: "S1 — continuous"
				},
				{
					value: "S3",
					label: "S3 — intermittent"
				},
				{
					value: "S5",
					label: "S5 — intermittent + braking"
				}
			]
		}]
	},
	{
		id: "crane",
		name: "Crane / hoist",
		short: "Hoist",
		group: "lifting",
		description: "Wire-rope or chain hoist. Torque at the drum accounts for reeving, hook speed and gravity plus acceleration.",
		fields: [
			{
				key: "payloadKg",
				label: "Hook load",
				unitMetric: "kg",
				unitImperial: "lb",
				metricToSi: 1,
				imperialToSi: .453592,
				defaultValue: 2e3,
				min: 10,
				max: 1e5,
				step: 10,
				hint: "Rated load at the hook."
			},
			{
				key: "hookSpeedMps",
				label: "Hook speed",
				unitMetric: "m/min",
				unitImperial: "ft/min",
				metricToSi: 1 / 60,
				imperialToSi: .00508,
				defaultValue: 8,
				min: .2,
				max: 60,
				step: .5,
				hint: "Steady hoist speed of the load."
			},
			{
				key: "drumDiaM",
				label: "Drum / sheave diameter",
				unitMetric: "mm",
				unitImperial: "in",
				metricToSi: .001,
				imperialToSi: .0254,
				defaultValue: 320,
				min: 50,
				max: 2e3,
				step: 5,
				hint: "Pitch diameter where the rope winds."
			},
			{
				key: "falls",
				label: "Number of falls",
				unitMetric: "—",
				unitImperial: "—",
				metricToSi: 1,
				imperialToSi: 1,
				defaultValue: 4,
				min: 1,
				max: 16,
				step: 1,
				hint: "Reeving parts supporting the load."
			},
			{
				key: "accelTimeS",
				label: "Acceleration time",
				unitMetric: "s",
				unitImperial: "s",
				metricToSi: 1,
				imperialToSi: 1,
				defaultValue: 1.2,
				min: .2,
				max: 10,
				step: .1,
				hint: "Time to rated hook speed."
			},
			{
				key: "efficiency",
				label: "Reeving + gearbox η",
				unitMetric: "%",
				unitImperial: "%",
				metricToSi: .01,
				imperialToSi: .01,
				defaultValue: 88,
				min: 40,
				max: 98,
				step: 1,
				hint: "Sheaves, drum and any existing reduction."
			},
			{
				key: "dutyCycle",
				label: "Duty cycle",
				unitMetric: "%",
				unitImperial: "%",
				metricToSi: .01,
				imperialToSi: .01,
				defaultValue: 40,
				min: 5,
				max: 100,
				step: 5,
				hint: "FEM / ISO hoist duty as running fraction."
			},
			{
				key: "safetyFactor",
				label: "Safety factor",
				unitMetric: "—",
				unitImperial: "—",
				metricToSi: 1,
				imperialToSi: 1,
				defaultValue: 1.6,
				min: 1.1,
				max: 3,
				step: .05,
				hint: "Lifting applications use a higher factor than conveyors."
			}
		],
		selects: [{
			key: "dutyType",
			label: "IEC duty",
			defaultValue: "S3",
			hint: "Most hoists are intermittent S3 or S5.",
			options: [
				{
					value: "S1",
					label: "S1 — continuous"
				},
				{
					value: "S3",
					label: "S3 — intermittent"
				},
				{
					value: "S5",
					label: "S5 — intermittent + braking"
				}
			]
		}]
	},
	{
		id: "winch",
		name: "Winch / capstan",
		short: "Winch",
		group: "lifting",
		description: "Single-layer drum or capstan pulling a cable. Same physics as a one-fall hoist, including holding torque.",
		fields: [
			{
				key: "payloadKg",
				label: "Line pull mass equivalent",
				unitMetric: "kg",
				unitImperial: "lb",
				metricToSi: 1,
				imperialToSi: .453592,
				defaultValue: 600,
				min: 5,
				max: 5e4,
				step: 5,
				hint: "F / g if you know line pull in newtons."
			},
			{
				key: "lineSpeedMps",
				label: "Line speed",
				unitMetric: "m/min",
				unitImperial: "ft/min",
				metricToSi: 1 / 60,
				imperialToSi: .00508,
				defaultValue: 12,
				min: .2,
				max: 80,
				step: .5,
				hint: "Cable speed at the drum."
			},
			{
				key: "drumDiaM",
				label: "Drum diameter",
				unitMetric: "mm",
				unitImperial: "in",
				metricToSi: .001,
				imperialToSi: .0254,
				defaultValue: 280,
				min: 40,
				max: 2e3,
				step: 5,
				hint: "Mean winding diameter."
			},
			{
				key: "accelTimeS",
				label: "Acceleration time",
				unitMetric: "s",
				unitImperial: "s",
				metricToSi: 1,
				imperialToSi: 1,
				defaultValue: 1,
				min: .2,
				max: 15,
				step: .1,
				hint: "Time to line speed."
			},
			{
				key: "efficiency",
				label: "Drive efficiency",
				unitMetric: "%",
				unitImperial: "%",
				metricToSi: .01,
				imperialToSi: .01,
				defaultValue: 90,
				min: 40,
				max: 98,
				step: 1,
				hint: "Drum bearings plus existing reduction."
			},
			{
				key: "dutyCycle",
				label: "Duty cycle",
				unitMetric: "%",
				unitImperial: "%",
				metricToSi: .01,
				imperialToSi: .01,
				defaultValue: 35,
				min: 5,
				max: 100,
				step: 5,
				hint: "Winches are rarely continuous."
			},
			{
				key: "safetyFactor",
				label: "Safety factor",
				unitMetric: "—",
				unitImperial: "—",
				metricToSi: 1,
				imperialToSi: 1,
				defaultValue: 1.7,
				min: 1.1,
				max: 3,
				step: .05,
				hint: "Includes snatch loads."
			}
		],
		selects: [{
			key: "dutyType",
			label: "IEC duty",
			defaultValue: "S3",
			hint: "Typical winch duty.",
			options: [
				{
					value: "S1",
					label: "S1 — continuous"
				},
				{
					value: "S3",
					label: "S3 — intermittent"
				},
				{
					value: "S5",
					label: "S5 — intermittent + braking"
				}
			]
		}]
	},
	{
		id: "ball-screw",
		name: "Ball screw / linear actuator",
		short: "Screw",
		group: "linear",
		description: "Converts rotary torque to axial force through screw lead. Handles horizontal, inclined and vertical axes.",
		fields: [
			{
				key: "payloadKg",
				label: "Moved mass",
				unitMetric: "kg",
				unitImperial: "lb",
				metricToSi: 1,
				imperialToSi: .453592,
				defaultValue: 180,
				min: .5,
				max: 1e4,
				step: 1,
				hint: "Carriage, tooling and workpiece."
			},
			{
				key: "speedMps",
				label: "Linear speed",
				unitMetric: "mm/s",
				unitImperial: "in/s",
				metricToSi: .001,
				imperialToSi: .0254,
				defaultValue: 250,
				min: 1,
				max: 2e3,
				step: 5,
				hint: "Rapid or process speed, whichever is higher for sizing."
			},
			{
				key: "leadM",
				label: "Screw lead",
				unitMetric: "mm/rev",
				unitImperial: "in/rev",
				metricToSi: .001,
				imperialToSi: .0254,
				defaultValue: 10,
				min: 1,
				max: 50,
				step: 1,
				hint: "Axial travel per revolution."
			},
			{
				key: "inclineDeg",
				label: "Axis incline",
				unitMetric: "deg",
				unitImperial: "deg",
				metricToSi: 1,
				imperialToSi: 1,
				defaultValue: 0,
				min: 0,
				max: 90,
				step: 1,
				hint: "0 horizontal, 90 vertical lift."
			},
			{
				key: "mu",
				label: "Guide friction μ",
				unitMetric: "—",
				unitImperial: "—",
				metricToSi: 1,
				imperialToSi: 1,
				defaultValue: .01,
				min: 0,
				max: .3,
				step: .005,
				hint: "Profile rail ~0.005–0.02; dove-tail much higher."
			},
			{
				key: "preloadN",
				label: "Seal / preload force",
				unitMetric: "N",
				unitImperial: "lbf",
				metricToSi: 1,
				imperialToSi: 4.44822,
				defaultValue: 40,
				min: 0,
				max: 5e3,
				step: 5,
				hint: "Wiper drag plus any intentional preload."
			},
			{
				key: "accelTimeS",
				label: "Acceleration time",
				unitMetric: "s",
				unitImperial: "s",
				metricToSi: 1,
				imperialToSi: 1,
				defaultValue: .25,
				min: .05,
				max: 5,
				step: .05,
				hint: "Time to linear speed."
			},
			{
				key: "efficiency",
				label: "Screw efficiency",
				unitMetric: "%",
				unitImperial: "%",
				metricToSi: .01,
				imperialToSi: .01,
				defaultValue: 90,
				min: 30,
				max: 98,
				step: 1,
				hint: "Ball screw ~90%, acme / trapezoidal ~30–50%."
			},
			{
				key: "dutyCycle",
				label: "Duty cycle",
				unitMetric: "%",
				unitImperial: "%",
				metricToSi: .01,
				imperialToSi: .01,
				defaultValue: 50,
				min: 5,
				max: 100,
				step: 5,
				hint: "Move time over cycle time."
			},
			{
				key: "safetyFactor",
				label: "Safety factor",
				unitMetric: "—",
				unitImperial: "—",
				metricToSi: 1,
				imperialToSi: 1,
				defaultValue: 1.35,
				min: 1,
				max: 3,
				step: .05,
				hint: "Servo axes often 1.3–1.5."
			}
		],
		selects: [{
			key: "dutyType",
			label: "IEC duty",
			defaultValue: "S5",
			hint: "Positioning axes with braking are S5.",
			options: [
				{
					value: "S1",
					label: "S1 — continuous"
				},
				{
					value: "S3",
					label: "S3 — intermittent"
				},
				{
					value: "S5",
					label: "S5 — intermittent + braking"
				}
			]
		}]
	},
	{
		id: "rack-pinion",
		name: "Rack and pinion",
		short: "Rack",
		group: "linear",
		description: "Gantry and long-travel axes. Torque is force times pinion pitch radius, with reflected linear inertia.",
		fields: [
			{
				key: "payloadKg",
				label: "Moved mass",
				unitMetric: "kg",
				unitImperial: "lb",
				metricToSi: 1,
				imperialToSi: .453592,
				defaultValue: 350,
				min: 1,
				max: 2e4,
				step: 5,
				hint: "Carriage plus payload."
			},
			{
				key: "speedMps",
				label: "Linear speed",
				unitMetric: "m/s",
				unitImperial: "ft/min",
				metricToSi: 1,
				imperialToSi: .00508,
				defaultValue: 1.2,
				min: .05,
				max: 6,
				step: .05,
				hint: "Rapid traverse."
			},
			{
				key: "pinionDiaM",
				label: "Pinion pitch diameter",
				unitMetric: "mm",
				unitImperial: "in",
				metricToSi: .001,
				imperialToSi: .0254,
				defaultValue: 80,
				min: 20,
				max: 400,
				step: 1,
				hint: "Pitch circle of the pinion."
			},
			{
				key: "mu",
				label: "Guide friction μ",
				unitMetric: "—",
				unitImperial: "—",
				metricToSi: 1,
				imperialToSi: 1,
				defaultValue: .015,
				min: 0,
				max: .3,
				step: .005,
				hint: "Linear guide friction."
			},
			{
				key: "inclineDeg",
				label: "Axis incline",
				unitMetric: "deg",
				unitImperial: "deg",
				metricToSi: 1,
				imperialToSi: 1,
				defaultValue: 0,
				min: 0,
				max: 90,
				step: 1,
				hint: "0 horizontal."
			},
			{
				key: "accelTimeS",
				label: "Acceleration time",
				unitMetric: "s",
				unitImperial: "s",
				metricToSi: 1,
				imperialToSi: 1,
				defaultValue: .4,
				min: .05,
				max: 8,
				step: .05,
				hint: "Time to traverse speed."
			},
			{
				key: "efficiency",
				label: "Mesh efficiency",
				unitMetric: "%",
				unitImperial: "%",
				metricToSi: .01,
				imperialToSi: .01,
				defaultValue: 95,
				min: 70,
				max: 99,
				step: 1,
				hint: "Straight or helical rack mesh."
			},
			{
				key: "dutyCycle",
				label: "Duty cycle",
				unitMetric: "%",
				unitImperial: "%",
				metricToSi: .01,
				imperialToSi: .01,
				defaultValue: 45,
				min: 5,
				max: 100,
				step: 5,
				hint: "Move time over cycle time."
			},
			{
				key: "safetyFactor",
				label: "Safety factor",
				unitMetric: "—",
				unitImperial: "—",
				metricToSi: 1,
				imperialToSi: 1,
				defaultValue: 1.4,
				min: 1,
				max: 3,
				step: .05,
				hint: "Covers rack contamination and mesh wear."
			}
		],
		selects: [{
			key: "dutyType",
			label: "IEC duty",
			defaultValue: "S5",
			hint: "Gantry axes are usually S5.",
			options: [
				{
					value: "S1",
					label: "S1 — continuous"
				},
				{
					value: "S3",
					label: "S3 — intermittent"
				},
				{
					value: "S5",
					label: "S5 — intermittent + braking"
				}
			]
		}]
	},
	{
		id: "gantry",
		name: "Gantry / cartesian axis",
		short: "Gantry",
		group: "linear",
		description: "Belt-driven linear module. Force at the belt from mass, friction and accel; torque from pulley radius.",
		fields: [
			{
				key: "payloadKg",
				label: "Moved mass",
				unitMetric: "kg",
				unitImperial: "lb",
				metricToSi: 1,
				imperialToSi: .453592,
				defaultValue: 55,
				min: .2,
				max: 2e3,
				step: 1,
				hint: "Carriage, end-effector and part."
			},
			{
				key: "speedMps",
				label: "Linear speed",
				unitMetric: "m/s",
				unitImperial: "ft/min",
				metricToSi: 1,
				imperialToSi: .00508,
				defaultValue: 2,
				min: .05,
				max: 10,
				step: .05,
				hint: "Peak traverse speed."
			},
			{
				key: "pulleyDiaM",
				label: "Drive pulley diameter",
				unitMetric: "mm",
				unitImperial: "in",
				metricToSi: .001,
				imperialToSi: .0254,
				defaultValue: 48,
				min: 16,
				max: 200,
				step: 1,
				hint: "Pitch diameter of the timing pulley."
			},
			{
				key: "mu",
				label: "Guide friction μ",
				unitMetric: "—",
				unitImperial: "—",
				metricToSi: 1,
				imperialToSi: 1,
				defaultValue: .012,
				min: 0,
				max: .2,
				step: .002,
				hint: "Rail + belt tooth friction lumped."
			},
			{
				key: "accelTimeS",
				label: "Acceleration time",
				unitMetric: "s",
				unitImperial: "s",
				metricToSi: 1,
				imperialToSi: 1,
				defaultValue: .2,
				min: .05,
				max: 4,
				step: .05,
				hint: "Aggressive pick-and-place ramps are 0.1–0.3 s."
			},
			{
				key: "efficiency",
				label: "Belt efficiency",
				unitMetric: "%",
				unitImperial: "%",
				metricToSi: .01,
				imperialToSi: .01,
				defaultValue: 95,
				min: 70,
				max: 99,
				step: 1,
				hint: "Timing belt typically 94–97%."
			},
			{
				key: "dutyCycle",
				label: "Duty cycle",
				unitMetric: "%",
				unitImperial: "%",
				metricToSi: .01,
				imperialToSi: .01,
				defaultValue: 60,
				min: 5,
				max: 100,
				step: 5,
				hint: "High-cycle machines approach 70%."
			},
			{
				key: "safetyFactor",
				label: "Safety factor",
				unitMetric: "—",
				unitImperial: "—",
				metricToSi: 1,
				imperialToSi: 1,
				defaultValue: 1.3,
				min: 1,
				max: 3,
				step: .05,
				hint: "Servo sizing commonly 1.25–1.4."
			}
		],
		selects: [{
			key: "dutyType",
			label: "IEC duty",
			defaultValue: "S5",
			hint: "Cyclic gantries are S5.",
			options: [
				{
					value: "S1",
					label: "S1 — continuous"
				},
				{
					value: "S3",
					label: "S3 — intermittent"
				},
				{
					value: "S5",
					label: "S5 — intermittent + braking"
				}
			]
		}]
	},
	{
		id: "rotary-table",
		name: "Rotary table / indexer",
		short: "Rotary",
		group: "rotary",
		description: "Indexing tables and turntables. Torque from reflected inertia and angular acceleration, plus friction and unbalance.",
		fields: [
			{
				key: "tableInertia",
				label: "Table + fixture inertia",
				unitMetric: "kg·m²",
				unitImperial: "lb·ft²",
				metricToSi: 1,
				imperialToSi: .0421401,
				defaultValue: 12,
				min: .01,
				max: 5e3,
				step: .1,
				hint: "J about the rotation axis. Use ½ m r² for a disk."
			},
			{
				key: "payloadInertia",
				label: "Payload inertia",
				unitMetric: "kg·m²",
				unitImperial: "lb·ft²",
				metricToSi: 1,
				imperialToSi: .0421401,
				defaultValue: 4,
				min: 0,
				max: 5e3,
				step: .1,
				hint: "Parts sitting on the table, about the same axis."
			},
			{
				key: "speedRpm",
				label: "Table speed",
				unitMetric: "rpm",
				unitImperial: "rpm",
				metricToSi: 1,
				imperialToSi: 1,
				defaultValue: 30,
				min: .2,
				max: 600,
				step: 1,
				hint: "Indexing or continuous rotation speed."
			},
			{
				key: "fricTorqueNm",
				label: "Friction / bearing torque",
				unitMetric: "N·m",
				unitImperial: "lbf·ft",
				metricToSi: 1,
				imperialToSi: 1.35582,
				defaultValue: 8,
				min: 0,
				max: 2e3,
				step: .5,
				hint: "Seal and bearing drag at the table."
			},
			{
				key: "unbalanceNm",
				label: "Unbalance / gravity torque",
				unitMetric: "N·m",
				unitImperial: "lbf·ft",
				metricToSi: 1,
				imperialToSi: 1.35582,
				defaultValue: 0,
				min: 0,
				max: 5e3,
				step: 1,
				hint: "m·g·e for an offset payload on a tilting axis."
			},
			{
				key: "accelTimeS",
				label: "Acceleration time",
				unitMetric: "s",
				unitImperial: "s",
				metricToSi: 1,
				imperialToSi: 1,
				defaultValue: .8,
				min: .05,
				max: 20,
				step: .05,
				hint: "Time to table speed."
			},
			{
				key: "efficiency",
				label: "Existing reduction η",
				unitMetric: "%",
				unitImperial: "%",
				metricToSi: .01,
				imperialToSi: .01,
				defaultValue: 95,
				min: 40,
				max: 99,
				step: 1,
				hint: "Set 100 if the catalog gearbox is the only reduction."
			},
			{
				key: "dutyCycle",
				label: "Duty cycle",
				unitMetric: "%",
				unitImperial: "%",
				metricToSi: .01,
				imperialToSi: .01,
				defaultValue: 40,
				min: 5,
				max: 100,
				step: 5,
				hint: "Index time over station time."
			},
			{
				key: "safetyFactor",
				label: "Safety factor",
				unitMetric: "—",
				unitImperial: "—",
				metricToSi: 1,
				imperialToSi: 1,
				defaultValue: 1.4,
				min: 1,
				max: 3,
				step: .05,
				hint: "Covers payload variation."
			}
		],
		selects: [{
			key: "dutyType",
			label: "IEC duty",
			defaultValue: "S5",
			hint: "Indexers are S3 or S5.",
			options: [
				{
					value: "S1",
					label: "S1 — continuous"
				},
				{
					value: "S3",
					label: "S3 — intermittent"
				},
				{
					value: "S5",
					label: "S5 — intermittent + braking"
				}
			]
		}]
	},
	{
		id: "mixer",
		name: "Mixer / agitator",
		short: "Mixer",
		group: "process",
		description: "Impeller power from the Newtonian power number. Torque follows from shaft speed once power is known.",
		fields: [
			{
				key: "density",
				label: "Fluid density",
				unitMetric: "kg/m³",
				unitImperial: "lb/ft³",
				metricToSi: 1,
				imperialToSi: 16.0185,
				defaultValue: 1e3,
				min: 50,
				max: 3e3,
				step: 10,
				hint: "Water is 1000 kg/m³. Slurries run higher."
			},
			{
				key: "impellerDiaM",
				label: "Impeller diameter",
				unitMetric: "mm",
				unitImperial: "in",
				metricToSi: .001,
				imperialToSi: .0254,
				defaultValue: 450,
				min: 50,
				max: 3e3,
				step: 5,
				hint: "D of the primary impeller."
			},
			{
				key: "speedRpm",
				label: "Shaft speed",
				unitMetric: "rpm",
				unitImperial: "rpm",
				metricToSi: 1,
				imperialToSi: 1,
				defaultValue: 90,
				min: 5,
				max: 1500,
				step: 5,
				hint: "Impeller rotational speed."
			},
			{
				key: "powerNumber",
				label: "Power number Np",
				unitMetric: "—",
				unitImperial: "—",
				metricToSi: 1,
				imperialToSi: 1,
				defaultValue: 5.5,
				min: .2,
				max: 12,
				step: .1,
				hint: "Rushton ~5–6, hydrofoil ~0.3–0.8, anchor high viscosity ~3–8."
			},
			{
				key: "serviceFactor",
				label: "Process factor",
				unitMetric: "—",
				unitImperial: "—",
				metricToSi: 1,
				imperialToSi: 1,
				defaultValue: 1.2,
				min: 1,
				max: 2.5,
				step: .05,
				hint: "Start-up in a settled tank, non-Newtonian fluids."
			},
			{
				key: "efficiency",
				label: "Drive efficiency",
				unitMetric: "%",
				unitImperial: "%",
				metricToSi: .01,
				imperialToSi: .01,
				defaultValue: 92,
				min: 50,
				max: 99,
				step: 1,
				hint: "Seal and existing reduction."
			},
			{
				key: "dutyCycle",
				label: "Duty cycle",
				unitMetric: "%",
				unitImperial: "%",
				metricToSi: .01,
				imperialToSi: .01,
				defaultValue: 100,
				min: 5,
				max: 100,
				step: 5,
				hint: "Batch mixers may sit below 100%."
			},
			{
				key: "safetyFactor",
				label: "Safety factor",
				unitMetric: "—",
				unitImperial: "—",
				metricToSi: 1,
				imperialToSi: 1,
				defaultValue: 1.25,
				min: 1,
				max: 3,
				step: .05,
				hint: "On top of the process factor."
			}
		],
		selects: [{
			key: "dutyType",
			label: "IEC duty",
			defaultValue: "S1",
			hint: "Most agitators run S1.",
			options: [
				{
					value: "S1",
					label: "S1 — continuous"
				},
				{
					value: "S3",
					label: "S3 — intermittent"
				},
				{
					value: "S5",
					label: "S5 — intermittent + braking"
				}
			]
		}]
	},
	{
		id: "fan",
		name: "Fan / blower",
		short: "Fan",
		group: "process",
		description: "Shaft power from volume flow and total pressure. Torque is power over rotational speed.",
		fields: [
			{
				key: "flowM3s",
				label: "Volume flow",
				unitMetric: "m³/h",
				unitImperial: "cfm",
				metricToSi: 1 / 3600,
				imperialToSi: 471947e-9,
				defaultValue: 8e3,
				min: 50,
				max: 2e5,
				step: 50,
				hint: "Inlet volume flow."
			},
			{
				key: "pressurePa",
				label: "Total pressure",
				unitMetric: "Pa",
				unitImperial: "inH2O",
				metricToSi: 1,
				imperialToSi: 249.089,
				defaultValue: 1200,
				min: 20,
				max: 2e4,
				step: 10,
				hint: "Fan static + dynamic pressure."
			},
			{
				key: "speedRpm",
				label: "Fan speed",
				unitMetric: "rpm",
				unitImperial: "rpm",
				metricToSi: 1,
				imperialToSi: 1,
				defaultValue: 1450,
				min: 200,
				max: 3600,
				step: 10,
				hint: "Impeller speed, not motor nameplate."
			},
			{
				key: "efficiency",
				label: "Fan total efficiency",
				unitMetric: "%",
				unitImperial: "%",
				metricToSi: .01,
				imperialToSi: .01,
				defaultValue: 68,
				min: 30,
				max: 90,
				step: 1,
				hint: "Aerodynamic efficiency of the impeller."
			},
			{
				key: "dutyCycle",
				label: "Duty cycle",
				unitMetric: "%",
				unitImperial: "%",
				metricToSi: .01,
				imperialToSi: .01,
				defaultValue: 100,
				min: 5,
				max: 100,
				step: 5,
				hint: "HVAC fans are typically S1."
			},
			{
				key: "safetyFactor",
				label: "Safety factor",
				unitMetric: "—",
				unitImperial: "—",
				metricToSi: 1,
				imperialToSi: 1,
				defaultValue: 1.15,
				min: 1,
				max: 2,
				step: .05,
				hint: "Covers filter loading and density variation."
			}
		],
		selects: [{
			key: "dutyType",
			label: "IEC duty",
			defaultValue: "S1",
			hint: "Continuous ventilation.",
			options: [
				{
					value: "S1",
					label: "S1 — continuous"
				},
				{
					value: "S3",
					label: "S3 — intermittent"
				},
				{
					value: "S5",
					label: "S5 — intermittent + braking"
				}
			]
		}]
	},
	{
		id: "pump",
		name: "Centrifugal pump",
		short: "Pump",
		group: "process",
		description: "Hydraulic power from flow, head and density. Shaft torque is hydraulic power over efficiency and speed.",
		fields: [
			{
				key: "flowM3s",
				label: "Flow",
				unitMetric: "m³/h",
				unitImperial: "gpm",
				metricToSi: 1 / 3600,
				imperialToSi: 630902e-10,
				defaultValue: 40,
				min: .2,
				max: 2e3,
				step: 1,
				hint: "Duty-point capacity."
			},
			{
				key: "headM",
				label: "Total head",
				unitMetric: "m",
				unitImperial: "ft",
				metricToSi: 1,
				imperialToSi: .3048,
				defaultValue: 28,
				min: .5,
				max: 300,
				step: .5,
				hint: "Differential head at the duty point."
			},
			{
				key: "density",
				label: "Fluid density",
				unitMetric: "kg/m³",
				unitImperial: "SG",
				metricToSi: 1,
				imperialToSi: 1e3,
				defaultValue: 1e3,
				min: 400,
				max: 2e3,
				step: 10,
				hint: "Water = 1000. Imperial field is specific gravity."
			},
			{
				key: "speedRpm",
				label: "Pump speed",
				unitMetric: "rpm",
				unitImperial: "rpm",
				metricToSi: 1,
				imperialToSi: 1,
				defaultValue: 1450,
				min: 200,
				max: 3600,
				step: 10,
				hint: "Impeller speed."
			},
			{
				key: "efficiency",
				label: "Pump efficiency",
				unitMetric: "%",
				unitImperial: "%",
				metricToSi: .01,
				imperialToSi: .01,
				defaultValue: 72,
				min: 30,
				max: 92,
				step: 1,
				hint: "Hydraulic efficiency at the duty point."
			},
			{
				key: "dutyCycle",
				label: "Duty cycle",
				unitMetric: "%",
				unitImperial: "%",
				metricToSi: .01,
				imperialToSi: .01,
				defaultValue: 100,
				min: 5,
				max: 100,
				step: 5,
				hint: "Process pumps are usually S1."
			},
			{
				key: "safetyFactor",
				label: "Safety factor",
				unitMetric: "—",
				unitImperial: "—",
				metricToSi: 1,
				imperialToSi: 1,
				defaultValue: 1.15,
				min: 1,
				max: 2,
				step: .05,
				hint: "ISO / HI often apply 1.1–1.15 on absorbed power."
			}
		],
		selects: [{
			key: "dutyType",
			label: "IEC duty",
			defaultValue: "S1",
			hint: "Continuous pumping.",
			options: [
				{
					value: "S1",
					label: "S1 — continuous"
				},
				{
					value: "S3",
					label: "S3 — intermittent"
				},
				{
					value: "S5",
					label: "S5 — intermittent + braking"
				}
			]
		}]
	}
];
function getApplication(id) {
	const found = APPLICATIONS.find((a) => a.id === id);
	if (!found) throw new Error(`Unknown application ${id}`);
	return found;
}
function defaultInputs(id) {
	const app = getApplication(id);
	const out = {};
	for (const f of app.fields) out[f.key] = f.defaultValue;
	for (const s of app.selects) out[s.key] = s.defaultValue;
	return out;
}
function cn(...inputs) {
	return twMerge(clsx(inputs));
}
var useSizingStore = create()((set, get) => ({
	applicationId: "conveyor",
	inputs: defaultInputs("conveyor"),
	units: "metric",
	motorKinds: ["servo", "induction"],
	gearboxKinds: [
		"planetary",
		"helical",
		"worm",
		"direct"
	],
	selectedMatchId: null,
	setApplication: (id) => set({
		applicationId: id,
		inputs: defaultInputs(id),
		selectedMatchId: null
	}),
	setInput: (key, value) => set({ inputs: {
		...get().inputs,
		[key]: value
	} }),
	setUnits: (u) => set({ units: u }),
	toggleMotorKind: (k) => {
		const cur = get().motorKinds;
		const next = cur.includes(k) ? cur.filter((x) => x !== k) : [...cur, k];
		set({ motorKinds: next.length ? next : cur });
	},
	toggleGearboxKind: (k) => {
		const cur = get().gearboxKinds;
		const next = cur.includes(k) ? cur.filter((x) => x !== k) : [...cur, k];
		set({ gearboxKinds: next.length ? next : cur });
	},
	setSelectedMatch: (id) => set({ selectedMatchId: id }),
	resetInputs: () => set({
		inputs: defaultInputs(get().applicationId),
		selectedMatchId: null
	})
}));
var ICONS = {
	conveyor: Layers,
	"roller-conveyor": Boxes,
	crane: ArrowUpDown,
	winch: Sailboat,
	"ball-screw": MoveHorizontal,
	"rack-pinion": Gauge,
	gantry: Truck,
	"rotary-table": RotateCw,
	mixer: Cog,
	fan: Wind,
	pump: Fan
};
var GROUPS = [
	{
		id: "linear",
		label: "Linear motion"
	},
	{
		id: "lifting",
		label: "Lifting"
	},
	{
		id: "rotary",
		label: "Rotary"
	},
	{
		id: "process",
		label: "Process"
	}
];
function ApplicationPicker() {
	const applicationId = useSizingStore((s) => s.applicationId);
	const setApplication = useSizingStore((s) => s.setApplication);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "flex flex-col gap-6",
		children: GROUPS.map((group) => {
			const items = APPLICATIONS.filter((a) => a.group === group.id);
			return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "mb-3 text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground",
				children: group.label
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "grid grid-cols-1 gap-2 sm:grid-cols-2",
				children: items.map((app) => {
					const Icon = ICONS[app.id];
					const active = app.id === applicationId;
					return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						onClick: () => setApplication(app.id),
						className: cn("flex min-h-11 items-start gap-3 rounded-[var(--radius-md)] border px-3 py-3 text-left transition-colors duration-[var(--motion-quick)] ease-[var(--ease-out)]", active ? "border-primary/40 bg-muted text-foreground" : "border-border bg-card text-foreground hover:border-primary/25 hover:bg-muted/60"),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: cn("mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-[var(--radius-xs)]", active ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"),
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, {
								className: "size-4",
								strokeWidth: 1.75
							})
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "min-w-0",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "block text-sm font-medium leading-snug",
								children: app.name
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "mt-0.5 block text-xs leading-relaxed text-muted-foreground",
								children: app.description
							})]
						})]
					}, app.id);
				})
			})] }, group.id);
		})
	});
}
var buttonVariants = cva("inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium transition-colors duration-[var(--motion-quick)] ease-[var(--ease-out)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-40", {
	variants: {
		variant: {
			default: "bg-primary text-primary-foreground hover:bg-primary/90",
			secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
			outline: "border border-border bg-transparent text-foreground hover:bg-muted",
			ghost: "text-muted-foreground hover:bg-muted hover:text-foreground",
			accent: "bg-accent text-accent-foreground hover:bg-accent/90"
		},
		size: {
			default: "h-10 rounded-[var(--radius-sm)] px-4 text-sm",
			sm: "h-8 rounded-[var(--radius-xs)] px-3 text-xs",
			lg: "h-11 rounded-[var(--radius-sm)] px-5 text-sm",
			icon: "size-10 rounded-[var(--radius-sm)]"
		}
	},
	defaultVariants: {
		variant: "default",
		size: "default"
	}
});
var Button = (0, import_react.forwardRef)(({ className, variant, size, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
	ref,
	className: cn(buttonVariants({
		variant,
		size
	}), className),
	...props
}));
Button.displayName = "Button";
var Input = (0, import_react.forwardRef)(({ className, type = "text", ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
	ref,
	type,
	className: cn("flex h-10 w-full rounded-[var(--radius-sm)] border border-border bg-input px-3 text-sm text-foreground tabular-nums", "placeholder:text-muted-foreground/70", "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring", "disabled:cursor-not-allowed disabled:opacity-50", className),
	...props
}));
Input.displayName = "Input";
function toDisplay(field, storedMetric, imperial) {
	if (!imperial) return storedMetric;
	return storedMetric * field.metricToSi / field.imperialToSi;
}
function fromDisplay(field, display, imperial) {
	if (!imperial) return display;
	return display * field.imperialToSi / field.metricToSi;
}
function InputPanel() {
	const applicationId = useSizingStore((s) => s.applicationId);
	const inputs = useSizingStore((s) => s.inputs);
	const units = useSizingStore((s) => s.units);
	const setInput = useSizingStore((s) => s.setInput);
	const resetInputs = useSizingStore((s) => s.resetInputs);
	const app = getApplication(applicationId);
	const imperial = units === "imperial";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex flex-col gap-5",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-start justify-between gap-3",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "text-base font-medium tracking-tight",
				children: app.name
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 text-sm text-muted-foreground",
				children: app.description
			})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
				variant: "ghost",
				size: "sm",
				onClick: resetInputs,
				className: "shrink-0",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RotateCcw, { className: "size-3.5" }), "Defaults"]
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "grid grid-cols-1 gap-4 sm:grid-cols-2",
			children: [app.fields.map((field) => {
				const unit = imperial ? field.unitImperial : field.unitMetric;
				const raw = inputs[field.key];
				const stored = typeof raw === "number" ? raw : Number(raw);
				const display = Number.isFinite(stored) ? toDisplay(field, stored, imperial) : "";
				const shown = display === "" ? "" : Math.abs(display) >= 100 ? Number(display.toFixed(2)) : Number(display.toFixed(4));
				return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
					className: "flex flex-col gap-1.5",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "flex items-baseline justify-between gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-xs font-medium text-foreground",
								children: field.label
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "font-mono text-[11px] text-muted-foreground",
								children: unit
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							type: "number",
							inputMode: "decimal",
							value: shown,
							onChange: (e) => {
								const v = e.target.value;
								if (v === "") {
									setInput(field.key, "");
									return;
								}
								const n = Number(v);
								if (Number.isFinite(n)) setInput(field.key, fromDisplay(field, n, imperial));
							}
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-[11px] leading-snug text-muted-foreground",
							children: field.hint
						})
					]
				}, field.key);
			}), app.selects.map((sel) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
				className: "flex flex-col gap-1.5",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-xs font-medium text-foreground",
						children: sel.label
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
						className: "h-10 rounded-[var(--radius-sm)] border border-border bg-input px-3 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
						value: String(inputs[sel.key] ?? sel.defaultValue),
						onChange: (e) => setInput(sel.key, e.target.value),
						children: sel.options.map((o) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
							value: o.value,
							children: o.label
						}, o.value))
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-[11px] leading-snug text-muted-foreground",
						children: sel.hint
					})
				]
			}, sel.key))]
		})]
	});
}
var G = 9.80665;
function num(inputs, key, fallback = 0) {
	const v = inputs[key];
	if (typeof v === "number" && Number.isFinite(v)) return v;
	if (typeof v === "string" && v !== "" && Number.isFinite(Number(v))) return Number(v);
	return fallback;
}
function toSi(appId, inputs, key) {
	const field = getApplication(appId).fields.find((f) => f.key === key);
	const raw = num(inputs, key, field?.defaultValue ?? 0);
	if (!field) return raw;
	return raw * field.metricToSi;
}
function rmsFromDuty(steady, peak, accelTime, speed, duty) {
	const period = Math.max(accelTime * 2 + 1, 2);
	const cruiseTime = Math.max(.2, period * duty - accelTime);
	const idle = Math.max(0, period - 2 * accelTime - cruiseTime);
	const sum = peak * peak * accelTime + steady * steady * cruiseTime + peak * peak * accelTime * .7 + 0 * idle;
	return Math.sqrt(sum / period);
}
function baseResult() {
	return {
		forceN: 0,
		outputTorqueNm: 0,
		peakTorqueNm: 0,
		rmsTorqueNm: 0,
		outputSpeedRpm: 0,
		outputPowerKw: 0,
		peakPowerKw: 0,
		loadInertiaKgm2: 0,
		accelRadS2: 0,
		accelTimeS: 1,
		dutyCycle: 1,
		safetyFactor: 1.3,
		formulas: [],
		warnings: [],
		notes: []
	};
}
function finish(r) {
	const omega = r.outputSpeedRpm * 2 * Math.PI / 60;
	r.outputPowerKw = r.outputTorqueNm * omega / 1e3;
	r.peakPowerKw = r.peakTorqueNm * omega / 1e3;
	if (r.outputTorqueNm <= 0 || r.outputSpeedRpm <= 0) r.warnings.push("Inputs produce a non-positive torque or speed. Check values.");
	if (r.safetyFactor < 1.2 && r.notes.every((n) => !n.includes("safety"))) r.notes.push("Safety factor is below 1.2 — unusual for industrial motion.");
	return r;
}
function sizeLinearBeltLike(appId, inputs, massKeys, speedKey, diaKey) {
	const r = baseResult();
	const m = toSi(appId, inputs, massKeys.payload) + toSi(appId, inputs, massKeys.extra);
	const v = toSi(appId, inputs, speedKey);
	const d = toSi(appId, inputs, diaKey);
	const theta = (appId === "conveyor" ? toSi(appId, inputs, "inclineDeg") : 0) * Math.PI / 180;
	const mu = toSi(appId, inputs, "mu");
	const tAcc = toSi(appId, inputs, "accelTimeS");
	const eta = Math.max(.2, toSi(appId, inputs, "efficiency"));
	const sf = toSi(appId, inputs, "safetyFactor");
	const duty = toSi(appId, inputs, "dutyCycle");
	const a = v / Math.max(tAcc, .05);
	const fGrav = m * G * Math.sin(theta);
	const fFric = mu * m * G * Math.cos(theta);
	const fAcc = m * a;
	const fSteady = fGrav + fFric;
	const fPeak = fSteady + fAcc;
	const radius = d / 2;
	r.forceN = fSteady;
	r.outputTorqueNm = fSteady * radius / eta;
	r.peakTorqueNm = fPeak * radius / eta;
	r.outputSpeedRpm = v > 0 && d > 0 ? v / (Math.PI * d) * 60 : 0;
	r.loadInertiaKgm2 = m * radius * radius;
	r.accelRadS2 = radius > 0 ? a / radius : 0;
	r.accelTimeS = tAcc;
	r.dutyCycle = duty;
	r.safetyFactor = sf;
	r.rmsTorqueNm = rmsFromDuty(r.outputTorqueNm, r.peakTorqueNm, tAcc, r.outputSpeedRpm, duty);
	r.formulas = [
		{
			name: "Moving mass",
			expression: "m = m_payload + m_equivalent",
			value: m,
			unit: "kg"
		},
		{
			name: "Acceleration",
			expression: "a = v / t_acc",
			value: a,
			unit: "m/s²"
		},
		{
			name: "Gravity component",
			expression: "F_g = m g sinθ",
			value: fGrav,
			unit: "N"
		},
		{
			name: "Friction",
			expression: "F_μ = μ m g cosθ",
			value: fFric,
			unit: "N"
		},
		{
			name: "Inertial force",
			expression: "F_a = m a",
			value: fAcc,
			unit: "N"
		},
		{
			name: "Steady belt pull",
			expression: "F = F_g + F_μ",
			value: fSteady,
			unit: "N"
		},
		{
			name: "Peak belt pull",
			expression: "F_pk = F + F_a",
			value: fPeak,
			unit: "N"
		},
		{
			name: "Steady torque",
			expression: "T = F · r / η",
			value: r.outputTorqueNm,
			unit: "N·m"
		},
		{
			name: "Peak torque",
			expression: "T_pk = F_pk · r / η",
			value: r.peakTorqueNm,
			unit: "N·m"
		},
		{
			name: "Pulley speed",
			expression: "n = v / (π D) · 60",
			value: r.outputSpeedRpm,
			unit: "rpm"
		},
		{
			name: "Reflected inertia",
			expression: "J = m r²",
			value: r.loadInertiaKgm2,
			unit: "kg·m²"
		},
		{
			name: "RMS torque",
			expression: "T_rms from duty cycle",
			value: r.rmsTorqueNm,
			unit: "N·m"
		}
	];
	if (theta > .3 && mu < .08) r.warnings.push("Incline with a low μ — check belt slip and take-up tension.");
	r.notes.push("Torque is at the drive pulley. Catalog gearboxes sit between motor and pulley.");
	return finish(r);
}
function sizeHoistLike(appId, inputs, massKey, speedKey, diaKey, fallsKey) {
	const r = baseResult();
	const m = toSi(appId, inputs, massKey);
	const v = toSi(appId, inputs, speedKey);
	const d = toSi(appId, inputs, diaKey);
	const falls = Math.max(1, fallsKey ? toSi(appId, inputs, fallsKey) : 1);
	const tAcc = toSi(appId, inputs, "accelTimeS");
	const eta = Math.max(.2, toSi(appId, inputs, "efficiency"));
	const sf = toSi(appId, inputs, "safetyFactor");
	const duty = toSi(appId, inputs, "dutyCycle");
	const a = v / Math.max(tAcc, .05);
	const radius = d / 2;
	const fSteady = m * G / falls;
	const fPeak = (m * G + m * a) / falls;
	const ropeSpeed = v * falls;
	r.forceN = m * G;
	r.outputTorqueNm = fSteady * radius / eta;
	r.peakTorqueNm = fPeak * radius / eta;
	r.outputSpeedRpm = d > 0 ? ropeSpeed / (Math.PI * d) * 60 : 0;
	r.loadInertiaKgm2 = m / (falls * falls) * radius * radius;
	r.accelRadS2 = radius > 0 ? a * falls / radius : 0;
	r.accelTimeS = tAcc;
	r.dutyCycle = duty;
	r.safetyFactor = sf;
	r.rmsTorqueNm = rmsFromDuty(r.outputTorqueNm, r.peakTorqueNm, tAcc, r.outputSpeedRpm, duty);
	r.formulas = [
		{
			name: "Hook / line force",
			expression: "F = m g",
			value: m * G,
			unit: "N"
		},
		{
			name: "Force at drum",
			expression: "F_d = (m g) / falls",
			value: fSteady,
			unit: "N"
		},
		{
			name: "Acceleration",
			expression: "a = v / t_acc",
			value: a,
			unit: "m/s²"
		},
		{
			name: "Steady drum torque",
			expression: "T = F_d · r / η",
			value: r.outputTorqueNm,
			unit: "N·m"
		},
		{
			name: "Peak drum torque",
			expression: "T_pk = ((m g + m a) / falls) · r / η",
			value: r.peakTorqueNm,
			unit: "N·m"
		},
		{
			name: "Drum speed",
			expression: "n = (v · falls) / (π D) · 60",
			value: r.outputSpeedRpm,
			unit: "rpm"
		},
		{
			name: "Reflected inertia",
			expression: "J = (m / falls²) r²",
			value: r.loadInertiaKgm2,
			unit: "kg·m²"
		},
		{
			name: "Holding torque",
			expression: "T_hold = T_steady (brake sizing)",
			value: r.outputTorqueNm,
			unit: "N·m"
		},
		{
			name: "RMS torque",
			expression: "T_rms from duty cycle",
			value: r.rmsTorqueNm,
			unit: "N·m"
		}
	];
	r.warnings.push("Specify a holding brake at least equal to steady torque plus safety factor.");
	if (falls >= 6) r.notes.push("High reeving reduces torque but raises drum speed and sheave losses.");
	return finish(r);
}
function sizeScrew(appId, inputs) {
	const r = baseResult();
	const m = toSi(appId, inputs, "payloadKg");
	const v = toSi(appId, inputs, "speedMps");
	const lead = toSi(appId, inputs, "leadM");
	const theta = toSi(appId, inputs, "inclineDeg") * Math.PI / 180;
	const mu = toSi(appId, inputs, "mu");
	const preload = toSi(appId, inputs, "preloadN");
	const tAcc = toSi(appId, inputs, "accelTimeS");
	const eta = Math.max(.2, toSi(appId, inputs, "efficiency"));
	const sf = toSi(appId, inputs, "safetyFactor");
	const duty = toSi(appId, inputs, "dutyCycle");
	const a = v / Math.max(tAcc, .05);
	const fGrav = m * G * Math.sin(theta);
	const fFric = mu * m * G * Math.cos(theta);
	const fAcc = m * a;
	const fSteady = fGrav + fFric + preload;
	const fPeak = fSteady + fAcc;
	r.forceN = fSteady;
	r.outputTorqueNm = fSteady * lead / (2 * Math.PI * eta);
	r.peakTorqueNm = fPeak * lead / (2 * Math.PI * eta);
	r.outputSpeedRpm = lead > 0 ? v / lead * 60 : 0;
	r.loadInertiaKgm2 = lead > 0 ? m * (lead / (2 * Math.PI)) ** 2 : 0;
	r.accelRadS2 = lead > 0 ? a * 2 * Math.PI / lead : 0;
	r.accelTimeS = tAcc;
	r.dutyCycle = duty;
	r.safetyFactor = sf;
	r.rmsTorqueNm = rmsFromDuty(r.outputTorqueNm, r.peakTorqueNm, tAcc, r.outputSpeedRpm, duty);
	r.formulas = [
		{
			name: "Axial force (steady)",
			expression: "F = m g sinθ + μ m g cosθ + F_pre",
			value: fSteady,
			unit: "N"
		},
		{
			name: "Peak axial force",
			expression: "F_pk = F + m a",
			value: fPeak,
			unit: "N"
		},
		{
			name: "Steady torque",
			expression: "T = F · lead / (2π η)",
			value: r.outputTorqueNm,
			unit: "N·m"
		},
		{
			name: "Peak torque",
			expression: "T_pk = F_pk · lead / (2π η)",
			value: r.peakTorqueNm,
			unit: "N·m"
		},
		{
			name: "Screw speed",
			expression: "n = v / lead · 60",
			value: r.outputSpeedRpm,
			unit: "rpm"
		},
		{
			name: "Reflected inertia",
			expression: "J = m (lead / 2π)²",
			value: r.loadInertiaKgm2,
			unit: "kg·m²"
		},
		{
			name: "RMS torque",
			expression: "T_rms from duty cycle",
			value: r.rmsTorqueNm,
			unit: "N·m"
		}
	];
	if (theta > 1.2 && eta < .5) r.warnings.push("Low-efficiency screw on a vertical axis may not be self-locking — check back-drive and brake.");
	if (eta >= .8 && theta > 1.2) r.warnings.push("Ball screws back-drive. Size a holding brake for the gravity torque.");
	return finish(r);
}
function sizeRackOrGantry(appId, inputs, diaKey, incline) {
	const r = baseResult();
	const m = toSi(appId, inputs, "payloadKg");
	const v = toSi(appId, inputs, "speedMps");
	const d = toSi(appId, inputs, diaKey);
	const theta = incline ? toSi(appId, inputs, "inclineDeg") * Math.PI / 180 : 0;
	const mu = toSi(appId, inputs, "mu");
	const tAcc = toSi(appId, inputs, "accelTimeS");
	const eta = Math.max(.2, toSi(appId, inputs, "efficiency"));
	const sf = toSi(appId, inputs, "safetyFactor");
	const duty = toSi(appId, inputs, "dutyCycle");
	const a = v / Math.max(tAcc, .05);
	const radius = d / 2;
	const fSteady = m * G * Math.sin(theta) + mu * m * G * Math.cos(theta);
	const fPeak = fSteady + m * a;
	r.forceN = fSteady;
	r.outputTorqueNm = fSteady * radius / eta;
	r.peakTorqueNm = fPeak * radius / eta;
	r.outputSpeedRpm = d > 0 ? v / (Math.PI * d) * 60 : 0;
	r.loadInertiaKgm2 = m * radius * radius;
	r.accelRadS2 = radius > 0 ? a / radius : 0;
	r.accelTimeS = tAcc;
	r.dutyCycle = duty;
	r.safetyFactor = sf;
	r.rmsTorqueNm = rmsFromDuty(r.outputTorqueNm, r.peakTorqueNm, tAcc, r.outputSpeedRpm, duty);
	r.formulas = [
		{
			name: "Steady force",
			expression: "F = m g sinθ + μ m g cosθ",
			value: fSteady,
			unit: "N"
		},
		{
			name: "Peak force",
			expression: "F_pk = F + m a",
			value: fPeak,
			unit: "N"
		},
		{
			name: "Steady torque",
			expression: "T = F · r / η",
			value: r.outputTorqueNm,
			unit: "N·m"
		},
		{
			name: "Peak torque",
			expression: "T_pk = F_pk · r / η",
			value: r.peakTorqueNm,
			unit: "N·m"
		},
		{
			name: "Pinion / pulley speed",
			expression: "n = v / (π D) · 60",
			value: r.outputSpeedRpm,
			unit: "rpm"
		},
		{
			name: "Reflected inertia",
			expression: "J = m r²",
			value: r.loadInertiaKgm2,
			unit: "kg·m²"
		},
		{
			name: "RMS torque",
			expression: "T_rms from duty cycle",
			value: r.rmsTorqueNm,
			unit: "N·m"
		}
	];
	return finish(r);
}
function sizeRotary(appId, inputs) {
	const r = baseResult();
	const jTable = toSi(appId, inputs, "tableInertia");
	const jPay = toSi(appId, inputs, "payloadInertia");
	const n = toSi(appId, inputs, "speedRpm");
	const tFric = toSi(appId, inputs, "fricTorqueNm");
	const tUnb = toSi(appId, inputs, "unbalanceNm");
	const tAcc = toSi(appId, inputs, "accelTimeS");
	const eta = Math.max(.2, toSi(appId, inputs, "efficiency"));
	const sf = toSi(appId, inputs, "safetyFactor");
	const duty = toSi(appId, inputs, "dutyCycle");
	const j = jTable + jPay;
	const omega = n * 2 * Math.PI / 60;
	const alpha = omega / Math.max(tAcc, .05);
	const tInert = j * alpha;
	const tSteady = (tFric + tUnb) / eta;
	const tPeak = (tInert + tFric + tUnb) / eta;
	r.forceN = 0;
	r.outputTorqueNm = tSteady;
	r.peakTorqueNm = tPeak;
	r.outputSpeedRpm = n;
	r.loadInertiaKgm2 = j;
	r.accelRadS2 = alpha;
	r.accelTimeS = tAcc;
	r.dutyCycle = duty;
	r.safetyFactor = sf;
	r.rmsTorqueNm = rmsFromDuty(tSteady, tPeak, tAcc, n, duty);
	r.formulas = [
		{
			name: "Total inertia",
			expression: "J = J_table + J_payload",
			value: j,
			unit: "kg·m²"
		},
		{
			name: "Angular rate",
			expression: "ω = n · 2π / 60",
			value: omega,
			unit: "rad/s"
		},
		{
			name: "Angular accel",
			expression: "α = ω / t_acc",
			value: alpha,
			unit: "rad/s²"
		},
		{
			name: "Inertial torque",
			expression: "T_j = J α",
			value: tInert,
			unit: "N·m"
		},
		{
			name: "Steady torque",
			expression: "T = (T_fric + T_unb) / η",
			value: tSteady,
			unit: "N·m"
		},
		{
			name: "Peak torque",
			expression: "T_pk = (T_j + T_fric + T_unb) / η",
			value: tPeak,
			unit: "N·m"
		},
		{
			name: "RMS torque",
			expression: "T_rms from duty cycle",
			value: r.rmsTorqueNm,
			unit: "N·m"
		}
	];
	if (tSteady < .05 * tPeak) r.notes.push("This axis is inertia-dominated. Peak torque and inertia ratio will drive the selection.");
	return finish(r);
}
function sizeMixer(appId, inputs) {
	const r = baseResult();
	const rho = toSi(appId, inputs, "density");
	const d = toSi(appId, inputs, "impellerDiaM");
	const nRpm = toSi(appId, inputs, "speedRpm");
	const np = toSi(appId, inputs, "powerNumber");
	const proc = toSi(appId, inputs, "serviceFactor");
	const eta = Math.max(.2, toSi(appId, inputs, "efficiency"));
	const sf = toSi(appId, inputs, "safetyFactor");
	const duty = toSi(appId, inputs, "dutyCycle");
	const n = nRpm / 60;
	const pHyd = np * rho * n ** 3 * d ** 5;
	const pShaft = pHyd * proc / eta;
	const omega = 2 * Math.PI * n;
	const t = omega > 0 ? pShaft / omega : 0;
	r.forceN = 0;
	r.outputTorqueNm = t;
	r.peakTorqueNm = t * 1.4;
	r.outputSpeedRpm = nRpm;
	r.loadInertiaKgm2 = .1 * rho * d ** 5;
	r.accelRadS2 = omega / 4;
	r.accelTimeS = 4;
	r.dutyCycle = duty;
	r.safetyFactor = sf;
	r.rmsTorqueNm = t * Math.sqrt(Math.max(duty, .2));
	r.formulas = [
		{
			name: "Rotational frequency",
			expression: "N = n / 60",
			value: n,
			unit: "1/s"
		},
		{
			name: "Hydraulic power",
			expression: "P = Np ρ N³ D⁵",
			value: pHyd,
			unit: "W"
		},
		{
			name: "Shaft power",
			expression: "P_shaft = P · k_process / η",
			value: pShaft,
			unit: "W"
		},
		{
			name: "Shaft torque",
			expression: "T = P_shaft / ω",
			value: t,
			unit: "N·m"
		},
		{
			name: "Start torque (est.)",
			expression: "T_pk ≈ 1.4 T",
			value: r.peakTorqueNm,
			unit: "N·m"
		}
	];
	r.notes.push("Power number assumes turbulent Newtonian flow. Viscous tanks need a Reynolds check.");
	return finish(r);
}
function sizeFan(appId, inputs) {
	const r = baseResult();
	const q = toSi(appId, inputs, "flowM3s");
	const dp = toSi(appId, inputs, "pressurePa");
	const nRpm = toSi(appId, inputs, "speedRpm");
	const eta = Math.max(.2, toSi(appId, inputs, "efficiency"));
	const sf = toSi(appId, inputs, "safetyFactor");
	const duty = toSi(appId, inputs, "dutyCycle");
	const pAir = q * dp;
	const pShaft = pAir / eta;
	const omega = nRpm * 2 * Math.PI / 60;
	const t = omega > 0 ? pShaft / omega : 0;
	r.outputTorqueNm = t;
	r.peakTorqueNm = t * 1.25;
	r.outputSpeedRpm = nRpm;
	r.loadInertiaKgm2 = 2.5;
	r.accelTimeS = 8;
	r.dutyCycle = duty;
	r.safetyFactor = sf;
	r.rmsTorqueNm = t * Math.sqrt(Math.max(duty, .5));
	r.formulas = [
		{
			name: "Air power",
			expression: "P = Q · Δp",
			value: pAir,
			unit: "W"
		},
		{
			name: "Shaft power",
			expression: "P_shaft = P / η",
			value: pShaft,
			unit: "W"
		},
		{
			name: "Shaft torque",
			expression: "T = P_shaft / ω",
			value: t,
			unit: "N·m"
		}
	];
	return finish(r);
}
function sizePump(appId, inputs) {
	const r = baseResult();
	const q = toSi(appId, inputs, "flowM3s");
	const h = toSi(appId, inputs, "headM");
	const rho = toSi(appId, inputs, "density");
	const nRpm = toSi(appId, inputs, "speedRpm");
	const eta = Math.max(.2, toSi(appId, inputs, "efficiency"));
	const sf = toSi(appId, inputs, "safetyFactor");
	const duty = toSi(appId, inputs, "dutyCycle");
	const pHyd = rho * G * q * h;
	const pShaft = pHyd / eta;
	const omega = nRpm * 2 * Math.PI / 60;
	const t = omega > 0 ? pShaft / omega : 0;
	r.outputTorqueNm = t;
	r.peakTorqueNm = t * 1.2;
	r.outputSpeedRpm = nRpm;
	r.loadInertiaKgm2 = 1.2;
	r.accelTimeS = 5;
	r.dutyCycle = duty;
	r.safetyFactor = sf;
	r.rmsTorqueNm = t * Math.sqrt(Math.max(duty, .5));
	r.formulas = [
		{
			name: "Hydraulic power",
			expression: "P = ρ g Q H",
			value: pHyd,
			unit: "W"
		},
		{
			name: "Shaft power",
			expression: "P_shaft = P / η",
			value: pShaft,
			unit: "W"
		},
		{
			name: "Shaft torque",
			expression: "T = P_shaft / ω",
			value: t,
			unit: "N·m"
		}
	];
	return finish(r);
}
function calculateSizing(appId, inputs) {
	switch (appId) {
		case "conveyor": return sizeLinearBeltLike(appId, inputs, {
			payload: "payloadKg",
			extra: "beltMassKg"
		}, "speedMps", "pulleyDiaM");
		case "roller-conveyor": return sizeLinearBeltLike(appId, inputs, {
			payload: "payloadKg",
			extra: "rollerMassKg"
		}, "speedMps", "rollerDiaM");
		case "crane": return sizeHoistLike(appId, inputs, "payloadKg", "hookSpeedMps", "drumDiaM", "falls");
		case "winch": return sizeHoistLike(appId, inputs, "payloadKg", "lineSpeedMps", "drumDiaM", null);
		case "ball-screw": return sizeScrew(appId, inputs);
		case "rack-pinion": return sizeRackOrGantry(appId, inputs, "pinionDiaM", true);
		case "gantry": return sizeRackOrGantry(appId, inputs, "pulleyDiaM", false);
		case "rotary-table": return sizeRotary(appId, inputs);
		case "mixer": return sizeMixer(appId, inputs);
		case "fan": return sizeFan(appId, inputs);
		case "pump": return sizePump(appId, inputs);
		default: return finish(baseResult());
	}
}
var MOTORS = [
	{
		id: "s-04",
		name: "Axion S-040",
		kind: "servo",
		ratedPowerKw: .4,
		ratedSpeedRpm: 3e3,
		contTorqueNm: 1.27,
		peakTorqueNm: 3.8,
		inertiaKgm2: 14e-5,
		voltageV: 400,
		frame: "40",
		massKg: 2.1,
		notes: "Compact servo for light gantries and small screws."
	},
	{
		id: "s-075",
		name: "Axion S-075",
		kind: "servo",
		ratedPowerKw: .75,
		ratedSpeedRpm: 3e3,
		contTorqueNm: 2.39,
		peakTorqueNm: 7.2,
		inertiaKgm2: 28e-5,
		voltageV: 400,
		frame: "60",
		massKg: 3.4,
		notes: "General-purpose small servo."
	},
	{
		id: "s-10",
		name: "Axion S-100",
		kind: "servo",
		ratedPowerKw: 1,
		ratedSpeedRpm: 3e3,
		contTorqueNm: 3.18,
		peakTorqueNm: 9.5,
		inertiaKgm2: 45e-5,
		voltageV: 400,
		frame: "60",
		massKg: 4.2,
		notes: "1 kW mid-inertia servo."
	},
	{
		id: "s-15",
		name: "Axion S-150",
		kind: "servo",
		ratedPowerKw: 1.5,
		ratedSpeedRpm: 3e3,
		contTorqueNm: 4.77,
		peakTorqueNm: 14.3,
		inertiaKgm2: 72e-5,
		voltageV: 400,
		frame: "80",
		massKg: 5.8,
		notes: "Workhorse 80-frame servo."
	},
	{
		id: "s-20",
		name: "Axion S-200",
		kind: "servo",
		ratedPowerKw: 2,
		ratedSpeedRpm: 3e3,
		contTorqueNm: 6.37,
		peakTorqueNm: 19.1,
		inertiaKgm2: .0011,
		voltageV: 400,
		frame: "80",
		massKg: 7.1,
		notes: "Higher inertia option in 80 frame."
	},
	{
		id: "s-30",
		name: "Axion S-300",
		kind: "servo",
		ratedPowerKw: 3,
		ratedSpeedRpm: 3e3,
		contTorqueNm: 9.55,
		peakTorqueNm: 28.6,
		inertiaKgm2: .0019,
		voltageV: 400,
		frame: "100",
		massKg: 10.4,
		notes: "100-frame servo for racks and tables."
	},
	{
		id: "s-50",
		name: "Axion S-500",
		kind: "servo",
		ratedPowerKw: 5,
		ratedSpeedRpm: 3e3,
		contTorqueNm: 15.9,
		peakTorqueNm: 47.7,
		inertiaKgm2: .0036,
		voltageV: 400,
		frame: "130",
		massKg: 16.8,
		notes: "High-dynamic 5 kW servo."
	},
	{
		id: "s-75",
		name: "Axion S-750",
		kind: "servo",
		ratedPowerKw: 7.5,
		ratedSpeedRpm: 2500,
		contTorqueNm: 28.6,
		peakTorqueNm: 86,
		inertiaKgm2: .0078,
		voltageV: 400,
		frame: "180",
		massKg: 28,
		notes: "Large servo for heavy indexers."
	},
	{
		id: "s-110",
		name: "Axion S-1100",
		kind: "servo",
		ratedPowerKw: 11,
		ratedSpeedRpm: 2e3,
		contTorqueNm: 52.5,
		peakTorqueNm: 158,
		inertiaKgm2: .016,
		voltageV: 400,
		frame: "220",
		massKg: 44,
		notes: "High-torque servo, 2000 rpm winding."
	},
	{
		id: "i-055",
		name: "Axion I-055",
		kind: "induction",
		ratedPowerKw: .55,
		ratedSpeedRpm: 1390,
		contTorqueNm: 3.78,
		peakTorqueNm: 9.5,
		inertiaKgm2: .0016,
		voltageV: 400,
		frame: "80",
		massKg: 9.5,
		notes: "IE3 4-pole, 50 Hz."
	},
	{
		id: "i-075",
		name: "Axion I-075",
		kind: "induction",
		ratedPowerKw: .75,
		ratedSpeedRpm: 1400,
		contTorqueNm: 5.12,
		peakTorqueNm: 12.8,
		inertiaKgm2: .0021,
		voltageV: 400,
		frame: "80",
		massKg: 11,
		notes: "IE3 4-pole."
	},
	{
		id: "i-11",
		name: "Axion I-110",
		kind: "induction",
		ratedPowerKw: 1.1,
		ratedSpeedRpm: 1410,
		contTorqueNm: 7.45,
		peakTorqueNm: 18.6,
		inertiaKgm2: .0032,
		voltageV: 400,
		frame: "90",
		massKg: 14,
		notes: "IE3 4-pole."
	},
	{
		id: "i-15",
		name: "Axion I-150",
		kind: "induction",
		ratedPowerKw: 1.5,
		ratedSpeedRpm: 1415,
		contTorqueNm: 10.1,
		peakTorqueNm: 25.3,
		inertiaKgm2: .0044,
		voltageV: 400,
		frame: "90",
		massKg: 17,
		notes: "IE3 4-pole."
	},
	{
		id: "i-22",
		name: "Axion I-220",
		kind: "induction",
		ratedPowerKw: 2.2,
		ratedSpeedRpm: 1425,
		contTorqueNm: 14.7,
		peakTorqueNm: 36.8,
		inertiaKgm2: .0071,
		voltageV: 400,
		frame: "100",
		massKg: 23,
		notes: "IE3 4-pole."
	},
	{
		id: "i-30",
		name: "Axion I-300",
		kind: "induction",
		ratedPowerKw: 3,
		ratedSpeedRpm: 1430,
		contTorqueNm: 20,
		peakTorqueNm: 50,
		inertiaKgm2: .011,
		voltageV: 400,
		frame: "100",
		massKg: 28,
		notes: "IE3 4-pole."
	},
	{
		id: "i-40",
		name: "Axion I-400",
		kind: "induction",
		ratedPowerKw: 4,
		ratedSpeedRpm: 1435,
		contTorqueNm: 26.6,
		peakTorqueNm: 66.5,
		inertiaKgm2: .015,
		voltageV: 400,
		frame: "112",
		massKg: 36,
		notes: "IE3 4-pole."
	},
	{
		id: "i-55",
		name: "Axion I-550",
		kind: "induction",
		ratedPowerKw: 5.5,
		ratedSpeedRpm: 1450,
		contTorqueNm: 36.2,
		peakTorqueNm: 90.5,
		inertiaKgm2: .024,
		voltageV: 400,
		frame: "132",
		massKg: 52,
		notes: "IE3 4-pole."
	},
	{
		id: "i-75",
		name: "Axion I-750",
		kind: "induction",
		ratedPowerKw: 7.5,
		ratedSpeedRpm: 1455,
		contTorqueNm: 49.2,
		peakTorqueNm: 123,
		inertiaKgm2: .034,
		voltageV: 400,
		frame: "132",
		massKg: 64,
		notes: "IE3 4-pole."
	},
	{
		id: "i-110",
		name: "Axion I-1100",
		kind: "induction",
		ratedPowerKw: 11,
		ratedSpeedRpm: 1460,
		contTorqueNm: 71.9,
		peakTorqueNm: 180,
		inertiaKgm2: .055,
		voltageV: 400,
		frame: "160",
		massKg: 94,
		notes: "IE3 4-pole."
	},
	{
		id: "i-150",
		name: "Axion I-1500",
		kind: "induction",
		ratedPowerKw: 15,
		ratedSpeedRpm: 1465,
		contTorqueNm: 97.7,
		peakTorqueNm: 244,
		inertiaKgm2: .078,
		voltageV: 400,
		frame: "160",
		massKg: 118,
		notes: "IE3 4-pole."
	},
	{
		id: "i-185",
		name: "Axion I-1850",
		kind: "induction",
		ratedPowerKw: 18.5,
		ratedSpeedRpm: 1470,
		contTorqueNm: 120,
		peakTorqueNm: 300,
		inertiaKgm2: .11,
		voltageV: 400,
		frame: "180",
		massKg: 155,
		notes: "IE3 4-pole."
	},
	{
		id: "i-220",
		name: "Axion I-2200",
		kind: "induction",
		ratedPowerKw: 22,
		ratedSpeedRpm: 1470,
		contTorqueNm: 143,
		peakTorqueNm: 357,
		inertiaKgm2: .14,
		voltageV: 400,
		frame: "180",
		massKg: 178,
		notes: "IE3 4-pole."
	},
	{
		id: "i-300",
		name: "Axion I-3000",
		kind: "induction",
		ratedPowerKw: 30,
		ratedSpeedRpm: 1475,
		contTorqueNm: 194,
		peakTorqueNm: 485,
		inertiaKgm2: .22,
		voltageV: 400,
		frame: "200",
		massKg: 230,
		notes: "IE3 4-pole for large conveyors and mixers."
	},
	{
		id: "st-23",
		name: "Axion ST-23",
		kind: "stepper",
		ratedPowerKw: .12,
		ratedSpeedRpm: 600,
		contTorqueNm: 1.8,
		peakTorqueNm: 2.4,
		inertiaKgm2: 28e-5,
		voltageV: 48,
		frame: "NEMA23",
		massKg: 1.1,
		notes: "Closed-loop stepper. Keep below 600 rpm at load."
	},
	{
		id: "st-34",
		name: "Axion ST-34",
		kind: "stepper",
		ratedPowerKw: .28,
		ratedSpeedRpm: 500,
		contTorqueNm: 5.2,
		peakTorqueNm: 7,
		inertiaKgm2: .0014,
		voltageV: 72,
		frame: "NEMA34",
		massKg: 3.6,
		notes: "Large stepper for light indexers."
	}
];
var PX_RATIOS = [
	3,
	5,
	8,
	10,
	16,
	20,
	25,
	40,
	50,
	70,
	100
];
var HX_RATIOS = [
	5.2,
	7.4,
	10.3,
	14.8,
	20.5,
	25.6,
	32.1,
	43.2,
	58.4,
	87.2
];
var WX_RATIOS = [
	10,
	15,
	20,
	30,
	40,
	50,
	60,
	80
];
var PX_SIZES = [{
	suffix: "",
	label: "PX",
	scale: 1,
	mass: 1
}, {
	suffix: "h",
	label: "PX-H",
	scale: 4.5,
	mass: 2.4
}];
var HX_SIZES = [{
	suffix: "",
	label: "HX",
	scale: 1,
	mass: 1
}, {
	suffix: "h",
	label: "HX-H",
	scale: 6,
	mass: 2.8
}];
var WX_SIZES = [{
	suffix: "",
	label: "WX",
	scale: 1,
	mass: 1
}, {
	suffix: "h",
	label: "WX-H",
	scale: 3.5,
	mass: 2.2
}];
function pxTorque(ratio) {
	return (ratio <= 10 ? 90 : ratio <= 25 ? 160 : 280) * Math.min(ratio / 4, 8);
}
function hxTorque(ratio) {
	return 220 * Math.min(ratio / 3.5, 18);
}
function wxTorque(ratio) {
	return 90 * Math.min(ratio / 4, 12);
}
function ratioLabel(ratio) {
	return Number.isInteger(ratio) ? String(ratio) : ratio.toFixed(1);
}
var GEARBOXES = [
	{
		id: "direct",
		name: "Direct drive",
		kind: "direct",
		ratio: 1,
		efficiency: 1,
		ratedOutputNm: 2e4,
		maxInputRpm: 6e3,
		inertiaKgm2: 0,
		backlashArcmin: 0,
		massKg: 0,
		family: "Direct"
	},
	...PX_SIZES.flatMap((size) => PX_RATIOS.map((ratio) => ({
		id: `px-${ratio}${size.suffix}`,
		name: `Axion ${size.label} ${ratioLabel(ratio)}:1`,
		kind: "planetary",
		ratio,
		efficiency: ratio <= 10 ? .97 : ratio <= 40 ? .94 : .9,
		ratedOutputNm: pxTorque(ratio) * size.scale,
		maxInputRpm: size.suffix ? 4500 : 6e3,
		inertiaKgm2: 8e-5 * Math.sqrt(ratio) * size.scale,
		backlashArcmin: ratio <= 10 ? 3 : 5,
		massKg: (2.4 + ratio * .08) * size.mass,
		family: `${size.label} planetary`
	}))),
	...HX_SIZES.flatMap((size) => HX_RATIOS.map((ratio) => ({
		id: `hx-${ratio}${size.suffix}`,
		name: `Axion ${size.label} ${ratioLabel(ratio)}:1`,
		kind: "helical",
		ratio,
		efficiency: .96,
		ratedOutputNm: hxTorque(ratio) * size.scale,
		maxInputRpm: 3600,
		inertiaKgm2: 35e-5 * Math.sqrt(ratio) * size.scale,
		backlashArcmin: 12,
		massKg: (8 + ratio * .35) * size.mass,
		family: `${size.label} helical`
	}))),
	...WX_SIZES.flatMap((size) => WX_RATIOS.map((ratio) => ({
		id: `wx-${ratio}${size.suffix}`,
		name: `Axion ${size.label} ${ratioLabel(ratio)}:1`,
		kind: "worm",
		ratio,
		efficiency: ratio <= 20 ? .82 : ratio <= 40 ? .72 : .58,
		ratedOutputNm: wxTorque(ratio) * size.scale,
		maxInputRpm: 1800,
		inertiaKgm2: 5e-4 * Math.sqrt(ratio) * size.scale,
		backlashArcmin: 20,
		massKg: (6 + ratio * .12) * size.mass,
		family: `${size.label} worm`
	})))
];
var INERTIA_LIMIT = {
	servo: 10,
	induction: 30,
	stepper: 5
};
function matchDrives(result, filters) {
	const needCont = result.rmsTorqueNm * result.safetyFactor;
	const needPeak = result.peakTorqueNm * result.safetyFactor;
	const needSpeed = result.outputSpeedRpm;
	const jLoad = result.loadInertiaKgm2;
	const motors = MOTORS.filter((m) => filters.motorKinds.includes(m.kind));
	const boxes = GEARBOXES.filter((g) => filters.gearboxKinds.includes(g.kind));
	const out = [];
	for (const motor of motors) for (const gb of boxes) {
		if (motor.ratedSpeedRpm > gb.maxInputRpm + 1) continue;
		const outSpeed = motor.ratedSpeedRpm / gb.ratio;
		const outCont = motor.contTorqueNm * gb.ratio * gb.efficiency;
		const outPeak = motor.peakTorqueNm * gb.ratio * gb.efficiency;
		const jRef = jLoad / (gb.ratio * gb.ratio) + gb.inertiaKgm2;
		const inertiaRatio = motor.inertiaKgm2 > 0 ? jRef / motor.inertiaKgm2 : 99;
		const speedOk = outSpeed >= needSpeed * .98;
		const torqueOk = outCont >= needCont && outPeak >= needPeak;
		const gbOk = gb.ratedOutputNm >= needPeak;
		const inertiaOk = inertiaRatio <= INERTIA_LIMIT[motor.kind] || gb.kind === "direct";
		const thermalOk = outCont >= needCont;
		if (!speedOk || !torqueOk || !gbOk) continue;
		const utilC = needCont / Math.max(outCont, 1e-6);
		const utilP = needPeak / Math.max(outPeak, 1e-6);
		const util = Math.max(utilC, utilP);
		let score = 100;
		score -= Math.abs(util - .68) * 80;
		if (util > .92) score -= 15;
		if (util < .25) score -= 20;
		if (!inertiaOk) score -= 18;
		if (motor.kind === "servo" && inertiaRatio > 7) score -= (inertiaRatio - 7) * 2;
		if (gb.kind === "worm" && gb.efficiency < .7) score -= 8;
		if (gb.kind === "direct" && needSpeed < motor.ratedSpeedRpm * .3) score -= 25;
		score -= motor.massKg * .04 + gb.massKg * .03;
		if (outSpeed > needSpeed * 2.8 && gb.kind !== "direct") score -= 10;
		if (gb.ratedOutputNm > needPeak * 4) score -= 12;
		const reasons = [];
		if (utilC > .9) reasons.push("Continuous utilization above 90%");
		if (utilP > .9) reasons.push("Peak utilization above 90%");
		if (!inertiaOk) reasons.push(`Inertia ratio ${inertiaRatio.toFixed(1)} is high for a ${motor.kind}`);
		if (gb.kind === "worm" && gb.efficiency < .7) reasons.push("Worm efficiency is low at this ratio");
		if (outSpeed > needSpeed * 2.2) reasons.push("Output speed has large headroom — a higher ratio may fit better");
		if (reasons.length === 0) reasons.push("Meets torque, speed and thermal checks");
		out.push({
			motor,
			gearbox: gb,
			outputContNm: outCont,
			outputPeakNm: outPeak,
			outputSpeedRpm: outSpeed,
			utilizationCont: utilC,
			utilizationPeak: utilP,
			inertiaRatio,
			thermalOk,
			speedOk,
			torqueOk,
			gbOk,
			inertiaOk,
			score,
			reasons
		});
	}
	out.sort((a, b) => b.score - a.score);
	return out.slice(0, 18);
}
function formatNm(n) {
	if (!Number.isFinite(n)) return "—";
	if (Math.abs(n) >= 100) return n.toFixed(0);
	if (Math.abs(n) >= 10) return n.toFixed(1);
	if (Math.abs(n) >= 1) return n.toFixed(2);
	return n.toFixed(3);
}
function formatKw(n) {
	if (!Number.isFinite(n)) return "—";
	if (n >= 10) return n.toFixed(1);
	return n.toFixed(2);
}
function formatRpm(n) {
	if (!Number.isFinite(n)) return "—";
	return n.toFixed(n >= 100 ? 0 : 1);
}
var MOTOR_OPTS = [
	{
		id: "servo",
		label: "Servo"
	},
	{
		id: "induction",
		label: "Induction"
	},
	{
		id: "stepper",
		label: "Stepper"
	}
];
var GB_OPTS = [
	{
		id: "planetary",
		label: "Planetary"
	},
	{
		id: "helical",
		label: "Helical"
	},
	{
		id: "worm",
		label: "Worm"
	},
	{
		id: "direct",
		label: "Direct"
	}
];
function UtilBar({ value, label }) {
	const pct = Math.min(140, Math.max(0, value * 100));
	const tone = value > 1 ? "bg-danger" : value > .9 ? "bg-warn" : "bg-ok";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mb-1 flex justify-between text-[11px] text-muted-foreground",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: label }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
			className: "font-mono tabular-nums text-foreground",
			children: [(value * 100).toFixed(0), "%"]
		})]
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "h-1.5 overflow-hidden rounded-full bg-muted",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: cn("h-full rounded-full", tone),
			style: { width: `${Math.min(pct, 100)}%` }
		})
	})] });
}
function Stat({ label, value, unit }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "rounded-[var(--radius-md)] border border-border bg-card px-3 py-3",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "text-[11px] uppercase tracking-[0.12em] text-muted-foreground",
			children: label
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mt-1 flex items-baseline gap-1.5",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "font-mono text-xl tabular-nums tracking-tight text-foreground",
				children: value
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "text-xs text-muted-foreground",
				children: unit
			})]
		})]
	});
}
function ResultsPanel() {
	const applicationId = useSizingStore((s) => s.applicationId);
	const inputs = useSizingStore((s) => s.inputs);
	const motorKinds = useSizingStore((s) => s.motorKinds);
	const gearboxKinds = useSizingStore((s) => s.gearboxKinds);
	const toggleMotorKind = useSizingStore((s) => s.toggleMotorKind);
	const toggleGearboxKind = useSizingStore((s) => s.toggleGearboxKind);
	const selectedMatchId = useSizingStore((s) => s.selectedMatchId);
	const setSelectedMatch = useSizingStore((s) => s.setSelectedMatch);
	const result = (0, import_react.useMemo)(() => calculateSizing(applicationId, inputs), [applicationId, inputs]);
	const matches = (0, import_react.useMemo)(() => matchDrives(result, {
		motorKinds,
		gearboxKinds
	}), [
		result,
		motorKinds,
		gearboxKinds
	]);
	const sizedCont = result.rmsTorqueNm * result.safetyFactor;
	const sizedPeak = result.peakTorqueNm * result.safetyFactor;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex flex-col gap-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "text-base font-medium tracking-tight",
				children: "Required at the load shaft"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 text-sm text-muted-foreground",
				children: "Values include the application model. The safety factor is applied when matching the catalog."
			})] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid grid-cols-2 gap-2 lg:grid-cols-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						label: "Steady torque",
						value: formatNm(result.outputTorqueNm),
						unit: "N·m"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						label: "Peak torque",
						value: formatNm(result.peakTorqueNm),
						unit: "N·m"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						label: "RMS torque",
						value: formatNm(result.rmsTorqueNm),
						unit: "N·m"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						label: "Speed",
						value: formatRpm(result.outputSpeedRpm),
						unit: "rpm"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						label: "Steady power",
						value: formatKw(result.outputPowerKw),
						unit: "kW"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						label: "Sized torque",
						value: formatNm(sizedCont),
						unit: "N·m rms·SF"
					})
				]
			}),
			(result.warnings.length > 0 || result.notes.length > 0) && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", {
				className: "flex flex-col gap-2",
				children: [result.warnings.map((w) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
					className: "flex gap-2 rounded-[var(--radius-sm)] border border-warn/30 bg-warn/10 px-3 py-2 text-sm text-foreground",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TriangleAlert, { className: "mt-0.5 size-4 shrink-0 text-warn" }), w]
				}, w)), result.notes.map((n) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
					className: "text-sm text-muted-foreground",
					children: n
				}, n))]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
					className: "mb-2 text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground",
					children: "Calculation"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "overflow-hidden rounded-[var(--radius-md)] border border-border",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
						className: "w-full text-left text-sm",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", {
							className: "bg-muted text-[11px] uppercase tracking-[0.1em] text-muted-foreground",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "px-3 py-2 font-medium",
									children: "Quantity"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "hidden px-3 py-2 font-medium sm:table-cell",
									children: "Expression"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "px-3 py-2 text-right font-medium",
									children: "Value"
								})
							] })
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: result.formulas.map((f) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
							className: "border-t border-border",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: "px-3 py-2 text-foreground",
									children: f.name
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: "hidden px-3 py-2 font-mono text-xs text-muted-foreground sm:table-cell",
									children: f.expression
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
									className: "px-3 py-2 text-right font-mono tabular-nums text-foreground",
									children: [
										formatNm(f.value),
										" ",
										f.unit
									]
								})
							]
						}, f.name)) })]
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "mt-2 text-[11px] text-muted-foreground",
					children: [
						"Sized continuous torque ",
						formatNm(sizedCont),
						" N·m (RMS × ",
						result.safetyFactor.toFixed(2),
						"). Sized peak ",
						formatNm(sizedPeak),
						" N·m."
					]
				})
			] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "flex flex-col gap-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-wrap items-center justify-between gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
							className: "text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground",
							children: "Catalog matches"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "text-xs text-muted-foreground",
							children: [matches.length, " fits"]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-wrap gap-1.5",
						children: [
							MOTOR_OPTS.map((o) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								type: "button",
								size: "sm",
								variant: motorKinds.includes(o.id) ? "secondary" : "outline",
								onClick: () => toggleMotorKind(o.id),
								children: o.label
							}, o.id)),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "mx-1 h-8 w-px bg-border" }),
							GB_OPTS.map((o) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								type: "button",
								size: "sm",
								variant: gearboxKinds.includes(o.id) ? "secondary" : "outline",
								onClick: () => toggleGearboxKind(o.id),
								children: o.label
							}, o.id))
						]
					}),
					matches.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "rounded-[var(--radius-md)] border border-border bg-card px-4 py-8 text-center text-sm text-muted-foreground",
						children: "No catalog combination meets torque, speed and gearbox rating. Relax the safety factor, allow another gearbox family, or check the inputs."
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
						className: "flex flex-col gap-2",
						children: matches.map((m) => {
							const id = `${m.motor.id}-${m.gearbox.id}`;
							const open = selectedMatchId === id;
							return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
								className: cn("rounded-[var(--radius-md)] border bg-card", open ? "border-primary/35" : "border-border"),
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
									type: "button",
									className: "flex w-full flex-col gap-2 px-3 py-3 text-left sm:flex-row sm:items-center sm:justify-between",
									onClick: () => setSelectedMatch(open ? null : id),
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "min-w-0",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "flex flex-wrap items-center gap-2",
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													className: "text-sm font-medium",
													children: m.motor.name
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													className: "text-muted-foreground",
													children: "+"
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													className: "text-sm font-medium",
													children: m.gearbox.name
												})
											]
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "mt-1 text-xs text-muted-foreground",
											children: [
												m.motor.kind,
												" · ",
												m.gearbox.family,
												" · ",
												m.motor.ratedPowerKw,
												" kW · frame",
												" ",
												m.motor.frame
											]
										})]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "flex items-center gap-3 sm:w-48",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											className: "w-full",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(UtilBar, {
												value: m.utilizationCont,
												label: "Cont."
											})
										})
									})]
								}), open && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "border-t border-border px-3 py-3",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "grid grid-cols-2 gap-3 text-sm sm:grid-cols-4",
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
													className: "text-[11px] text-muted-foreground",
													children: "Output continuous"
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													className: "font-mono tabular-nums",
													children: [formatNm(m.outputContNm), " N·m"]
												})] }),
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
													className: "text-[11px] text-muted-foreground",
													children: "Output peak"
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													className: "font-mono tabular-nums",
													children: [formatNm(m.outputPeakNm), " N·m"]
												})] }),
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
													className: "text-[11px] text-muted-foreground",
													children: "Output speed"
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													className: "font-mono tabular-nums",
													children: [formatRpm(m.outputSpeedRpm), " rpm"]
												})] }),
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
													className: "text-[11px] text-muted-foreground",
													children: "Inertia ratio"
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													className: "font-mono tabular-nums",
													children: [m.inertiaRatio.toFixed(1), " : 1"]
												})] })
											]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(UtilBar, {
											value: m.utilizationPeak,
											label: "Peak utilization"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
											className: "mt-3 flex flex-col gap-1",
											children: m.reasons.map((reason) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
												className: "flex gap-2 text-xs text-muted-foreground",
												children: [m.inertiaOk && m.thermalOk ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "mt-0.5 size-3.5 shrink-0 text-ok" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TriangleAlert, { className: "mt-0.5 size-3.5 shrink-0 text-warn" }), reason]
											}, reason))
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
											className: "mt-3 text-[11px] text-muted-foreground",
											children: [
												"Motor ",
												m.motor.contTorqueNm.toFixed(2),
												" N·m cont. / ",
												m.motor.peakTorqueNm.toFixed(1),
												" ",
												"N·m peak at ",
												m.motor.ratedSpeedRpm,
												" rpm. Gearbox rated ",
												formatNm(m.gearbox.ratedOutputNm),
												" ",
												"N·m, η ",
												(m.gearbox.efficiency * 100).toFixed(0),
												"%, backlash ",
												m.gearbox.backlashArcmin,
												"′."
											]
										})
									]
								})]
							}, id);
						})
					})
				]
			})
		]
	});
}
var TABS = [
	{
		id: "app",
		label: "Application"
	},
	{
		id: "inputs",
		label: "Inputs"
	},
	{
		id: "results",
		label: "Results"
	}
];
function AppShell() {
	const [tab, setTab] = (0, import_react.useState)("app");
	const units = useSizingStore((s) => s.units);
	const setUnits = useSizingStore((s) => s.setUnits);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "min-h-screen bg-background text-foreground",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
				className: "sticky top-0 z-20 border-b border-border bg-background/95 backdrop-blur-sm",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mx-auto flex max-w-[1400px] items-center justify-between gap-3 px-4 py-3 sm:px-6",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "min-w-0",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground",
							children: "Axion"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
							className: "truncate text-sm font-medium tracking-tight sm:text-base",
							children: "Motor and gearbox dimensioning"
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-1 rounded-[var(--radius-sm)] border border-border p-0.5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							size: "sm",
							variant: units === "metric" ? "secondary" : "ghost",
							onClick: () => setUnits("metric"),
							children: "SI"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							size: "sm",
							variant: units === "imperial" ? "secondary" : "ghost",
							onClick: () => setUnits("imperial"),
							children: "US"
						})]
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mx-auto flex max-w-[1400px] gap-1 px-4 pb-3 lg:hidden sm:px-6",
					children: TABS.map((t) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						onClick: () => setTab(t.id),
						className: cn("h-10 flex-1 rounded-[var(--radius-sm)] text-sm font-medium", tab === t.id ? "bg-muted text-foreground" : "text-muted-foreground"),
						children: t.label
					}, t.id))
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
				className: "mx-auto grid max-w-[1400px] grid-cols-1 gap-6 px-4 py-6 lg:grid-cols-12 sm:px-6",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("aside", {
						className: cn("lg:col-span-3 lg:block", tab === "app" ? "block" : "hidden"),
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ApplicationPicker, {})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
						className: cn("rounded-[var(--radius-lg)] border border-border bg-card p-4 sm:p-5 lg:col-span-4 lg:block", tab === "inputs" ? "block" : "hidden"),
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(InputPanel, {})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
						className: cn("rounded-[var(--radius-lg)] border border-border bg-card p-4 sm:p-5 lg:col-span-5 lg:block", tab === "results" ? "block" : "hidden"),
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ResultsPanel, {})
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("footer", {
				className: "mx-auto max-w-[1400px] px-4 pb-8 text-xs text-muted-foreground sm:px-6",
				children: "Catalog units are sample Axion frames for engineering studies, not a vendor quote. Verify against manufacturer data, ambient derating and the applicable machinery standard before release."
			})
		]
	});
}
function Home() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppShell, {});
}
//#endregion
export { Home as component };
