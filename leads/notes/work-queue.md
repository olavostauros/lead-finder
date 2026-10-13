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
- review: <latest verdict at <sha>, with the comment's url; then earlier rounds, oldest last>
- notes: <what the agent found>
```

A record entry is one steward adds on a sweep for a pull request into
`main` that no queue entry filed (the owner's, steward's, or an agent's
asked for in the session). Nobody works it; it holds the PR's facts:

```
## <what the PR does>; an owner PR ends in "(owner change)"
- state: pr-open | done | dropped
- agent: <the PR's author: a roster name, or the owner, only in a record>
- filed: YYYY-MM-DD by steward (record; not filed)
- then scope, branch, pr, merged, review, notes as above
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
- notes: Five minor findings, none blocking: the 429 back-off can be skipped by tapping Buscar again; a result list cut at 300 shows no sign it is partial; a tap in draw mode reports "Área grande demais (0 km²)"; drawing has no `pointercancel` handling; there is no client-side fetch timeout. Not run: the live-API smoke test and any test on a real touch device. Findings 1, 2 and 5 are fixed by PR #5 (merged, entry below). Findings 3 and 4 are fixed by PR #6 (merged as `2ed0996`, atlas's "Fix rectangle drawing on touch" below).

## Start docs/ for product decisions and notes
- state: done
- agent: atlas
- filed: 2026-10-13 by steward (record; not filed). Asked by olavostauros in the session on 2026-10-13, per the PR body.
- scope: a shared, append-only `docs/` with `decisions/` and `notes/`, seeded with decisions 0001–0004 and `notes/osm-phone-coverage.md`; plus a Tier 2 proposal in [[lab-backlog]] to make new `docs/` files Tier 1. The proposal was filed, not applied.
- branch: `atlas/start-docs` (`6c62b26`) — base `main` (`ea4d12e`)
- pr: https://github.com/olavostauros/lead-finder/pull/2
- merged: 2026-10-13 by olavostauros, merge commit `0c12083`, head `6c62b26`
- review: none. No review or comment on PR #2 from lince, and no review entry was filed.
- notes: Merging PR #2 put the backlog proposal on `main`; that is not approval of it (two-key rule).

## Agent commits are unsigned (owner change)
- state: done
- agent: olavostauros
- filed: 2026-10-13 by steward (record; not filed). The owner's change for the [[lab-backlog]] entry "Agent commits are unsigned".
- scope: `agent-env` turns off commit and tag signing for agent shells, with a bats test; `welcome`, the lab README and `leads/AGENTS.md` updated to match.
- branch: `owner/unsigned-agent-commits` (`bd871c5`) — base `main` (`0c12083`)
- pr: https://github.com/olavostauros/lead-finder/pull/3
- merged: 2026-10-13 by olavostauros, merge commit `5dfa292`, head `bd871c5`
- review: no blocking findings at `bd871c5` (latest) by lince, advice only (Tier 3) — https://github.com/olavostauros/lead-finder/pull/3#issuecomment-6144431576. Earlier: request changes at `17ffa15` — https://github.com/olavostauros/lead-finder/pull/3#issuecomment-6144386194; request changes at `10183dc` — https://github.com/olavostauros/lead-finder/pull/3#issuecomment-6144316892. No GitHub review approval.
- notes: Low finding B from the third review was filed in [[lab-backlog]] ("Test 3 of agent_env.bats isolates git config but not the repository") and applied by PR #7 (`debced0`). Finding A (the test wrote the owner's global git config) was fixed in `bd871c5`; lince confirmed `gpg.program` is gone from that config.

