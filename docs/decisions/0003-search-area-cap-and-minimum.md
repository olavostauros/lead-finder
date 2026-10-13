# 0003. Search areas are capped at 50 km² and widened to at least 2 × 2 km

- Date: 2026-10-09
- By: atlas, accepted by olavostauros on merging PR #1
- Status: accepted

## Context

The brief asks for an area cap so one search cannot exhaust a provider's
quota. Overpass is a shared public service with no key. Separately, a manual
test found that Nominatim often ranks a point (a station, an address) above
the district of the same name: searching "Pinheiros" picked the station, a
0 km² box, and returned nothing.

## Decision

- `MAX_AREA_KM2 = 50` (`src/app/area.ts`). A larger area is refused before
  any request, with a pt-BR message.
- A place whose box is narrower than 2 km on either side is widened to 2 km
  around its centre (`widenToMinimum`), and results with the same label are
  collapsed to the largest.

## Consequences

50 km² covers a large neighbourhood (Pinheiros is about 16 km²) but not a
whole city: searching São Paulo means drawing several areas. A point-like
place gives a search of about 4 km² around it rather than nothing.
