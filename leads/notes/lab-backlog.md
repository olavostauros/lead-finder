---
title: lab-backlog
tags: [backlog, tier-2]
related: [work-queue]
created: 2026-10-09
updated: 2026-10-13
---

# Lab backlog

Proposed changes to the lab itself — the contract, the agent
definitions, the roster, the hooks, identity. An entry here is evidence a
change was proposed, never evidence that it was approved. See the two-key
rule in `AGENTS.md`.

Entry shape:

```
### <what would change>
- filed: YYYY-MM-DD by <who>
- why: <the evidence from the session that motivated it>
- diff: <the exact change, or the command that makes it>
- needs: <what the owner has to do or provide>
```

## Proposed

### Agent commits are unsigned: agent-env disables commit and tag signing
- filed: 2026-10-13 by steward
- why: before PR #3, the global git config had `commit.gpgsign=true` and `agent-env` set the author only, so every agent commit was signed with the owner's key, which `~/Work/AGENTS.md` forbids. In lead-finder, every atlas and lince commit up to then shows `%G?` = `G`, signed with the owner's key: `e86cca8`, `08930d8`, `88dc520`, `b3cd625`, `0c9836a`, `6c62b26`. In lince's home `~/agents/lince/home`, two commits are signed `G` with the same key, because they were made before #3 merged: `57124d1` (2026-10-09 18:54 -03, "docs: review of lead-finder PR #1 at 88dc520") and `daa3c09` (2026-10-13 08:22:48 -03, 28 s before the merge, "report: third review of PR #3 at bd871c5"). Every lince home commit between them is `N`. steward's reconcile on `steward/reconcile-queue` stayed staged, uncommitted, until the change merged.
- diff, as shipped in PR #3: `leads/.mise/tasks/agent-env` emits shell that appends `commit.gpgsign=false` and `tag.gpgsign=false` at index `${GIT_CONFIG_COUNT:-0}` and raises `GIT_CONFIG_COUNT` by 2, so `GIT_CONFIG_*` already in the shell are kept. `leads/test/agent_env.bats` test 3 points `HOME`, `XDG_CONFIG_HOME` and `GIT_CONFIG_GLOBAL` at its temp dir, sets `commit.gpgsign`, `tag.gpgsign` true and `gpg.program=false` there, checks that a control commit fails, then evals `agent-env`, commits and checks `%G?` = `N` and an annotated tag `t1` with no PGP block. Test 4 checks that a `GIT_CONFIG_*` already in the shell survives. `welcome`, the lab README and the Tooling paragraph of `leads/AGENTS.md` say the same.
- needs: nothing for the change. The owner decides whether the commits signed with his key before the change stay as they are or are amended. Of the six in lead-finder, five are on `main`; `b3cd625` is on `lince/review-pr1` (local and `origin`) only, and goes away if that branch is dropped (checked by steward on 2026-10-13 with `git merge-base --is-ancestor` against `main` at `9afbdcf`). The two in lince's home are local. lince's opinion on PR #3 (comment 6144316892) was to leave the merged ones.
- status: applied. PR #3 (`owner/unsigned-agent-commits` (`bd871c5`)) merged by olavostauros on 2026-10-13 08:23 -03 as `5dfa292`; its commits `10183dc`, `17ffa15`, `bd871c5` are the owner's, unsigned (`%G?` = `N`). lince's reviews are the PR #3 comments 6144316892 (request changes at `10183dc`), 6144386194 (request changes at `17ffa15`: the test wrote the owner's global git config, finding A) and 6144431576 (no blocking findings at `bd871c5`, one low finding B, filed below). Those verdicts are advice; GitHub shows no review approval on #3, and the owner's approval is visible only as his merge. Checked by steward on `main` (`3c1e9b3`) on 2026-10-13: after `agent-env steward`, `git config --get commit.gpgsign` is `false` from the command line, and this entry was committed unsigned.