## Teach the contract the owner's session loop (owner change)
- state: done
- agent: olavostauros
- filed: 2026-10-13 by steward (record; not filed). The owner's change for the [[lab-backlog]] entry "Name the owner's seat in the contract and give it a loop".
- scope: "Who are you?" split, "The owner's seat" in `leads/AGENTS.md`, the seat's loop in [[lab-style]], and lince's standing review filing (`leads/AGENTS.md`, `notes/lince.md`).
- branch: `owner/session-loop` (`04c56a0`) — base `main` (`0c12083`)
- pr: https://github.com/olavostauros/lead-finder/pull/4
- merged: 2026-10-13 by olavostauros, merge commit `3c1e9b3`, head `04c56a0`
- review: no blocking findings at `04c56a0` (latest) by lince, advice only (Tier 3) — https://github.com/olavostauros/lead-finder/pull/4#issuecomment-6144439039. Earlier: no blocking findings at `fcd1fc9` — https://github.com/olavostauros/lead-finder/pull/4#issuecomment-6144400771; request changes at `6d0fb4e` — https://github.com/olavostauros/lead-finder/pull/4#issuecomment-6144348695. No GitHub review approval.
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
- notes: Both halves of finding 1 are in: Buscar is disabled while a search runs, and the provider keeps its back-off deadline across searches, so a search right after "ocupado" still waits. `Provider.search` takes `{ signal, onEvent }` instead of a bare signal; events are `requesting`, `waiting` and `partial`, so the return stays `Lead[]`. Client timeouts: Overpass 40 s (server `[timeout:25]` plus queue and transfer), Nominatim 10 s, counted from when the throttle lets the request go. Not verified against live Overpass/Nominatim, in a browser or on a phone. Conflicts with #6 (`atlas/touch-drawing`) after either merges: both edit `src/app/main.ts` and this file. lince's two minor findings are in the review entry below; both are fixed by PR #9 (merged as `9afbdcf`).

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
- review: no blocking findings at `97e04da` (latest) — https://github.com/olavostauros/lead-finder/pull/6#issuecomment-6144906367. Earlier: request changes at `209e63c` — https://github.com/olavostauros/lead-finder/pull/6#issuecomment-6144563070
- notes: PR #1 finding 3 is fixed; finding 4 is fixed for `pointercancel` and cancel, not for extra pointers. Blocking: draw mode disables only `map.dragging`, so a pinch mid-stroke zooms the map and, with the stroke now anchored in container pixels, commits a rectangle where the finger never was (`main.ts:73-75`, `:130`). Minor: the zoom buttons and attribution link are dead in draw mode because `onDown` captures pointers from Leaflet's controls (`main.ts:81-83`, from PR #1); a valid small box is labelled "0 km²" and the 0 km² backstop never fires for a drawing (`main.ts:44`, `area.ts:20`); "Usar área visível" or a place result in draw mode leaves draw mode on (`main.ts:145-153`, `:221`). Gates run: npm test (48 passed), typecheck, build, lab `mise run test`, diff check, and headless Chromium with CDP touch emulation at DPR 3 on the built app, with all non-local hosts blocked. Not run: a real phone, live Overpass/Nominatim. The notes so far are the first round's. Second round, at `97e04da`: all four findings are fixed, checked in the diff and in headless Chromium with touch emulation; the merge of `main` (`477ae5e`) kept #5's search code intact. One new low finding A, already on `main` after #5: draw mode overwrites a running search's status and a new area can sit above the old area's results; fixed by PR #9 (`3817f60`). Observed outside the PR: "Usar área visível" fails at the default zoom on a 390 px phone, filed as an atlas entry below. PR #6 merged on 2026-10-13 08:51 -03 as `2ed0996`.

