# 0001. Record product decisions and notes in docs/, append-only

- Date: 2026-10-13
- By: olavostauros
- Status: accepted

## Context

Decisions were being made in PR bodies, queue notes and chat sessions, where
they are hard to find later. `leads/notes/` exists but is about how the
agents' lab runs, not about the product.

## Decision

Keep product decisions in `docs/decisions/` and learned facts in
`docs/notes/`. The directory is shared and append-only: anyone may add a
file; changing or removing an existing one is the owner's call.

## Consequences

A decision is changed by adding a newer one, so the history is readable in
place. Letting agents add files here as free (Tier 1) work needs a line in
the lab contract; until the owner adds it, an agent's new file here goes
through a PR the owner merges, like any other change outside its directory.
