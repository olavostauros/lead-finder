# lead-finder

A lead finder for the Brazilian market that runs entirely in the browser.
The user picks an area on a map and a kind of business ("padaria",
"academia", "dentista"), and gets a list of the businesses found there with
name, phone, address and a link to the source. They can then export the
list. There is no backend: every request goes from the user's browser to a
public map API.

This file is the brief for anyone working on the code: what the product is
and which constraints the code must meet. The agents' contract (who may do
what, the queue and the review flow) is [`leads/AGENTS.md`](leads/AGENTS.md).
Read that one first if you are an agent of the `leads` lab.

## Audience

- Brazilian small-business owners, freelancers and sales reps, using a phone
  as often as a desktop.
- The interface is in **pt-BR** only: copy, number and date formats, and
  error messages. Code, commits and docs are in English.
- Phones are shown in Brazilian format, `(11) 91234-5678`, with a
  `wa.me/55…` link when the number is a mobile.

## Product, first version

1. **Choose the area.** Search a city or neighbourhood, or draw a rectangle
   or circle on the map. Cap the area so one search cannot exhaust a quota.
2. **Choose what to look for.** A free-text term, plus a short list of
   common categories in Portuguese.
3. **Search.** Query the provider, deduplicate, and show a table and map
   pins as results arrive.
4. **Use the results.** Filter to "has phone", copy, and export CSV
   (UTF-8 with BOM, so Excel opens it correctly).

Out of scope for now: accounts, server storage, sending messages, and
enrichment from CNPJ registries.

## Data sources

| Provider | Key | Phones | Export |
|---|---|---|---|
| OpenStreetMap: Overpass for POIs, Nominatim for place search | none | sparse in Brazil | allowed under ODbL with attribution |
| Google Places API (New), Text/Nearby Search | user's own key, restricted to the site's HTTP referrer | good coverage | restricted by Google Maps Platform terms; check before shipping export for this source |

Default to OSM so the app works with no key. Google is opt-in: the user
pastes their own key, which stays in their browser and is never committed,
logged or sent anywhere except to Google. Every provider sits behind one
interface (`search(area, query) → Lead[]`) so a third can be added without
touching the UI.

## Rules for the code

- **No backend and no secrets in the repo.** The build is static files. An
  API key in source, in a fixture or in a commit is a bug.
- **Respect the providers.** Nominatim: at most one request per second, a
  real `Referer`, no autocomplete-on-keystroke. Overpass: bounded areas,
  query timeouts, and back off on 429. Show OSM attribution wherever OSM
  data appears.
- **LGPD.** Business contact data can still be personal data (a MEI's phone
  is a person's phone). Collect only what is shown, keep results in the
  browser, and tell the user in the UI that they are responsible for how
  they contact leads. No analytics that carry search results.
- **Small and dependency-light.** Static build, TypeScript, a map library
  (Leaflet with OSM tiles by default). Each new runtime dependency needs a
  reason in the PR.
- **Works on a phone.** The layout, the map gestures and the export all have
  to work on a narrow touch screen.

## Layout

```
src/      the app (owned by atlas)
docs/     decisions and notes about the product (shared, append-only)
leads/    the agents' lab: contract, roster, queue, notes
```
