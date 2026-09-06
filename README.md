# Axion

SEW-EURODRIVE **CM3C / CM3P** servo dimensioning for industrial motion.

Pick an application (conveyor, crane, ball screw, lift, rack, gantry, rotary table, mixer, fan, pump). Enter machine data and a motion cycle. Axion computes force, torque, speed and inertia, then ranks flange-compatible SEW motors and gear units.

This is a sizing aid. Confirm the type code in **SEW Workbench** before you order.

## Live site (free)

Best free public URL with only GitHub:

**GitHub Pages** — `https://maizlow.github.io/axion-sizer/`

The repo must be **public** for Pages on a free GitHub account. Private Pages needs GitHub Pro.

1. GitHub → repository **Settings → Pages**
2. Source: **GitHub Actions**
3. Push to `main` (or run **Actions → Publish to GitHub Pages → Run workflow**)

If you keep the repo private, use **[Vercel](https://vercel.com)** Hobby (free): Import `maizlow/axion-sizer`, framework detected from the Nitro/Vercel build already in this project. Same push-to-deploy loop.

| Host | Cost | Needs | Fits this app |
|---|---|---|---|
| GitHub Pages | Free if repo is public | Settings → Pages → Actions | Yes for the calculator (client) |
| Vercel Hobby | Free | Vercel account linked to GitHub | Best match for the existing build |
| Grok live preview | Included in Grok Build | This chat | Not a public URL you own |

Future updates: merge or push to `main`. The workflow in `.github/workflows/pages.yml` builds and publishes automatically.

## Motion cycle

Inputs include a travel table. Each column is one segment:

- Direction of inclination (uphill / downhill / level)
- Acceleration law (linear / sin² / jerk-limited)
- Start / end velocity (m/s)
- Acceleration (m/s²)
- Time (s)
- Distance (mm)
- Position (mm, cumulative)

Peak and RMS torque use the cycle when that option is on.

## Catalog honesty

- **CM3C / CM3P** standstill data from published SEW tables
- **PS.F / PS.C** official integer ratio lists
- **PxG / R / K** representative ratio ladders, not every catalog iN
- Matches screen frame, input speed and torque class — not a full Workbench check

## Local

```bash
npm install
npm run dev          # 0.0.0.0:8080
npm run typecheck
npm run build
```

SI units only.

## License

Project code is yours. SEW names, type codes and catalog figures remain SEW-EURODRIVE property. Use them only as a preliminary sizing reference.
