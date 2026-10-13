# OSM phone coverage, first measurement

- Date: 2026-10-09
- Source: manual test of PR #1 against the live Overpass API

Searching "padaria" in Pinheiros, São Paulo (about 16 km²) returned 33
named bakeries after deduplication, 10 of them with a phone (about 30%).
Several had no address either.

This matches the brief's "sparse in Brazil" and is one data point, not a
survey. It is the main argument for the opt-in Google Places provider; the
"has phone" filter will cut OSM results by roughly two thirds.
