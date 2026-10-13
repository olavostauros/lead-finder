---
title: lab-style
tags: [style, practice]
related: [lab-backlog, work-queue]
created: 2026-10-09
updated: 2026-10-13
---

# Lab style

How this lab prefers its work done. Practice, not authority: the contract
says what an agent may do, this note says how the lab likes it done —
small reviewable branches, merges that keep history, failures said out
loud, nothing left unpushed or undocumented. The framework wrote it and the
owner changes it, in the owner's own turn; an agent that thinks a line here
is wrong files against it in [[lab-backlog]] rather than editing it.

**Push back when something smells off.** If the owner proposes something
over-engineered, premature, or unnecessary, say so — clearly, with reasoning.
A good "I don't think we need this yet, here's why" is worth more than
agreeable silence.

**Never silently skip failures.** If a command, tool, or auth step fails, say
so immediately. Observed failures are work: fix them, file them, or ask for
help.

**Plan before you act.** In interactive sessions, explain the plan first —
what changes, why, and the risks. Wait for approval before writing code.
Permission to run without confirmation prompts is not permission to skip
human approval on decisions.

**Test before you commit; start narrow.** Begin with the smallest checks that
exercise the change, then broaden. A commit that breaks relevant tests is
worse than no commit. If tests don't exist for your change, write them.

**Doc-check before you commit.** If you changed behavior, check whether a note
in `notes/` needs updating.

**Comments carry constraints, not narrative.** The ideal is no comments at
all. Delete the comment and ask whether a competent editor could now
reintroduce a defect the comment was preventing; if yes it stays, otherwise
it goes. No decorative separators, no banners, no boxes.

**Cite a branch by its SHA.** In notes and queue entries, write a branch as
`` `name` (`sha`) `` on first mention. Branch names are borrowed; SHAs are not.
Do not add a SHA to remote-tracking refs, repositories, or credential keys.

**Merge, don't squash.** `gh pr merge --merge`. Keep branch commits clean
before merging; the branch is the narrative.

**Small PRs, and never stacked.** Every PR is cut fresh from a synced `main`
and stands on its own. One reviewable idea per PR. If you find yourself
needing a stack, stop and say so — it is a scoping mistake surfacing late.

**Always work on a branch.** `main` is somewhere you merge into, never
somewhere you commit. `<name>/<short-topic>`, kebab-case, what the work does.

**Unpushed is invisible.** Report work as *pushed* or *unpushed*, never as
"done". Before asking anyone to look at a PR, `git rev-list --count @{u}..HEAD`
must be `0` — and a branch with no upstream reports nothing rather than
everything, so check `git branch -vv` too.

**No footers.** No AI attribution, no `Co-Authored-By` lines, no emoji
markers. Clean conventional commit messages only.

**Know when to abort.** If you're fundamentally blocked — missing credentials,
service down, permissions error — say so plainly, on its own line, and stop.
Silent non-accomplishment is worse than visible failure.

**Clean up before you leave.** `git status` on every repo you touched; push or
say what is unpushed and why; update your scratchpad; write down what you
learned in the right `notes/<topic>.md`, not what you did. The next session —
you or a labmate — starts from a known-clean state.

**The owner's seat runs a loop.** The owner says what he wants; the seat
does the rest without being walked through it.

1. *Orient.* On "resume work" or the like: the [[work-queue]], the
   [[lab-backlog]], `gh pr list --state all`, `git branch -vv`,
   `git worktree list`, and the scratchpad of each agent on `roster.tsv`
   (`~/agents/<name>/home/SCRATCHPAD.md`; steward's is
   `~/agents/leads/home/SCRATCHPAD.md`). Say in prose what is open and what
   waits on the owner.
2. *File.* The owner's ask in his own turn becomes queue entries, one
   reviewable idea each, each to the agent whose charge it is, `filed:
   <date> by <owner> (in the session)`. Nothing he did not ask for.
3. *Delegate.* One subagent per agent, briefed with its name, the entry,
   the branch and what blocks it. It activates and checks identity first,
   from anywhere:

   ```
   eval "$(mise -C ~/Work/lead-finder/labs/leads run -q agent-env <name>)" && [ "$GIT_AUTHOR_NAME" = <name> ]
   ```

   It works in a
   worktree under `~/agents/<name>/`; the shared checkout stays on `main`.
   Independent agents run in parallel.
4. *Chain.* The owner files these standing, so the seat names them in the
   brief: every pull request into `main` gets a lince review, recorded by
   its PR comment; every merge or close gets a steward sweep, which
   carries the reviews, merges and closes into the queue.
   A finding is filed and delegated, and a clean review merged, as far
   as [the loosenings](../AGENTS.md#the-loosenings) grant; a blocker, or
   anything past them, goes back to the owner. Nothing else starts
   without him.
5. *Relay.* Pass each hand-back on as it stands. An agent that stops on a
   rule is right until the owner changes the rule on `main`.

Every agent ends a run with a hand-back the seat can relay unedited: entry
and branch, SHA, pushed or unpushed, verified, not verified, what blocks,
the next step in the chain.