## Close lince's findings B on #3 and C on #4 (owner change)
- state: done
- agent: olavostauros
- filed: 2026-10-13 by steward (record; not filed). The owner's change for the [[lab-backlog]] entry "Test 3 of agent_env.bats isolates git config but not the repository" and for lince's finding C on #4.
- scope: test 3 of `leads/test/agent_env.bats` also unsets `GIT_DIR`, `GIT_WORK_TREE`, `GIT_INDEX_FILE` and `GIT_COMMON_DIR` (B); the standing review covers every pull request into `main`, the owner's and steward's included, in `leads/AGENTS.md`, `notes/lince.md` and [[lab-style]] (C).
- branch: `owner/lab-followups` (`debced0`) — base `main` (`3c1e9b3`)
- pr: https://github.com/olavostauros/lead-finder/pull/7
- merged: 2026-10-13 08:34 -03 by olavostauros, merge commit `ec4ea69`, head `debced0`
- review: no blocking findings at `debced0` by lince, advice only (Tier 3) — https://github.com/olavostauros/lead-finder/pull/7#issuecomment-6144581754. No GitHub review approval.
- notes: Three nits from lince, none blocking: `GIT_OBJECT_DIRECTORY` is not unset (open; a note on the backlog entry); "every pull request into `main`" also covers lince's own `lince/*` record branches, so lince would review itself (closed for PR reviews by PR #8, `7000cd4`: lince cuts no branch to record a PR review); "builder" was undefined at `leads/AGENTS.md:43`, `:288` and `leads/README.md:15` (closed by PR #11, `727dc57`, which points at the roster's `kind` column; see [[lab-backlog]]).

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
- state: done
- agent: atlas
- filed: 2026-10-13 by olavostauros (in the session)
- scope: lince's review of PR #1, findings 3 and 4 (https://github.com/olavostauros/lead-finder/pull/1#issuecomment-6089895771). A tap without a drag in draw mode does not report "Área grande demais (0 km²)" and does not clear the previous area: treat a zero-area draw as cancelled or as a distinct pt-BR message. Handle `pointercancel`, ignore pointers other than the first, and add a way to cancel draw mode. Out of scope: anything outside drawing.
- branch: `atlas/touch-drawing` (`2cd4c0c`, head `97e04da`) — base `main` (`477ae5e`)
- pr: https://github.com/olavostauros/lead-finder/pull/6
- merged: 2026-10-13 08:51 -03 by olavostauros, merge commit `2ed0996`, head `97e04da`
- review: no blocking findings at `97e04da` (latest) by lince — https://github.com/olavostauros/lead-finder/pull/6#issuecomment-6144906367. Earlier: request changes at `209e63c` — https://github.com/olavostauros/lead-finder/pull/6#issuecomment-6144563070; all four findings addressed in `2cd4c0c`.
- notes: The pointer logic moved into `src/app/draw.ts` (`RectGesture`, pure, unit-tested); `main.ts` only maps it to Leaflet. A release under 8 px on either side is a tap: draw mode stays on with a pt-BR hint and the previous area is kept. `pointercancel` drops the stroke and keeps draw mode on. Only the primary pointer with the main button starts a stroke; other pointers are ignored until it ends. While drawing, "Desenhar área" becomes "Cancelar desenho"; Escape also cancels. Draw mode suspends Leaflet's dragging, touch, double-click, wheel and box zoom and restores only what it turned off; the stroke start is a `LatLng`, so a zoom that still gets through (the "+" control) cannot move it. Presses on Leaflet's controls are not captured. Areas under 0,1 km² show in m²; the 0 km² backstop was dead code (drawing needs 8 px a side, the view is never empty, Nominatim boxes are widened) and is gone. "Usar área visível" and a place result leave draw mode. Verified in headless Chromium with touch emulation (390×844, DPR 3, outside hosts blocked), before and after; not on a real phone. Merged `main` (`477ae5e`) after #5 landed; the conflicts in `src/app/main.ts` and this file are resolved in the merge commit. (steward, 2026-10-13:) lince's second-round finding A (draw mode blanks a running search's status) is fixed by PR #9 (`3817f60`); its observation on "Usar área visível" at the default zoom is filed as an entry below.

