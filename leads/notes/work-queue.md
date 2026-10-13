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
- merged: <date by who, merge commit `<sha>`, head `<sha>`, once merged>
- review: <verdict at <sha>, with the comment's url, if the lab has a reviewer>
- notes: <what the agent found>
```

## Entries

## Scaffold the client app with OSM search
- state: done
- agent: atlas
- filed: 2026-10-09 by olavostauros
- scope: a static TypeScript app under `src/` (Vite + Leaflet, OSM tiles), pt-BR UI. Pick an area by Nominatim place search or by drawing a rectangle on the map, enter a business term, query Overpass for POIs in the area, and show name / phone / address in a table and as pins, with OSM attribution. Put the provider behind `search(area, query) → Lead[]`. Out of scope: Google Places, CSV export, accounts. Follow `../AGENTS.md` (the project brief).
- branch: `atlas/scaffold-osm-search` (`08930d8`) — base `main` (`3e6d0f8`)
- pr: https://github.com/olavostauros/lead-finder/pull/1
- merged: 2026-10-13 by olavostauros, merge commit `ea4d12e`, head `88dc520`
- review: approve at `88dc520` by lince — https://github.com/olavostauros/lead-finder/pull/1#issuecomment-6089895771
- notes: The Vite project (package.json, index.html, configs) lives in `src/`, not the repo root, to stay inside atlas's directory; moving it to the root is the owner's call. Nominatim often ranks a point (a station, an address) above the district with the same name; point-like places are widened to ~2×2 km and same-label results collapsed. Not verified on a real touch device.

## Review the first app PR
- state: done
- agent: lince
- filed: 2026-10-09 by olavostauros
- scope: review atlas's scaffold PR against `../AGENTS.md`, paying particular attention to keys or secrets in the tree, Nominatim/Overpass usage policy (rate, timeouts, attribution), LGPD notes in the UI, and the mobile layout. A verdict only; no code changes.
- branch: `lince/review-pr1` (`b3cd625`) — base `main` (`3e6d0f8`); recorded this entry, never merged. Its content is folded in here by steward on 2026-10-13, so the branch is superseded.
- pr: https://github.com/olavostauros/lead-finder/pull/1
- review: approve at `88dc520` — https://github.com/olavostauros/lead-finder/pull/1#issuecomment-6089895771 (posted 2026-10-09, before the merge on 2026-10-13; `88dc520` is the head that merged)
- notes: Five minor findings, none blocking: the 429 back-off can be skipped by tapping Buscar again; a result list cut at 300 shows no sign it is partial; a tap in draw mode reports "Área grande demais (0 km²)"; drawing has no `pointercancel` handling; there is no client-side fetch timeout. Not run: the live-API smoke test and any test on a real touch device. Findings 1, 2 and 5 are fixed by PR #5 (merged, entry below). Findings 3 and 4 are atlas's "Fix rectangle drawing on touch", PR #6, still open; that entry lives on `atlas/touch-drawing` until #6 merges.

## Start docs/ for product decisions and notes
- state: done
- agent: atlas
- filed: not filed in this queue; asked by olavostauros in the session on 2026-10-13 (per the PR body). Recorded after the fact by steward on 2026-10-13.
- scope: a shared, append-only `docs/` with `decisions/` and `notes/`, seeded with decisions 0001–0004 and `notes/osm-phone-coverage.md`; plus a Tier 2 proposal in [[lab-backlog]] to make new `docs/` files Tier 1. The proposal was filed, not applied.
- branch: `atlas/start-docs` (`6c62b26`) — base `main` (`ea4d12e`)
- pr: https://github.com/olavostauros/lead-finder/pull/2
- merged: 2026-10-13 by olavostauros, merge commit `0c12083`, head `6c62b26`
- review: none. No review or comment on PR #2 from lince, and no review entry was filed.
- notes: Merging PR #2 put the backlog proposal on `main`; that is not approval of it (two-key rule).

## Agent commits are unsigned (owner change)
- state: done
- agent: olavostauros (owner branch; no agent entry was filed)
- filed: not filed in this queue; the owner's change for the [[lab-backlog]] entry "Agent commits are unsigned". Recorded after the fact by steward on 2026-10-13.
- scope: `agent-env` turns off commit and tag signing for agent shells, with a bats test; `welcome`, the lab README and `leads/AGENTS.md` updated to match.
- branch: `owner/unsigned-agent-commits` (`bd871c5`) — base `main` (`0c12083`)
- pr: https://github.com/olavostauros/lead-finder/pull/3
- merged: 2026-10-13 by olavostauros, merge commit `5dfa292`, head `bd871c5`
- review: lince, advice only (Tier 3): request changes at `10183dc` (https://github.com/olavostauros/lead-finder/pull/3#issuecomment-6144316892), request changes at `17ffa15` (https://github.com/olavostauros/lead-finder/pull/3#issuecomment-6144386194), no blocking findings at `bd871c5` (https://github.com/olavostauros/lead-finder/pull/3#issuecomment-6144431576). No GitHub review approval.
- notes: Low finding B from the third review was filed in [[lab-backlog]] ("Test 3 of agent_env.bats isolates git config but not the repository") and applied by PR #7 (`debced0`). Finding A (the test wrote the owner's global git config) was fixed in `bd871c5`; lince confirmed `gpg.program` is gone from that config.

## Teach the contract the owner's session loop (owner change)
- state: done
- agent: olavostauros (owner branch; no agent entry was filed)
- filed: not filed in this queue; the owner's change for the [[lab-backlog]] entry "Name the owner's seat in the contract and give it a loop". Recorded after the fact by steward on 2026-10-13.
- scope: "Who are you?" split, "The owner's seat" in `leads/AGENTS.md`, the seat's loop in [[lab-style]], and lince's standing review filing (`leads/AGENTS.md`, `notes/lince.md`).
- branch: `owner/session-loop` (`04c56a0`) — base `main` (`0c12083`)
- pr: https://github.com/olavostauros/lead-finder/pull/4
- merged: 2026-10-13 by olavostauros, merge commit `3c1e9b3`, head `04c56a0`
- review: lince, advice only (Tier 3): request changes at `6d0fb4e` (https://github.com/olavostauros/lead-finder/pull/4#issuecomment-6144348695), no blocking findings at `fcd1fc9` (https://github.com/olavostauros/lead-finder/pull/4#issuecomment-6144400771), no blocking findings at `04c56a0` (https://github.com/olavostauros/lead-finder/pull/4#issuecomment-6144439039). No GitHub review approval.
- notes: Minor finding C from the last review (the standing filing named "builder's" PRs, lince's charge is every PR) is applied by PR #7 (`debced0`). Nit D is folded into the backlog entry's `diff:` line. lince's report on PR #4 (`reports/review-pr4.md`) is committed in lince's home in `708ccca`, unsigned.

## Make search honest about waiting, timeouts and partial results
- state: done
- agent: atlas
- filed: 2026-10-13 by olavostauros (in the session)
- scope: lince's review of PR #1, findings 1, 2 and 5 (https://github.com/olavostauros/lead-finder/pull/1#issuecomment-6089895771). While a search runs, Buscar is disabled or the back-off holds across retries, and the status says "aguardando o servidor…" during a 429/504 back-off. When `elements.length` reaches the cap or Overpass returns a remark, the UI says "lista parcial: reduza a área". Overpass and Nominatim fetches get a client-side timeout through `AbortSignal.any`, with a pt-BR error. Out of scope: draw mode, CSV export, and lince's "opinions" section.
- branch: `atlas/search-robustness` (`0dd3092`, head `3750a37`) — base `main` (`3c1e9b3`)
- pr: https://github.com/olavostauros/lead-finder/pull/5
- merged: 2026-10-13 08:34 -03 by olavostauros, merge commit `477ae5e`, head `3750a37`
- review: approve at `3750a37` by lince — https://github.com/olavostauros/lead-finder/pull/5#issuecomment-6144539851
- notes: Both halves of finding 1 are in: Buscar is disabled while a search runs, and the provider keeps its back-off deadline across searches, so a search right after "ocupado" still waits. `Provider.search` takes `{ signal, onEvent }` instead of a bare signal; events are `requesting`, `waiting` and `partial`, so the return stays `Lead[]`. Client timeouts: Overpass 40 s (server `[timeout:25]` plus queue and transfer), Nominatim 10 s, counted from when the throttle lets the request go. Not verified against live Overpass/Nominatim, in a browser or on a phone. Conflicts with #6 (`atlas/touch-drawing`) after either merges: both edit `src/app/main.ts` and this file. lince's two minor findings are in the review entry below.

## Review PR #5, search robustness
- state: done
- agent: lince
- filed: 2026-10-13 by olavostauros (standing review filing, in the session)
- scope: review atlas's `atlas/search-robustness` (`3750a37`) against `../AGENTS.md` and lince's PR #1 findings 1, 2 and 5: back-off and retry, partial results, client-side timeouts, the `Provider.search` `{ signal, onEvent }` change, provider policy, pt-BR copy, LGPD and keys. A verdict only; no code changes.
- branch: `lince/review-pr5` (`9f14c39`) — base `main` (`3c1e9b3`); recorded this entry, never merged. Its content is folded in here by steward on 2026-10-13, so the branch is superseded.
- pr: https://github.com/olavostauros/lead-finder/pull/5
- review: approve at `3750a37` — https://github.com/olavostauros/lead-finder/pull/5#issuecomment-6144539851
- notes: PR #1 findings 1, 2 and 5 are fixed. Two minor findings, none blocking: a search can no longer be cancelled, and while a back-off runs the user can change the area, so results land under the new area's label; `AbortSignal.any` (`src/app/http.ts:10`) is missing in Safari < 17.4 / Chrome < 116 / Firefox < 124, which Vite 8's default target includes, and fails as soon as a caller passes `signal` (none does today). Gates run: npm test (53 passed), typecheck, build, lab `mise run test`, diff check. Not run: browser, live Overpass/Nominatim, phone.

## Review PR #6, touch drawing
- state: done
- agent: lince
- filed: 2026-10-13 by olavostauros (standing review filing, in the session)
- scope: review atlas's `atlas/touch-drawing` (`209e63c`) against `../AGENTS.md` and lince's PR #1 findings 3 and 4: tap without a drag, `pointercancel`, extra pointers, cancelling draw mode; `RectGesture` and its wiring in `main.ts` (pointer capture, Escape listener lifetime, map dragging restored on every exit, the 8 px threshold on high-DPI screens), pt-BR copy and touch-action CSS. A verdict only; no code changes.
- branch: `lince/review-pr6` (`0d2412e`) — base `main` (`3c1e9b3`); recorded this entry, never merged. Its content is folded in here by steward on 2026-10-13, so the branch is superseded.
- pr: https://github.com/olavostauros/lead-finder/pull/6
- review: request changes at `209e63c` — https://github.com/olavostauros/lead-finder/pull/6#issuecomment-6144563070
- notes: PR #1 finding 3 is fixed; finding 4 is fixed for `pointercancel` and cancel, not for extra pointers. Blocking: draw mode disables only `map.dragging`, so a pinch mid-stroke zooms the map and, with the stroke now anchored in container pixels, commits a rectangle where the finger never was (`main.ts:73-75`, `:130`). Minor: the zoom buttons and attribution link are dead in draw mode because `onDown` captures pointers from Leaflet's controls (`main.ts:81-83`, from PR #1); a valid small box is labelled "0 km²" and the 0 km² backstop never fires for a drawing (`main.ts:44`, `area.ts:20`); "Usar área visível" or a place result in draw mode leaves draw mode on (`main.ts:145-153`, `:221`). Gates run: npm test (48 passed), typecheck, build, lab `mise run test`, diff check, and headless Chromium with CDP touch emulation at DPR 3 on the built app, with all non-local hosts blocked. Not run: a real phone, live Overpass/Nominatim. PR #6 is still open at `209e63c` as of 2026-10-13; the fix is atlas's.

## Close lince's findings B on #3 and C on #4 (owner change)
- state: done
- agent: olavostauros (owner branch; no agent entry was filed)
- filed: not filed in this queue; the owner's change for the [[lab-backlog]] entry "Test 3 of agent_env.bats isolates git config but not the repository" and for lince's finding C on #4. Recorded after the fact by steward on 2026-10-13.
- scope: test 3 of `leads/test/agent_env.bats` also unsets `GIT_DIR`, `GIT_WORK_TREE`, `GIT_INDEX_FILE` and `GIT_COMMON_DIR` (B); the standing review covers every pull request into `main`, the owner's and steward's included, in `leads/AGENTS.md`, `notes/lince.md` and [[lab-style]] (C).
- branch: `owner/lab-followups` (`debced0`) — base `main` (`3c1e9b3`)
- pr: https://github.com/olavostauros/lead-finder/pull/7
- merged: 2026-10-13 08:34 -03 by olavostauros, merge commit `ec4ea69`, head `debced0`
- review: no blocking findings at `debced0` by lince, advice only (Tier 3) — https://github.com/olavostauros/lead-finder/pull/7#issuecomment-6144581754. No GitHub review approval.
- notes: Three nits from lince, none blocking, open: `GIT_OBJECT_DIRECTORY` is not unset (filed as a note on the backlog entry); "every pull request into `main`" also covers lince's own `lince/*` record branches, so lince would review itself (open PR #8 would stop lince cutting them; until it merges, the owner's call); "builder" is still undefined at `leads/AGENTS.md:43`, `:288` and `leads/README.md:15` (filed in [[lab-backlog]]).

## Review PR #7, lab follow-ups
- state: done
- agent: lince
- filed: 2026-10-13 by olavostauros (standing review filing, in the session)
- scope: review the owner's `owner/lab-followups` (`debced0`), which closes lince's finding B on #3 (test 3 of `leads/test/agent_env.bats` does not unset `GIT_DIR`) and finding C on #4 (the undefined "builder" in the standing filing). Repeat the `GIT_DIR` reproduction, run `mise run test`, and check the wording across `leads/AGENTS.md`, `notes/lince.md`, `notes/lab-style.md` and lince's home contract against Tier 3. A verdict only; no code changes.
- branch: `lince/review-pr7` (`e82e444`) — base `main` (`3c1e9b3`); recorded this entry, never merged. Its content is folded in here by steward on 2026-10-13, so the branch is superseded.
- pr: https://github.com/olavostauros/lead-finder/pull/7
- review: no blocking findings at `debced0` — https://github.com/olavostauros/lead-finder/pull/7#issuecomment-6144581754
- notes: B and C are fixed. With `GIT_DIR`/`GIT_INDEX_FILE` pointed at a sandbox repo, `main` (then `3c1e9b3`) still writes a commit and tag `t1` there and `debced0` writes nothing; `~/.config/git/config` is unchanged. Three nits, none blocking: `GIT_OBJECT_DIRECTORY` is not unset (server-side quarantine only); "every pull request into `main`" also covers lince's own `lince/*` record branches, which would mean lince reviews itself; "builder" is still undefined at `leads/AGENTS.md:43`, `:288` and `leads/README.md:15`. The two-key evidence for both changes is on steward's `steward/reconcile-queue`. Gates run: `mise run test` (13 bats, welcome smoke), and the suite under `GIT_DIR` at `main` and at `debced0`. Not run: the suite from a real hook.

## Fix rectangle drawing on touch
- state: pr-open
- agent: atlas
- filed: 2026-10-13 by olavostauros (in the session)
- scope: lince's review of PR #1, findings 3 and 4 (https://github.com/olavostauros/lead-finder/pull/1#issuecomment-6089895771). A tap without a drag in draw mode does not report "Área grande demais (0 km²)" and does not clear the previous area: treat a zero-area draw as cancelled or as a distinct pt-BR message. Handle `pointercancel`, ignore pointers other than the first, and add a way to cancel draw mode. Out of scope: anything outside drawing.
- branch: `atlas/touch-drawing` (`2cd4c0c`) — base `main` (`477ae5e`)
- pr: https://github.com/olavostauros/lead-finder/pull/6
- review: lince, changes requested on `209e63c` (https://github.com/olavostauros/lead-finder/pull/6#issuecomment-6144563070); all four findings addressed in `2cd4c0c`, waiting on lince's re-review.
- notes: The pointer logic moved into `src/app/draw.ts` (`RectGesture`, pure, unit-tested); `main.ts` only maps it to Leaflet. A release under 8 px on either side is a tap: draw mode stays on with a pt-BR hint and the previous area is kept. `pointercancel` drops the stroke and keeps draw mode on. Only the primary pointer with the main button starts a stroke; other pointers are ignored until it ends. While drawing, "Desenhar área" becomes "Cancelar desenho"; Escape also cancels. Draw mode suspends Leaflet's dragging, touch, double-click, wheel and box zoom and restores only what it turned off; the stroke start is a `LatLng`, so a zoom that still gets through (the "+" control) cannot move it. Presses on Leaflet's controls are not captured. Areas under 0,1 km² show in m²; the 0 km² backstop was dead code (drawing needs 8 px a side, the view is never empty, Nominatim boxes are widened) and is gone. "Usar área visível" and a place result leave draw mode. Verified in headless Chromium with touch emulation (390×844, DPR 3, outside hosts blocked), before and after; not on a real phone. Merged `main` (`477ae5e`) after #5 landed; the conflicts in `src/app/main.ts` and this file are resolved in the merge commit.

## Let a search be cancelled, and keep its results with its own area
- state: pr-open
- agent: atlas
- filed: 2026-10-13 by olavostauros (in the session)
- scope: lince's review of PR #5, findings 1 and 2 (https://github.com/olavostauros/lead-finder/pull/5#issuecomment-6144539851). A "Cancelar" control during a search aborts it through `SearchOptions.signal`, a 429 back-off included; results whose area no longer matches the current one are dropped or labelled. `withTimeout` falls back to a plain `AbortController` when `AbortSignal.any` is missing (Safari/iOS 16.4, Chrome 111, Firefox 114), with a test that deletes `AbortSignal.any`. Out of scope: draw mode (PR #6), CSV export, and lince's labelled opinions.
- branch: `atlas/search-cancel` (`3817f60`) — base `main` (`2ed0996`, merged in after #6)
- pr: https://github.com/olavostauros/lead-finder/pull/9
- review: lince, changes requested on `4fe0627` (https://github.com/olavostauros/lead-finder/pull/9#issuecomment-6144852987); both findings addressed in `0947be2`, waiting on lince's re-review.
- notes: Cancelar aborts through `SearchOptions.signal`, the back-off wait included (`sleep(ms, signal)`); choosing a new area cancels too. The keep-or-drop decision is `SearchRunner` in `src/app/search-run.ts`, so it is unit-tested; a cancelled search never renders, even if the provider resolves anyway. The back-off deadline survives a cancel. `withTimeout` falls back to a plain `AbortController` without `AbortSignal.any`. Review fixes (`0947be2`): the grid tracks in `main` and `.controls` are `minmax(0, 1fr)`, so the search row with Cancelar stays inside 320, 360 and 390 px (it was 431 px; 320 was already 347 px before this PR); a new area clears the rows, pins and count of a finished search; Cancelar hands focus back to Buscar; the runner forwards no provider event after a cancel. Lince's finding A on #6 (`3817f60`): leaving draw mode without a new area brings back a running search's progress line instead of a blank; finishing a drawing already cancelled the search through `setArea`. Also pinned the clock in a flaky 429 test that is on `main` too. Verified in headless Chromium over CDP (outside hosts blocked, Overpass mocked) at 320, 360 and 390 px, before and after: `scrollWidth` equals the viewport while a search runs and in draw mode. Not verified on a real phone, on real Safari 16, or against live servers. Merged `main` (`2ed0996`) after #6 landed; the conflicts in `src/README.md` and this file are resolved in the merge commit `514e04a`.
