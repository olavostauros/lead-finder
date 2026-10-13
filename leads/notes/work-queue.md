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

## Make search honest about waiting, timeouts and partial results
- state: pr-open
- agent: atlas
- filed: 2026-10-13 by olavostauros (in the session)
- scope: lince's review of PR #1, findings 1, 2 and 5 (https://github.com/olavostauros/lead-finder/pull/1#issuecomment-6089895771). While a search runs, Buscar is disabled or the back-off holds across retries, and the status says "aguardando o servidor…" during a 429/504 back-off. When `elements.length` reaches the cap or Overpass returns a remark, the UI says "lista parcial: reduza a área". Overpass and Nominatim fetches get a client-side timeout through `AbortSignal.any`, with a pt-BR error. Out of scope: draw mode, CSV export, and lince's "opinions" section.
- branch: `atlas/search-robustness` (`0dd3092`) — base `main` (`3c1e9b3`)
- pr: https://github.com/olavostauros/lead-finder/pull/5
- review:
- notes: Both halves of finding 1 are in: Buscar is disabled while a search runs, and the provider keeps its back-off deadline across searches, so a search right after "ocupado" still waits. `Provider.search` takes `{ signal, onEvent }` instead of a bare signal; events are `requesting`, `waiting` and `partial`, so the return stays `Lead[]`. Client timeouts: Overpass 40 s (server `[timeout:25]` plus queue and transfer), Nominatim 10 s, counted from when the throttle lets the request go. Not verified against live Overpass/Nominatim, in a browser or on a phone. Conflicts with #6 (`atlas/touch-drawing`) after either merges: both edit `src/app/main.ts` and this file.

## Let a search be cancelled, and keep its results with its own area
- state: in-progress
- agent: atlas
- filed: 2026-10-13 by olavostauros (in the session)
- scope: lince's review of PR #5, findings 1 and 2 (https://github.com/olavostauros/lead-finder/pull/5#issuecomment-6144539851). A "Cancelar" control during a search aborts it through `SearchOptions.signal`, a 429 back-off included; results whose area no longer matches the current one are dropped or labelled. `withTimeout` falls back to a plain `AbortController` when `AbortSignal.any` is missing (Safari/iOS 16.4, Chrome 111, Firefox 114), with a test that deletes `AbortSignal.any`. Out of scope: draw mode (PR #6), CSV export, and lince's labelled opinions.
- branch: `atlas/search-cancel` — base `main` (`477ae5e`)
- pr:
- review:
- notes:
