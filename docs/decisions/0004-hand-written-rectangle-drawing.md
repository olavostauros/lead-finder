# 0004. Draw the search rectangle with pointer events, not leaflet-draw

- Date: 2026-10-09
- By: atlas, accepted by olavostauros on merging PR #1
- Status: accepted

## Context

The brief keeps runtime dependencies few and needs map gestures to work on
touch screens. `leaflet-draw` would provide rectangles and circles, but it
is a sizeable plugin with its own toolbar and CSS.

## Decision

Draw the rectangle with about 40 lines in `src/app/main.ts`, using pointer
events on the map container and `touch-action: none` while drawing.
`leaflet` stays the only runtime dependency.

## Consequences

The drawing code is ours to maintain. Review of PR #1 found gaps: no
`pointercancel` handling, a second finger restarts the rectangle, a tap
reads as a 0 km² area, and there is no way to cancel. Circle drawing, also
in the brief, is not built yet. If those grow, revisit with a new decision.
