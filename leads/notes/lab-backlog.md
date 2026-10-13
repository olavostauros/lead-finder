---
title: lab-backlog
tags: [backlog, tier-2]
related: [work-queue]
created: 2026-10-09
updated: 2026-10-09
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
- needs: the owner applies the three edits in their own turn. Until then, agents add `docs/` files only through a PR the owner merges.
