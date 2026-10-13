# 0002. The Vite project lives under src/, not the repo root

- Date: 2026-10-09
- By: atlas, accepted by olavostauros on merging PR #1
- Status: accepted

## Context

A Vite app usually keeps `package.json`, `index.html` and its configs at the
repository root. In the lab, `src/` is atlas's directory and the root is
outside every agent's.

## Decision

The whole project, including `package.json`, `index.html`, `tsconfig.json`,
`vite.config.ts` and `.gitignore`, lives in `src/`; the code is in
`src/app/`. Run it with `cd src && npm install && npm run dev`.

## Consequences

The app's builder can change its tooling without crossing into another
agent's area. The cost is one extra `cd`, and CI or hosting must use `src/`
as the project root and `src/dist/` as the output.
