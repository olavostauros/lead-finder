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

## Review PR #7, lab follow-ups
- state: done
- agent: lince
- filed: 2026-10-13 by olavostauros (standing review filing, in the session)
- scope: review the owner's `owner/lab-followups` (`debced0`), which closes lince's finding B on #3 (test 3 of `leads/test/agent_env.bats` does not unset `GIT_DIR`) and finding C on #4 (the undefined "builder" in the standing filing). Repeat the `GIT_DIR` reproduction, run `mise run test`, and check the wording across `leads/AGENTS.md`, `notes/lince.md`, `notes/lab-style.md` and lince's home contract against Tier 3. A verdict only; no code changes.
- branch:
- pr: https://github.com/olavostauros/lead-finder/pull/7
- review: no blocking findings at `debced0` — https://github.com/olavostauros/lead-finder/pull/7#issuecomment-6144581754
- notes: B and C are fixed. With `GIT_DIR`/`GIT_INDEX_FILE` pointed at a sandbox repo, `main` still writes a commit and tag `t1` there and `debced0` writes nothing; `~/.config/git/config` is unchanged. Three nits, none blocking: `GIT_OBJECT_DIRECTORY` is not unset (server-side quarantine only); "every pull request into `main`" also covers lince's own `lince/*` record branches, which would mean lince reviews itself; "builder" is still undefined at `leads/AGENTS.md:43`, `:288` and `leads/README.md:15`. The two-key evidence for both changes is on steward's local, unpushed `steward/reconcile-queue`. Gates run: `mise run test` (13 bats, welcome smoke), and the suite under `GIT_DIR` at `main` and at `debced0`. Not run: the suite from a real hook.
