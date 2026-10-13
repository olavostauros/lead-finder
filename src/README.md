# lead-finder app

Static TypeScript app (Vite + Leaflet). Everything runs in the browser; there
is no backend and no key.

```sh
cd src
npm install
npm run dev        # http://localhost:5173
npm test           # unit tests (Vitest, no network)
npm run build      # typecheck + static build into src/dist/
```

## Layout

- `app/types.ts` — `Lead`, `Area` and the `Provider` interface every data
  source implements: `search(area, query) → Lead[]`.
- `app/overpass.ts` — OpenStreetMap provider (Overpass). Bounded area, query
  timeout, result cap, back-off on 429/504.
- `app/nominatim.ts` — place search, throttled to one request per second app-wide.
- `app/area.ts` — area size and the cap (`MAX_AREA_KM2`).
- `app/phone.ts` — Brazilian phone formatting and `wa.me` links for mobiles.
- `app/categories.ts` — pt-BR categories mapped to OSM tags.
- `app/draw.ts` — the draw-mode gesture: one pointer, tap or rectangle, the
  start kept as a map coordinate so a zoom cannot move it.
- `app/main.ts` — the UI: map, area drawing, search, table and pins.

The project lives under `src/` because `src/` is atlas's directory in the
lab; moving it to the repo root is a separate decision for the owner.
