---
title: work-queue
tags: [queue]
related: [lab-backlog]
created: 2026-10-09
updated: 2026-10-13
---

# Work queue

The owner files entries, each addressed to one agent; that agent takes its
top `queued` one and sets it `in-progress`. States: `queued` → `in-progress`
→ `pr-open` → `done`, or `dropped` with a reason. Newest at the bottom; rank
by editing order.

Entry shape:

```
## <short title>
- state: queued | in-progress | pr-open | done | dropped
- agent: <name>
- filed: YYYY-MM-DD by <who>
- scope: <one reviewable idea, with what is out of scope named>
- branch: `<name>/<topic>` (`<sha>`) — base `main` (`<sha>`)
- pr: <url once open>
- review: <verdict at <sha>, with the comment's url, if the lab has a reviewer>
- notes: <what the agent found>
```

## Entries

## Scaffold the client app with OSM search
- state: pr-open
- agent: atlas
- filed: 2026-10-09 by olavostauros
- scope: a static TypeScript app under `src/` (Vite + Leaflet, OSM tiles), pt-BR UI. Pick an area by Nominatim place search or by drawing a rectangle on the map, enter a business term, query Overpass for POIs in the area, and show name / phone / address in a table and as pins, with OSM attribution. Put the provider behind `search(area, query) → Lead[]`. Out of scope: Google Places, CSV export, accounts. Follow `../AGENTS.md` (the project brief).
- branch: `atlas/scaffold-osm-search` (`08930d8`) — base `main` (`3e6d0f8`)
- pr: https://github.com/olavostauros/lead-finder/pull/1
- review:
- notes: The Vite project (package.json, index.html, configs) lives in `src/`, not the repo root, to stay inside atlas's directory; moving it to the root is the owner's call. Nominatim often ranks a point (a station, an address) above the district with the same name; point-like places are widened to ~2×2 km and same-label results collapsed. Not verified on a real touch device.

## Review the first app PR
- state: queued
- agent: lince
- filed: 2026-10-09 by olavostauros
- scope: review atlas's scaffold PR against `../AGENTS.md`, paying particular attention to keys or secrets in the tree, Nominatim/Overpass usage policy (rate, timeouts, attribution), LGPD notes in the UI, and the mobile layout. A verdict only; no code changes.
- branch:
- pr:
- review:
- notes:

## Review PR #6, touch drawing
- state: done
- agent: lince
- filed: 2026-10-13 by olavostauros (standing review filing, in the session)
- scope: review atlas's `atlas/touch-drawing` (`209e63c`) against `../AGENTS.md` and lince's PR #1 findings 3 and 4: tap without a drag, `pointercancel`, extra pointers, cancelling draw mode; `RectGesture` and its wiring in `main.ts` (pointer capture, Escape listener lifetime, map dragging restored on every exit, the 8 px threshold on high-DPI screens), pt-BR copy and touch-action CSS. A verdict only; no code changes.
- branch:
- pr: https://github.com/olavostauros/lead-finder/pull/6
- review: request changes at `209e63c` — https://github.com/olavostauros/lead-finder/pull/6#issuecomment-6144563070
- notes: PR #1 finding 3 is fixed; finding 4 is fixed for `pointercancel` and cancel, not for extra pointers. Blocking: draw mode disables only `map.dragging`, so a pinch mid-stroke zooms the map and, with the stroke now anchored in container pixels, commits a rectangle where the finger never was (`main.ts:73-75`, `:130`). Minor: the zoom buttons and attribution link are dead in draw mode because `onDown` captures pointers from Leaflet's controls (`main.ts:81-83`, from PR #1); a valid small box is labelled "0 km²" and the 0 km² backstop never fires for a drawing (`main.ts:44`, `area.ts:20`); "Usar área visível" or a place result in draw mode leaves draw mode on (`main.ts:145-153`, `:221`). Gates run: npm test (48 passed), typecheck, build, lab `mise run test`, diff check, and headless Chromium with CDP touch emulation at DPR 3 on the built app, with all non-local hosts blocked. Not run: a real phone, live Overpass/Nominatim.