## Let a search be cancelled, and keep its results with its own area
- state: done
- agent: atlas
- filed: 2026-10-13 by olavostauros (in the session)
- scope: lince's review of PR #5, findings 1 and 2 (https://github.com/olavostauros/lead-finder/pull/5#issuecomment-6144539851). A "Cancelar" control during a search aborts it through `SearchOptions.signal`, a 429 back-off included; results whose area no longer matches the current one are dropped or labelled. `withTimeout` falls back to a plain `AbortController` when `AbortSignal.any` is missing (Safari/iOS 16.4, Chrome 111, Firefox 114), with a test that deletes `AbortSignal.any`. Out of scope: draw mode (PR #6), CSV export, and lince's labelled opinions.
- branch: `atlas/search-cancel` (`3817f60`, head `efda22b`) — base `main` (`2ed0996`, merged in after #6)
- pr: https://github.com/olavostauros/lead-finder/pull/9
- merged: 2026-10-13 09:01 -03 by olavostauros, merge commit `9afbdcf`, head `efda22b`
- review: no blocking findings at `efda22b` (latest) by lince — https://github.com/olavostauros/lead-finder/pull/9#issuecomment-6145058949. Earlier: request changes at `4fe0627` — https://github.com/olavostauros/lead-finder/pull/9#issuecomment-6144852987; both findings addressed in `0947be2`.
- notes: Cancelar aborts through `SearchOptions.signal`, the back-off wait included (`sleep(ms, signal)`); choosing a new area cancels too. The keep-or-drop decision is `SearchRunner` in `src/app/search-run.ts`, so it is unit-tested; a cancelled search never renders, even if the provider resolves anyway. The back-off deadline survives a cancel. `withTimeout` falls back to a plain `AbortController` without `AbortSignal.any`. Review fixes (`0947be2`): the grid tracks in `main` and `.controls` are `minmax(0, 1fr)`, so the search row with Cancelar stays inside 320, 360 and 390 px (it was 431 px; 320 was already 347 px before this PR); a new area clears the rows, pins and count of a finished search; Cancelar hands focus back to Buscar; the runner forwards no provider event after a cancel. Lince's finding A on #6 (`3817f60`): leaving draw mode without a new area brings back a running search's progress line instead of a blank; finishing a drawing already cancelled the search through `setArea`. Also pinned the clock in a flaky 429 test that is on `main` too. Verified in headless Chromium over CDP (outside hosts blocked, Overpass mocked) at 320, 360 and 390 px, before and after: `scrollWidth` equals the viewport while a search runs and in draw mode. Not verified on a real phone, on real Safari 16, or against live servers. Merged `main` (`2ed0996`) after #6 landed; the conflicts in `src/README.md` and this file are resolved in the merge commit `514e04a`. (steward, 2026-10-13:) lince's second round found both findings and #6's A fixed, checked in a headless browser at 320, 360 and 390 px. One new low finding B, already on `main` after #6: a search's status overwrites draw mode's hint, and leaving draw mode erases a search's final message; filed as an entry below.

## A PR review is recorded by its comment, not a branch (owner change)
- state: done
- agent: olavostauros
- filed: 2026-10-13 by steward (record; not filed)
- scope: lince cuts no branch to record a PR review; its PR comment is the record, and steward carries the verdict into this queue on a sweep after every merge or close. `leads/AGENTS.md` (Who lives here), `notes/lince.md`, [[lab-style]] (Chain) and `notes/steward.md` (the Reviews duty); lince's home step 6 and steward's home sweep step 2 (`e1001cf`) changed in their private repos.
- branch: `owner/review-record` (`84fae17`) — base `main` (`477ae5e`)
- pr: https://github.com/olavostauros/lead-finder/pull/8
- merged: 2026-10-13 08:40 -03 by olavostauros, merge commit `7000cd4`, head `84fae17`
- review: no blocking findings at `84fae17` (latest) by lince, advice only (Tier 3) — https://github.com/olavostauros/lead-finder/pull/8#issuecomment-6144714028. Earlier: changes requested at `0ddce0a` — https://github.com/olavostauros/lead-finder/pull/8#issuecomment-6144677610. No GitHub review approval.
- notes: Commits `0ddce0a` and `84fae17` are the owner's, unsigned. First round: A (steward's contract lacked the duty) and B (a PR closed unmerged dropped out of the record) were blocking; both closed in `84fae17`. C (the four `lince/review-pr*` record branches) closes when PR #10 merges with their content folded in; then the owner may drop them. Second round: D (which verdict to record on a multi-round PR) is applied by PR #11 (`727dc57`): `notes/steward.md` and steward's home step 2 (`e137c4d`) now say the latest verdict first. E (no shape for a record-only entry) is closed by the record-entry shape in this note's header, added on `steward/reconcile-queue`. Nit, not acted on: steward's home step 1 lists only the last 50 PRs.

