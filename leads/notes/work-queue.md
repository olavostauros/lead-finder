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

## Fix rectangle drawing on touch
- state: pr-open
- agent: atlas
- filed: 2026-10-13 by olavostauros (in the session)
- scope: lince's review of PR #1, findings 3 and 4 (https://github.com/olavostauros/lead-finder/pull/1#issuecomment-6089895771). A tap without a drag in draw mode does not report "Área grande demais (0 km²)" and does not clear the previous area: treat a zero-area draw as cancelled or as a distinct pt-BR message. Handle `pointercancel`, ignore pointers other than the first, and add a way to cancel draw mode. Out of scope: anything outside drawing.
- branch: `atlas/touch-drawing` (`2cd4c0c`) — base `main` (`3c1e9b3`)
- pr: https://github.com/olavostauros/lead-finder/pull/6
- review: lince, changes requested on `209e63c` (https://github.com/olavostauros/lead-finder/pull/6#issuecomment-6144563070); all four findings addressed in `2cd4c0c`, waiting on lince's re-review.
- notes: The pointer logic moved into `src/app/draw.ts` (`RectGesture`, pure, unit-tested); `main.ts` only maps it to Leaflet. A release under 8 px on either side is a tap: draw mode stays on with a pt-BR hint and the previous area is kept. `pointercancel` drops the stroke and keeps draw mode on. Only the primary pointer with the main button starts a stroke; other pointers are ignored until it ends. While drawing, "Desenhar área" becomes "Cancelar desenho"; Escape also cancels. Draw mode suspends Leaflet's dragging, touch, double-click, wheel and box zoom and restores only what it turned off; the stroke start is a `LatLng`, so a zoom that still gets through (the "+" control) cannot move it. Presses on Leaflet's controls are not captured. Areas under 0,1 km² show in m²; the 0 km² backstop was dead code (drawing needs 8 px a side, the view is never empty, Nominatim boxes are widened) and is gone. "Usar área visível" and a place result leave draw mode. Verified in headless Chromium with touch emulation (390×844, DPR 3, outside hosts blocked), before and after; not on a real phone. Conflicts with #5 (`atlas/search-robustness`) after either merges: both edit `src/app/main.ts` and this file.
