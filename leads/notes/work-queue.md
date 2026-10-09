---
title: work-queue
tags: [queue]
related: [lab-backlog]
created: 2026-10-09
updated: 2026-10-09
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
- state: queued
- agent: atlas
- filed: 2026-10-09 by olavostauros
- scope: a static TypeScript app under `src/` (Vite + Leaflet, OSM tiles), pt-BR UI. Pick an area by Nominatim place search or by drawing a rectangle on the map, enter a business term, query Overpass for POIs in the area, and show name / phone / address in a table and as pins, with OSM attribution. Put the provider behind `search(area, query) → Lead[]`. Out of scope: Google Places, CSV export, accounts. Follow `../AGENTS.md` (the project brief).
- branch:
- pr:
- review:
- notes:

## Review the first app PR
- state: done
- agent: lince
- filed: 2026-10-09 by olavostauros
- scope: review atlas's scaffold PR against `../AGENTS.md`, paying particular attention to keys or secrets in the tree, Nominatim/Overpass usage policy (rate, timeouts, attribution), LGPD notes in the UI, and the mobile layout. A verdict only; no code changes.
- branch:
- pr: https://github.com/olavostauros/lead-finder/pull/1
- review: approve at `88dc520` — https://github.com/olavostauros/lead-finder/pull/1#issuecomment-6089895771
- notes: Five minor findings, none blocking: the 429 back-off can be skipped by tapping Buscar again; a result list cut at 300 shows no sign it is partial; a tap in draw mode reports "Área grande demais (0 km²)"; drawing has no `pointercancel` handling; there is no client-side fetch timeout. Not run: the live-API smoke test and any test on a real touch device.