## Reconcile the queue and backlog after the merges (steward)
- state: done
- agent: steward
- filed: 2026-10-13 by steward (record; not filed)
- scope: carry #1–#11 into this queue, each PR with lince's latest verdict first; fold in lince's `lince/review-pr{1,5,6,7}` branches; keep [[lab-backlog]] true against `main`. Only `leads/notes/`.
- branch: `steward/reconcile-queue` (`6c6d67f` as first reviewed) — base `main` (`0c12083`), rebased onto `477ae5e` before it was pushed, then `main` (`9afbdcf`) merged in as `8c3f68e` after #6, #8, #9 and #11
- pr: https://github.com/olavostauros/lead-finder/pull/10
- merged: 2026-10-13 09:10 -03 by olavostauros, merge commit `f08b439`, head `54eb4b7`
- review: no blocking findings at `54eb4b7` (latest) by lince, advice only (Tier 3) — https://github.com/olavostauros/lead-finder/pull/10#issuecomment-6145222118. Earlier: request changes at `6c6d67f` — https://github.com/olavostauros/lead-finder/pull/10#issuecomment-6144781468. No GitHub review approval.
- notes: lince's findings at `6c6d67f`: A (no entry for #8), B (the #7 entry said #8 is open), C (`:288`, #6's head and state, the docs/ SHA were stale), F (`b3cd625` is not on `main`), and D and E from #8 (latest verdict first; a record-entry shape). All six are addressed in `54eb4b7`, after the merge `8c3f68e`; lince's second round found them closed. Its three nits: the PR body was the first round's (it is the merge record and stays as it is); the record entries used two `agent:` forms (now one, `olavostauros`, on `steward/sweep-12-14`); the line numbers in the "Standing permission" backlog entry would shift once C was applied (both applied by #13; the diffs carried their own text). The `(owner change)` record entries for #3, #4 and #7 said `olavostauros (owner branch; no agent entry was filed)`; the `filed:` line already says that. The PR was pushed by the owner's seat; steward pushes nothing.

## Define builders by the roster's kind; record the latest verdict (owner change)
- state: done
- agent: olavostauros
- filed: 2026-10-13 by steward (record; not filed)
- scope: `leads/AGENTS.md` and `leads/README.md` give the PR rule to builders, "kind `builder` on `roster.tsv`", and say how steward and lince differ; Tooling names "the builders and judges (the roster's `kind` column)". `notes/steward.md` records lince's latest verdict first; steward's home step 2 says the same (`e137c4d`).
- branch: `owner/lab-wording` (`727dc57`) — base `main` (`7000cd4`)
- pr: https://github.com/olavostauros/lead-finder/pull/11
- merged: 2026-10-13 08:54 -03 by olavostauros, merge commit `1dd2fcb`, head `727dc57`
- review: no blocking findings at `727dc57` (latest) by lince, advice only (Tier 3) — https://github.com/olavostauros/lead-finder/pull/11#issuecomment-6144954672. Earlier: request changes at `81ec32e` — https://github.com/olavostauros/lead-finder/pull/11#issuecomment-6144922291. No GitHub review approval.
- notes: Commits `81ec32e` and `727dc57` are the owner's, unsigned. First round: A ("Agents … open pull requests into `main`" was false for steward and lince) and B (the roster already defined "builder" in its `kind` column) are closed in `727dc57`. Second round, none blocking, filed in [[lab-backlog]]: C (`AGENTS.md:44`, "the owner's seat pushes them", reads as a standing duty), D (`AGENTS.md:241-242` still grants every agent "push the branch, open the PR"), and the nits (two lines over 80 columns; README's "pushes only a review"). The PR body still says the contract "now says 'agents'"; it is the merge record and stays as it is.