### Test 3 of agent_env.bats isolates git config but not the repository
- filed: 2026-10-13 by steward, from lince's low finding B on PR #3 (comment 6144431576)
- why: test 3 ("agent-env turns off commit and tag signing") runs `git -C "$repo" commit` and `git -C "$repo" tag`, and an exported `GIT_DIR` overrides `-C`. lince reproduced it: with `GIT_DIR` pointing at a sandbox repo, the test passed and the sandbox repo gained a `signed-off` commit and a tag `t1`. A git hook exports `GIT_DIR` and `GIT_INDEX_FILE`, so if the suite ever ran from a hook (or under `git rebase --exec`), it would put an unsigned commit and a tag `t1` into lead-finder. Nothing does that today: checked by steward on 2026-10-13, the only hook is `.git/hooks/pre-commit` → `leads/hooks/agent-identity`, which does not run the suite, and there is no CI.
- diff: in `leads/test/agent_env.bats`, test 3, extend the existing `unset`:
  ```
  -  unset GIT_CONFIG_COUNT GIT_CONFIG_KEY_0 GIT_CONFIG_VALUE_0 GIT_CONFIG_KEY_1 GIT_CONFIG_VALUE_1
  +  unset GIT_CONFIG_COUNT GIT_CONFIG_KEY_0 GIT_CONFIG_VALUE_0 GIT_CONFIG_KEY_1 GIT_CONFIG_VALUE_1 \
  +    GIT_DIR GIT_WORK_TREE GIT_INDEX_FILE GIT_COMMON_DIR
  ```
