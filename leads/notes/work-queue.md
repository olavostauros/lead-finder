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

## Review PR #5, search robustness
- state: done
- agent: lince
- filed: 2026-10-13 by olavostauros (standing review filing, in the session)
- scope: review atlas's `atlas/search-robustness` (`3750a37`) against `../AGENTS.md` and lince's PR #1 findings 1, 2 and 5: back-off and retry, partial results, client-side timeouts, the `Provider.search` `{ signal, onEvent }` change, provider policy, pt-BR copy, LGPD and keys. A verdict only; no code changes.
- branch:
- pr: https://github.com/olavostauros/lead-finder/pull/5
- review: approve at `3750a37` — https://github.com/olavostauros/lead-finder/pull/5#issuecomment-6144539851
- notes: PR #1 findings 1, 2 and 5 are fixed. Two minor findings, none blocking: a search can no longer be cancelled, and while a back-off runs the user can change the area, so results land under the new area's label; `AbortSignal.any` (`src/app/http.ts:10`) is missing in Safari < 17.4 / Chrome < 116 / Firefox < 124, which Vite 8's default target includes, and fails as soon as a caller passes `signal` (none does today). Gates run: npm test (53 passed), typecheck, build, lab `mise run test`, diff check. Not run: browser, live Overpass/Nominatim, phone.