## Make "Usar área visível" work at the default zoom on a phone
- state: done
- agent: atlas
- filed: 2026-10-13 by olavostauros (in the session)
- scope: lince's observation outside PR #6, in its second review (https://github.com/olavostauros/lead-finder/pull/6#issuecomment-6144906367): at the default zoom (13) on a 390 px-wide phone, "Usar área visível" gives "Área grande demais (51 km²)", so a phone user's first tap on it fails until they zoom in. It comes from the initial view and the area cap, not from drawing. Make the first tap work on a phone, for example by a narrower initial view on small screens, without raising the cap. Out of scope: the cap's value, draw mode.
- branch: `atlas/visible-area` (`c183601`, head `a87473c`) — base `main` (`9afbdcf`); `main` (`2cf6612`, after #13 and #14) merged in as `33146ba`
- pr: https://github.com/olavostauros/lead-finder/pull/12
- merged: 2026-10-13 09:25 -03 by olavostauros, merge commit `2b08b13`, head `a87473c`
- review: no blocking findings at `50e3bc7` (latest) by lince — https://github.com/olavostauros/lead-finder/pull/12#issuecomment-6145433731. Earlier: request changes at `c183601` — https://github.com/olavostauros/lead-finder/pull/12#issuecomment-6145234354; A and B addressed in `50e3bc7`. Head `a87473c` merged after `main` was merged in (`33146ba`) and low finding C was reworded (`a87473c`), with no further review.
- notes: (steward, 2026-10-13, from the PR and lince's comments; atlas left this entry alone.) The fix is not a narrower initial view: the visible area depends on the screen, so "Usar área visível" fits a view over the 50 km² cap to the largest box with the same centre and proportions under it (`fitUnderCap`), only up to `MAX_FIT_KM2` = 8 × the cap, 400 km² (`fitVisible`); a larger view is refused as before. The map then moves to the box with `fitBounds` (48 px padding, never zooming in). The cap is unchanged. First round: A (medium, blocking: zoomed out, the fitted box was a few pixels or none, and the message pointed at a rectangle that was not there) and B (low: at 390 px the box read as the map's border); both closed in `50e3bc7`. Second round: C (low: after a fit that zooms out, "A área visível tem 51 km²" named the view that was replaced); `a87473c` puts it in the past ("A área que estava visível tinha…"), not reviewed by lince. Gates at `50e3bc7` (lince): 94 tests three times, typecheck, build, lab `mise run test`, diff check, headless Chromium at 390, 1280 and 1920 px with outside hosts blocked; not run: a real phone, Safari, live servers. Open question for the owner, not an entry: the 8× threshold refuses zoom 12 at 1280 px (504,3 km²), where lince measured a fitted box of 270×152 px at `c183601`; the owner's seat accepted 8× as a product choice, per lince's second round, and atlas says raising it is a one-line change.

## Keep a search's outcome when draw mode ends
- state: done
- agent: atlas
- filed: 2026-10-13 by olavostauros (in the session)
- scope: lince's finding B in its second review of PR #9 (https://github.com/olavostauros/lead-finder/pull/9#issuecomment-6145058949). Draw mode and the search share `#status`: while draw mode is open, search events overwrite the draw hint, and `stop()` writes `""` once the runner is no longer busy, so an outcome that arrived during drawing is erased. Recorded: a search ran through four 429s in draw mode, the status became "O servidor do OpenStreetMap está ocupado. Tente de novo em alguns minutos.", and Escape blanked it; "Busca cancelada." disappears the same way. Keep the search's last message, outcome included, and restore it on leaving draw mode, or give draw mode its own hint element. Out of scope: the search's own logic.
- branch: `atlas/draw-status` (`010089a`, head `0f1103b`) — base `main` (`38b9dcb`)
- pr: https://github.com/olavostauros/lead-finder/pull/14
- merged: 2026-10-13 09:22 -03 by olavostauros, merge commit `2cf6612`, head `0f1103b`
- review: no blocking findings at `0f1103b` by lince — https://github.com/olavostauros/lead-finder/pull/14#issuecomment-6145430353
- notes: Draw mode got its own `#draw-hint` line, so `#status` is never written by draw mode and nothing restores it. Browser check at 390 px with a mocked 429: the outcome was blank after Escape on `main` and stays on this branch; "Busca cancelada." the same. No unit test: no DOM test environment in `src/`. Conflicts with #12 in `src/app/main.ts` and this file. (steward, 2026-10-13:) lince checked finding B closed in the diff and in headless Chromium at 320 and 390 px against `main` (`38b9dcb`), a place-search error included. One new low finding C, introduced here: a status written before an area change outlives it; filed as an entry below. Lince's opinion on a mid-stroke layout shift, already on `main`, is filed as an entry below too. Lince's other opinion, not verified with a screen reader and not an entry: `drawHint` sets the text and unhides `#draw-hint` in the same task (`main.ts:39-40`), so some screen readers may not announce the first hint of a draw session, which on `main` went into the always-present `#status`; unhiding before writing the text would keep it announced. #12 merged after this; git merged them without conflicts.

## Say who pushes, and only on whose word (owner change)
- state: done
- agent: olavostauros
- filed: 2026-10-13 by steward (record; not filed). The owner's change for the three [[lab-backlog]] entries from lince's second review of #11.
- scope: `leads/AGENTS.md`: steward pushes nothing, its branches stay local until the owner has the seat push one or discards it; the standing permission is branch and commit, a builder also pushes and opens the PR; the Tooling line wrapped. `leads/README.md`: wrapped, and lince "pushes a branch only to record a review that has no PR".
- branch: `owner/push-rules` (`2211d33`) — base `main` (`f08b439`)
- pr: https://github.com/olavostauros/lead-finder/pull/13
- merged: 2026-10-13 09:12 -03 by olavostauros, merge commit `38b9dcb`, head `2211d33`
- review: no blocking findings at `2211d33` by lince, advice only (Tier 3) — https://github.com/olavostauros/lead-finder/pull/13#issuecomment-6145261903. No GitHub review approval.
- notes: `2211d33` is the owner's, unsigned. Lince found each hunk identical to its backlog entry's diff, no line still granting steward a push, and no changed line over 80 columns. Finding A (low): lince's home step 6 still let lince open a PR for a record branch "if the owner asks", which the contract no longer grants. Applied in lince's home as `671f897` (the owner's, unsigned, 2026-10-13 09:12 -03): step 6 now says "Push the branch; open no PR for it (the contract gives PRs to builders only)". Checked by steward in `~/agents/lince/home/AGENTS.md`; lince's home is private, so this is the only record of it here.

## Clear stale status when the area changes
- state: pr-open
- agent: atlas
- filed: 2026-10-13 by olavostauros (in the session)
- scope: lince's finding C on PR #14 (https://github.com/olavostauros/lead-finder/pull/14#issuecomment-6145430353). A message written to `#status` before an area change stays after an area is drawn or picked: press Buscar with no area, get the red "Escolha uma área primeiro.", draw a rectangle, and the area line reads "Área: desenhada · 3,3 km²" with the red error still below. "Nenhum lugar encontrado." and a place-search error stay the same way; "Usar área visível" and a picked place already did so on `main` before #14. `setArea` should clear `#status` when it sets a new area. Lince notes this is safe for a running search: `runner.cancel("area")` writes "A área mudou…" after `setArea` returns. Out of scope: draw mode's `#draw-hint`, the search's own messages.
- branch: `atlas/status-clear` (`846934a`) — base `main` (`24a15fd`)
- pr: https://github.com/olavostauros/lead-finder/pull/20
- review:
- notes: `setArea` clears `#status` right after `runner.cancel("area")`, on the refused-area path too. Browser check (headless Chromium, CDP, 390x844, Nominatim and Overpass mocked) against builds of `main` and the branch: the stale "Escolha uma área primeiro." after a draw and "Nenhum lugar encontrado." after "Usar área visível" are cleared, and a running search's "A área mudou…" still shows. Not verified: a real phone.

## Reserve the status line's height so the map does not move mid-stroke
- state: pr-open
- agent: atlas
- filed: 2026-10-13 by olavostauros (in the session)
- scope: lince's opinion on PR #14 (https://github.com/olavostauros/lead-finder/pull/14#issuecomment-6145430353), already on `main` before #14. A search that ends during a stroke empties `#status`, its row collapses, and the map moves up 16 px under the finger; the drawn rectangle then grows 16 px, because the stroke's start is a map coordinate and its end a container point. Give `#status` a reserved one-line height so the map does not move when it empties. Out of scope: `#draw-hint` and its own layout shift when draw mode starts or after a tap, which happen outside a stroke.
- branch: `atlas/status-height` (`5978a2b`), base `main` (`24a15fd`)
- pr: https://github.com/olavostauros/lead-finder/pull/19
- review:
- notes: 2026-10-13 atlas. `#status` gets `line-height: 1.25; min-height: 1.25em` (not `1lh`, for Safari before 16.4). CDP check, main vs branch, `#status` filled then emptied: 390x844 map moved 16 px on main, 0 on the branch; 1280x800 0 on both. A two-line message still drops to one line when cleared; not in scope. Not checked on a real phone.

## Keep the map still when a two-line progress message clears
- state: pr-open
- agent: atlas
- filed: 2026-10-13 by olavostauros (in the session)
- scope: lince's finding 1 on PR #19 (https://github.com/olavostauros/lead-finder/pull/19#issuecomment-6146276008). "Buscando “term” no …" (`main.ts:289`) wraps to two lines at 390 px with a long term, sooner at 320 px; when the search ends and clears it (`main.ts:295`), the row drops a line and the map moves up 17.5 px mid-stroke. Keep the map from moving when a status message of any length clears, for example by keeping the progress line to one line with an ellipsis. Out of scope: `#draw-hint`.
- branch: `atlas/status-oneline` (`717092f`), base `main` (`c37eb20`)
- pr: https://github.com/olavostauros/lead-finder/pull/23
- review:
- notes: 2026-10-13 atlas. `status()` takes a tone, `"error"` or `"progress"`; `#status.progress` is one line with an ellipsis (`white-space: nowrap; overflow: hidden; text-overflow: ellipsis`). The full text stays in the DOM, so the live region still reads all of it. Errors and outcomes still wrap: they are cleared only by the user (a new area, a new search), not mid-stroke. CDP check, built main vs branch, Overpass request held with the term "loja de material de construção", then answered empty: 390 and 320 px map moved 17.5 px on main, 0 on the branch; 1280 px 0 on both; no horizontal page overflow. Seen, not in scope: a progress line replaced mid-stroke by a long error ("O servidor do OpenStreetMap está ocupado…") can still grow the row by a line. Not checked on a real phone.

## Announce a refused area to screen readers
- state: pr-open
- agent: atlas
- filed: 2026-10-13 by olavostauros (in the session)
- scope: lince's nit on PR #20 (https://github.com/olavostauros/lead-finder/pull/20#issuecomment-6146281741). `#area-info` (`index.html:26`) is not a live region, so a screen-reader user hears nothing when an area is refused as too large. Make it announce politely (for example `aria-live="polite"`). Out of scope: other live regions, a place search that finishes after the area changes (lince's second nit, same as before #20).
- branch: `atlas/area-live` (`3b12235`) — base `main` (`c37eb20`)
- pr: https://github.com/olavostauros/lead-finder/pull/22
- review:
- notes: `#area-info` is now `role="status" aria-live="polite"`, matching `#draw-hint` and `#status`. It announces every area change, not only a refusal: each change follows a user act (draw, place pick, "Usar área visível") and the line is the only report of its outcome (the area's size, or the shrink note), so it is a confirmation, not chatter; polite waits for the reader to finish. Toggling `aria-live` on only for a refusal was rejected: screen readers track live regions unreliably once the attribute changes. Checked in headless Chromium: role status, live polite, atomic true, for both the shrink and the refusal text.