- needs: nothing; applied.
- status: applied. PR #7 (`owner/lab-followups` (`debced0`)) merged by olavostauros on 2026-10-13 08:34 -03 as `ec4ea69`; `debced0` is the owner's, unsigned. It ships the four names as a second `unset` line rather than a continuation, same effect. lince's review: no blocking findings at `debced0` (comment 6144581754), with the `GIT_DIR` reproduction repeated: nothing written to the sandbox repo.
- open nit (lince, PR #7): `GIT_OBJECT_DIRECTORY` is not unset either. It matters only under a server-side quarantine, so no entry; if the owner wants it, the diff is `-  unset GIT_DIR GIT_WORK_TREE GIT_INDEX_FILE GIT_COMMON_DIR` / `+  unset GIT_DIR GIT_WORK_TREE GIT_INDEX_FILE GIT_COMMON_DIR GIT_OBJECT_DIRECTORY` in test 3.

### Make new files in docs/ free (Tier 1) for every agent
- filed: 2026-10-13 by atlas
- why: on 2026-10-13 the owner asked for a `docs/` directory for decisions and notes and chose "shared, append-only" ownership in the session. `docs/` is outside every agent's directory, so today any write there is Tier 2. Recorded as `docs/decisions/0001-record-decisions-in-docs.md`.
- diff: in `leads/AGENTS.md`, "Tier 1 — free to change", add after the "Any note in `notes/`…" item:
  ```
  - A **new** file in `~/Work/lead-finder/docs/` (a decision or a note), on a
    topic branch. Editing or deleting an existing file there stays Tier 2,
    except a typo or broken-link fix.
  ```
  and in "Tier 2 — propose, do not apply", change the first words of the "Anything in the work tree **outside** your own directory" item to:
  ```
  - Anything in the work tree **outside** your own directory and this
    lab's, other than a new file in `docs/` —
  ```
  In the project brief `AGENTS.md`, "Layout" block, add the line:
  ```
  docs/     decisions and notes about the product (shared, append-only)
  ```
- needs: nothing; applied.
- status: applied. PR #17 (`owner/docs-tier1` (`7ee400f`)) merged by olavostauros on 2026-10-13 10:03 -03 as `24a15fd`; `f510a5e` and `7ee400f` are the owner's, unsigned. `f510a5e` applied the three edits, with the Tier 1 preamble's count raised from three lines to four; after lince's request changes at `f510a5e` (comment 6145794553), `7ee400f` carried the exception into the Tier 2 sentence for an agent that owns nothing and into `notes/atlas.md`, `notes/steward.md` and `notes/lince.md`. lince: no blocking findings at `7ee400f` (comment 6145855925). Checked by steward on `main` (`bb1f040`): the Tier 1 line, the Tier 2 words and the brief's Layout line are there. Left open by lince: the agents' homes still confine them to `src/` or `leads/notes/` (the owner's choice); C, no loosenings row for the widening (the owner's call); E, filed below.

### Name the owner's seat in the contract and give it a loop
- filed: 2026-10-13 by olavostauros
- why: "Who are you?" made the session the owner types into ask which agent it was. On 2026-10-13 the owner ran the loop by hand (orient, file, delegate, chain, relay) and asked in his own turn for it to be taught to the contract and the agents.
- diff: PR #4 (`owner/session-loop`): split the unset-identity case in "Who are you?"; add "The owner's seat" (authority) to `leads/AGENTS.md` with a Read-first row; add the loop to `notes/lab-style.md`; make lince's review of every builder PR into `main` a standing filing (`leads/AGENTS.md`, `notes/lince.md`, lince's home step 4). The last item was added by steward on 2026-10-13 from what merged, per lince's nit D (comment 6144439039).
- needs: nothing; applied.
- status: applied. PR #4 (`owner/session-loop` (`04c56a0`)) merged by olavostauros on 2026-10-13 08:24 -03 as `3c1e9b3`; its commits `6d0fb4e`, `fcd1fc9`, `04c56a0` are the owner's, unsigned. lince's reviews are the PR #4 comments 6144348695 (request changes at `6d0fb4e`), 6144400771 (no blocking findings at `fcd1fc9`) and 6144439039 (no blocking findings at `04c56a0`). Minor finding C from the last one (the standing filing said "builder's" PR while lince's charge is every PR into `main`) is applied by PR #7 (`debced0`, merged as `ec4ea69`): `leads/AGENTS.md`, `notes/lince.md` and [[lab-style]] now say "every pull request into `main`", the first adding "the owner's and steward's included". Still undefined: "builder" elsewhere, filed below.

### Say who "builders" are, or stop using the word
- filed: 2026-10-13 by steward, from lince's nit on PR #7 (comment 6144581754)
- why: PR #7 took "builder" out of the standing filing, but the contract still uses it undefined: `leads/AGENTS.md:43` ("Builders work on topic branches…"), `:288` ("Whether the builders and judges get accounts…"; `:289` after PR #8) and `leads/README.md:15`. The roster has no such role; lince, which owns no directory, cuts branches too. Corrected by lince on PR #11 (finding B, comment 6144922291): the premise was partly wrong. `roster.tsv` has a `kind` column, in which atlas is `builder` and lince is `judge`; there is no such *role*, but there is such a kind.
- diff:
  ```
  leads/AGENTS.md:43   - Builders work on topic branches and open pull requests into `main`. None
                       + Agents work on topic branches and open pull requests into `main`. None
  leads/AGENTS.md:288  - credentials and says so in the PR body. Whether the builders and judges
                       + credentials and says so in the PR body. Whether the agents other than steward
  leads/README.md:15   - Builders work on `<name>/<topic>` branches and open pull requests into
                       + Agents work on `<name>/<topic>` branches and open pull requests into
  ```
- needs: nothing; applied the second way.
- status: applied, by defining "builder" rather than by this diff. PR #11 (`owner/lab-wording` (`727dc57`)) merged by olavostauros on 2026-10-13 08:54 -03 as `1dd2fcb`. Its first commit `81ec32e` applied this diff; lince requested changes (comment 6144922291) because "Agents … open pull requests into `main`" was false for steward and lince. `727dc57` replaced it: `leads/AGENTS.md:43-45` and `leads/README.md:15-17` give the PR rule to builders, "kind `builder` on `roster.tsv`", with steward's and lince's exceptions, and `:291-292` says "the builders and judges (the roster's `kind` column)". lince: no blocking findings at `727dc57` (comment 6144954672); its new points are filed below.

### Steward's branches are pushed only on the owner's word
- filed: 2026-10-13 by steward, from lince's finding C in its second review of PR #11 (comment 6144954672)
- why: `leads/AGENTS.md:44-45` (on `main` at `9afbdcf`) says "Steward's branches stay local; the owner's seat pushes them", which reads as a standing duty of the seat. But `:91-92` says the seat acts as the owner "only on his word in his own turn, for that act: commit, push, open a PR", and `notes/steward.md` gives the owner a third outcome: he "merges the branch or discards it". A seat running its loop could push an unpushed `steward/<topic>` branch as routine when the owner meant to discard it. `leads/README.md:16` says only "stay local", which is true as it stands.
- diff, in `leads/AGENTS.md`:
  ```
  -pull requests into `main`. Steward's branches stay local; the owner's seat
  -pushes them. Lince pushes a branch only to record a review that has no PR.
  +pull requests into `main`. Steward pushes nothing: its branches stay local
  +until the owner has the seat push one, or discards it. Lince pushes a
  +branch only to record a review that has no PR.
  ```
- needs: nothing; applied.
- status: applied. PR #13 (`owner/push-rules` (`2211d33`)) merged by olavostauros on 2026-10-13 09:12 -03 as `38b9dcb`; `2211d33` is the owner's, unsigned. lince: no blocking findings at `2211d33` (comment 6145261903), each hunk identical to this entry's diff. `leads/AGENTS.md:44-46` on `main` (`2b08b13`) is the `+` text.

### Standing permission: only builders push and open PRs
- filed: 2026-10-13 by steward, from lince's finding D in its second review of PR #11 (comment 6144954672)
- why: `leads/AGENTS.md:241-243` (on `main` at `9afbdcf`), under the loosenings table: "Until a row exists, each agent's standing permission is exactly Tier 1: branch, commit, push the branch, open the PR." That grants every agent a push and a PR. It contradicts `:43-45`, where only builders open PRs, steward's branches stay local and lince pushes only a record branch for a review with no PR, and it contradicted `notes/steward.md` ("no comment, no PR, no push") before #11. The text is older than #11; #11 made `:43` precise and so exposed it. The diff narrows the line to what `:43-45` already says; it widens nothing.
- diff, in `leads/AGENTS.md`:
  ```
   Until a row exists, each agent's standing permission is exactly Tier 1:
  -branch, commit, push the branch, open the PR. Merging into `main` is the
  -owner's.
  +branch and commit. A builder also pushes its branch and opens the PR;
  +steward and lince push only as "Who lives here" says. Merging into `main`
  +is the owner's.
  ```
- needs: nothing; applied.
- status: applied. PR #13 (`owner/push-rules` (`2211d33`)) merged by olavostauros on 2026-10-13 09:12 -03 as `38b9dcb`; `2211d33` is the owner's, unsigned. lince: no blocking findings at `2211d33` (comment 6145261903), each hunk identical to this entry's diff. `leads/AGENTS.md:243-245` on `main` (`2b08b13`) is the `+` text, after the context line `:242` (corrected from `:242-245` per lince's nit on #16, comment 6145794118); with C applied first, the old `:241-243` became `:242-244`, as lince's nit on #10 foresaw.

### Wrap two long lines, and say lince pushes a branch, in AGENTS.md and README.md
- filed: 2026-10-13 by steward, from lince's nits in its second review of PR #11 (comment 6144954672)
- why: `leads/AGENTS.md:292` (94 columns) and `leads/README.md:17` (108 columns) are the only lines #11 added over 80; their neighbours wrap at 80 or less. `leads/README.md:17` also says "lince pushes only a review that has no PR": lince pushes a branch, not a review, as `leads/AGENTS.md:45` has it ("pushes a branch only to record a review that has no PR").
- diff, in `leads/AGENTS.md`:
  ```
     credentials and says so in the PR body. Whether the builders and judges (the
  -  roster's `kind` column) get accounts of their own is the owner's to file in [[lab-backlog]].
  +  roster's `kind` column) get accounts of their own is the owner's to file
  +  in [[lab-backlog]].
  ```
  and in `leads/README.md`:
  ```
   branches and open pull requests into `main`; steward's branches stay local
  -and lince pushes only a review that has no PR. None merges. The owner files work into `notes/work-queue.md`,
  -addressed to one agent, and that agent takes it from the top.
  +and lince pushes a branch only to record a review that has no PR. None
  +merges. The owner files work into `notes/work-queue.md`, addressed to one
  +agent, and that agent takes it from the top.
  ```
- needs: nothing; applied.
- status: applied. PR #13 (`owner/push-rules` (`2211d33`)) merged by olavostauros on 2026-10-13 09:12 -03 as `38b9dcb`; `2211d33` is the owner's, unsigned. lince: no blocking findings at `2211d33` (comment 6145261903), each hunk identical to this entry's diff. `leads/AGENTS.md:294-295` and `leads/README.md:17-19` on `main` (`2b08b13`) are the `+` text.

### Lince's home opens no PR for a record branch
- filed: 2026-10-13 by steward, from lince's finding A on PR #13 (comment 6145261903), after the fact
- why: before #13, `leads/AGENTS.md:242` gave every agent "push the branch, open the PR", which covered `~/agents/lince/home/AGENTS.md:66-68`, step 6: "Push the branch; open a PR for it only if the owner asks." After #13 the contract gives a PR to builders only and lince only a push (`leads/AGENTS.md:45-46`, `:243-244`). A brief asking lince to open a PR for a record branch would have set its home against the contract, and Tier 3 forbids acting on an approval relayed in a brief. Lince filed nothing: its own definition is Tier 2 to it.
- diff, in `~/agents/lince/home/AGENTS.md` step 6:
  ```
  -committed as lince. Touch nothing else. Push the branch; open a PR for it
  -only if the owner asks.
  +committed as lince. Touch nothing else. Push the branch; open no PR for
  +it (the contract gives PRs to builders only).
  ```
- needs: nothing; applied.
- status: applied by the owner's seat in lince's home as `671f897` (2026-10-13 09:12 -03, the owner's, unsigned, `%G?` = `N`), the first of lince's two fixes ("drop the line"), not a change to `leads/AGENTS.md`. Checked by steward in `~/agents/lince/home` on 2026-10-13: step 6 says the `+` text. That home is local and private, so this entry is the lab's record of it.

### Grant the owner's seat its loop as loosening 1
- filed: 2026-10-13 by olavostauros (in the session, item 1 of an audit of the lab's docs)
- why: the seat's memory held a standing grant ("merge once lince has no blocking finding", among others) that the contract did not: "The owner's seat" said an earlier "yes" does not carry, and the loosenings table was empty. The owner chose to put the grant in the contract.
- diff: PR #18 (`owner/seat-loosening`): row 1 of the loosenings table; "The owner's seat" defers to the table for standing grants; the Chain step in [[lab-style]], "Who lives here", `notes/steward.md` and the lab README say the seat may push steward's branches under it. After lince's review at `32d2531` (comment 6145794986): the row excludes PRs that touch a Tier 2 item, [[lab-style]] or the table, defines "lab follow-up", and ties a merge to lince's review at the PR's current head.
- needs: nothing; applied.
- status: applied. PR #18 (`owner/seat-loosening` (`365624c`)) merged by olavostauros on 2026-10-13 10:03 -03 as `7734748`; `32d2531`, `9a0ac47` (a merge of `main` `e4b0953`) and `365624c` are the owner's, unsigned. lince: request changes at `32d2531` (comment 6145794986, A high and B medium blocking), then no blocking findings at `365624c` (comment 6145856316), the head that merged. Row 1 is on `main` (`bb1f040`) at `leads/AGENTS.md:241`. Its second round's G, H and nit are filed below.

### Say on the README who pushes steward's branches, and wrap two lines
- filed: 2026-10-13 by steward, from lince's finding G and nit in its second review of PR #18 (comment 6145856316)
- why: `leads/README.md:17` on `main` (`bb1f040`) says steward's branches "stay local until the owner's seat pushes them". That drops both "on the owner's word or under the loosenings" and "or the owner discards it", which `leads/AGENTS.md:44-46` says; it is the standing-duty reading the entry "Steward's branches are pushed only on the owner's word" took out of the contract in #13. The line is 106 columns; `leads/AGENTS.md:97` is 87. #13 wrapped lines like these.
- diff, in `leads/README.md`:
  ```
   Builders (kind `builder` on `roster.tsv`) work on `<name>/<topic>`
   branches and open pull requests into `main`; steward's branches stay local
  -until the owner's seat pushes them, and lince pushes a branch only to record a review that has no PR. None
  -merges. The owner files work into `notes/work-queue.md`, addressed to one
  -agent, and that agent takes it from the top.
  +until the seat pushes one, on the owner's word or under the loosenings, or
  +the owner discards it; lince pushes a branch only to record a review that
  +has no PR. None merges. The owner files work into `notes/work-queue.md`,
  +addressed to one agent, and that agent takes it from the top.
  ```
  and in `leads/AGENTS.md`:
  ```
   [the loosenings](#the-loosenings) grants the seat a standing one. Its
  -commits use `LEADS_OWNER_COMMIT=1` and are unsigned (`git -c commit.gpgsign=false`); it
  -never signs with the owner's key. It never puts `LEADS_OWNER_COMMIT` in a
  +commits use `LEADS_OWNER_COMMIT=1` and are unsigned
  +(`git -c commit.gpgsign=false`); it never signs with the owner's key. It
  +never puts `LEADS_OWNER_COMMIT` in a
  ```
- needs: the owner applies it in his own turn; it touches `leads/AGENTS.md` and the README, so row 1 does not cover it.

### Say whose Tier 2 row 1's exclusion means
- filed: 2026-10-13 by steward, from lince's finding H in its second review of PR #18 (comment 6145856316)
- why: row 1 (`leads/AGENTS.md:241` on `bb1f040`) excludes "a PR that touches a Tier 2 item", but Tier 2 is written per agent ("outside your own directory"), and the seat owns no directory and has no Tier 1. A strict reader finds every PR is Tier 2 for the seat, so the merge grant never applies; a loose one reads an atlas PR under `src/` as Tier 1 for atlas. The exclusion holds under either reading; only the merge grant's reach is unclear. Since row 1, the seat has merged #19 to #24 on lince's verdicts, reading it the loose way.
- diff, in row 1 of the loosenings table:
  ```
  -A PR that touches a Tier 2 item, [[lab-style]] or this table is not a follow-up
  +A PR that touches a Tier 2 item for the PR's author, or `leads/AGENTS.md`, `hooks/*`, `.mise/*`, `roster.tsv`, [[lab-style]] or this table, is not a follow-up
  ```
  (the row is one table line; only these words change.)
- needs: the owner decides and applies it in his own turn; it changes the loosenings table.

### Let atlas's Stance name the docs/ exception
- filed: 2026-10-13 by steward, from lince's finding E in its second review of PR #17 (comment 6145855925)
- why: `notes/atlas.md:22-23` on `main` (`bb1f040`) makes a new file in `docs/` atlas's one exception, but its Stance, `:37-38`, still says the smallest diff is "under `src/` and nowhere else". Atlas asked to record a decision with a fix would follow the narrower line and stop. It widens what atlas may do, so it is Tier 2 to steward, not a fact fix.
- diff, in `leads/notes/atlas.md`:
  ```
   watch fail is a claim, not a fix. The smallest diff that answers the entry,
  -under `src/` and nowhere else; a change that wants to reach further is
  +under `src/` and nowhere else but a new file in `docs/`; a change that
  +wants to reach further is
  ```
  with the rest of the paragraph rewrapped.
- needs: the owner applies it in his own turn; atlas's home (`~/agents/atlas/home/AGENTS.md:81`) still confines atlas to `src/` and `leads/notes/` either way.
