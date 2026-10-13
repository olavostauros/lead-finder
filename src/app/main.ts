import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "./style.css";
import { checkArea, formatKm2, MAX_AREA_KM2 } from "./area";
import { CATEGORIES } from "./categories";
import { RectGesture, suspend, type Point } from "./draw";
import { NominatimGeocoder, type Place } from "./nominatim";
import { OverpassProvider } from "./overpass";
import { SearchRunner } from "./search-run";
import type { Area, BBox, Lead, Provider } from "./types";

const $ = <T extends HTMLElement>(id: string) => document.getElementById(id) as T;

const provider: Provider = new OverpassProvider();
const geocoder = new NominatimGeocoder();
const runner = new SearchRunner(provider);

const map = L.map("map").setView([-23.5505, -46.6333], 13);
L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
  maxZoom: 19,
  attribution: '© <a href="https://www.openstreetmap.org/copyright">colaboradores do OpenStreetMap</a>',
}).addTo(map);
map.attributionControl.setPrefix(false);

const areaLayer = L.layerGroup().addTo(map);
const pinLayer = L.layerGroup().addTo(map);
let area: Area | undefined;
let stopDrawing: (() => void) | undefined;

const status = (msg: string, error = false) => {
  const el = $("status");
  el.textContent = msg;
  el.classList.toggle("error", error);
};

// Draw mode has its own line: on #status it would hide a search's progress, and clearing it would erase the outcome.
const drawHint = (msg?: string) => {
  const el = $("draw-hint");
  el.textContent = msg ?? "";
  el.hidden = msg === undefined;
};

const toBBox = (b: L.LatLngBounds): BBox => ({
  south: b.getSouth(),
  west: b.getWest(),
  north: b.getNorth(),
  east: b.getEast(),
});

function clearResults() {
  $("results").querySelector("tbody")!.replaceChildren();
  pinLayer.clearLayers();
  $("count").textContent = "";
}

function setArea(bbox: BBox, label?: string): boolean {
  runner.cancel("area");
  // Results on screen belong to the area being left; they must not sit under the new label.
  clearResults();
  const check = checkArea(bbox);
  areaLayer.clearLayers();
  if (!check.ok) {
    area = undefined;
    $("area-info").textContent = `Área grande demais (${formatKm2(check.km2)}). O limite é ${formatKm2(MAX_AREA_KM2)}: desenhe uma área menor ou aproxime o mapa.`;
    return false;
  }
  area = { bbox, label };
  L.rectangle(
    [
      [bbox.south, bbox.west],
      [bbox.north, bbox.east],
    ],
    { color: "#2563eb", weight: 2, fillOpacity: 0.05, interactive: false },
  ).addTo(areaLayer);
  $("area-info").textContent = `Área: ${label ? `${label} · ` : ""}${formatKm2(check.km2)}`;
  return true;
}

function startDrawing() {
  const container = map.getContainer();
  const button = $<HTMLButtonElement>("draw");
  const gesture = new RectGesture<L.LatLng>((ll) => map.latLngToContainerPoint(ll));
  const hint = "Arraste no mapa para desenhar a área.";
  let preview: L.Rectangle | undefined;

  const point = (e: PointerEvent): Point => map.mouseEventToContainerPoint(e);
  const bounds = (start: L.LatLng, end: Point) => L.latLngBounds(start, map.containerPointToLatLng([end.x, end.y]));
  const clearPreview = () => {
    preview?.remove();
    preview = undefined;
  };

  const onDown = (e: PointerEvent) => {
    // Capturing a press on a control would swallow its click: "+", "−" and the attribution link.
    if (e.target instanceof Element && e.target.closest(".leaflet-control-container")) return;
    if (gesture.down(e, map.mouseEventToLatLng(e))) container.setPointerCapture(e.pointerId);
  };
  const onMove = (e: PointerEvent) => {
    const stroke = gesture.move(e.pointerId, point(e));
    if (!stroke) return;
    const b = bounds(stroke.start, stroke.end);
    if (preview) preview.setBounds(b);
    else preview = L.rectangle(b, { color: "#2563eb", weight: 1, dashArray: "4", interactive: false }).addTo(map);
  };
  const onUp = (e: PointerEvent) => {
    const end = gesture.up(e.pointerId, point(e));
    if (!end) return;
    clearPreview();
    if (end.kind === "tap") {
      drawHint(`Um toque não desenha. ${hint} Para sair, toque em “Cancelar desenho”.`);
      return;
    }
    stop();
    setArea(toBBox(bounds(end.start, end.end)), "desenhada");
  };
  const onCancel = (e: PointerEvent) => {
    if (!gesture.cancel(e.pointerId)) return;
    clearPreview();
    drawHint(hint);
  };
  const onKey = (e: KeyboardEvent) => {
    if (e.key === "Escape") stop();
  };

  function stop() {
    clearPreview();
    restoreMap();
    container.removeEventListener("pointerdown", onDown);
    container.removeEventListener("pointermove", onMove);
    container.removeEventListener("pointerup", onUp);
    container.removeEventListener("pointercancel", onCancel);
    document.removeEventListener("keydown", onKey);
    container.classList.remove("drawing");
    button.textContent = "Desenhar área";
    drawHint();
    stopDrawing = undefined;
  }

  const restoreMap = suspend([map.dragging, map.touchZoom, map.doubleClickZoom, map.scrollWheelZoom, map.boxZoom]);
  container.addEventListener("pointerdown", onDown);
  container.addEventListener("pointermove", onMove);
  container.addEventListener("pointerup", onUp);
  container.addEventListener("pointercancel", onCancel);
  document.addEventListener("keydown", onKey);
  container.classList.add("drawing");
  button.textContent = "Cancelar desenho";
  drawHint(hint);
  stopDrawing = stop;
}

function showPlaces(places: Place[]) {
  const list = $("places");
  list.replaceChildren();
  list.hidden = places.length === 0;
  for (const place of places) {
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = place.label;
    button.addEventListener("click", () => {
      list.hidden = true;
      stopDrawing?.();
      const b = place.bbox;
      map.fitBounds([
        [b.south, b.west],
        [b.north, b.east],
      ]);
      setArea(b, place.label.split(",")[0]);
    });
    const li = document.createElement("li");
    li.append(button);
    list.append(li);
  }
}

function link(href: string, text: string): HTMLAnchorElement {
  const a = document.createElement("a");
  a.href = href;
  a.textContent = text;
  a.target = "_blank";
  a.rel = "noopener";
  return a;
}

function phoneCell(lead: Lead): HTMLTableCellElement {
  const td = document.createElement("td");
  if (!lead.phone) {
    td.textContent = "—";
    return td;
  }
  const tel = link(`tel:${lead.phone.replace(/[^\d+]/g, "")}`, lead.phone);
  tel.removeAttribute("target");
  td.append(tel);
  if (lead.whatsapp) td.append(" ", link(lead.whatsapp, "WhatsApp"));
  return td;
}

function renderLeads(leads: Lead[], partial: boolean) {
  clearResults();
  const tbody = $("results").querySelector("tbody")!;
  for (const lead of leads) {
    const tr = document.createElement("tr");
    const name = document.createElement("td");
    name.textContent = lead.name;
    const address = document.createElement("td");
    address.textContent = lead.address ?? "—";
    const source = document.createElement("td");
    source.append(link(lead.sourceUrl, "OSM"));
    tr.append(name, phoneCell(lead), address, source);
    tbody.append(tr);

    const popup = document.createElement("div");
    const strong = document.createElement("strong");
    strong.textContent = lead.name;
    popup.append(strong);
    if (lead.phone) popup.append(document.createElement("br"), lead.phone);
    L.circleMarker([lead.lat, lead.lon], { radius: 7, color: "#1d4ed8", fillOpacity: 0.8 })
      .bindPopup(popup)
      .addTo(pinLayer);
  }
  const withPhone = leads.filter((l) => l.phone).length;
  const count = leads.length
    ? `${leads.length.toLocaleString("pt-BR")} resultado(s), ${withPhone.toLocaleString("pt-BR")} com telefone.`
    : "Nenhum resultado nesta área.";
  $("count").textContent = partial ? `${count} Lista parcial: reduza a área para ver todos os resultados.` : count;
}

$<HTMLDataListElement>("categories").append(
  ...CATEGORIES.map((c) => {
    const option = document.createElement("option");
    option.value = c.label;
    return option;
  }),
);

$("draw").addEventListener("click", () => (stopDrawing ? stopDrawing() : startDrawing()));
$("use-view").addEventListener("click", () => {
  stopDrawing?.();
  setArea(toBBox(map.getBounds()), "visível no mapa");
});

$("place-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const button = $<HTMLButtonElement>("place-form").querySelector("button")!;
  button.disabled = true;
  status("Procurando lugar…");
  try {
    const places = await geocoder.search($<HTMLInputElement>("place").value);
    showPlaces(places);
    status(places.length ? "" : "Nenhum lugar encontrado.");
  } catch (err) {
    status(err instanceof Error ? err.message : "Falha na busca de lugares.", true);
  } finally {
    button.disabled = false;
  }
});

$("search-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const term = $<HTMLInputElement>("term").value.trim();
  if (!area) return status("Escolha uma área primeiro.", true);
  if (!term) return status("Informe o que procurar.", true);

  if (runner.busy) return;
  const button = $<HTMLButtonElement>("search-form").querySelector<HTMLButtonElement>("button[type=submit]")!;
  const cancel = $<HTMLButtonElement>("cancel");
  button.disabled = true;
  cancel.hidden = false;
  try {
    const outcome = await runner.run(area, term, (event) => {
      if (event.kind === "requesting") status(`Buscando “${term}” no ${provider.name}…`);
      else if (event.kind === "waiting")
        status(`Aguardando o servidor (${Math.ceil(event.ms / 1000).toLocaleString("pt-BR")} s)…`);
    });
    if (outcome.kind === "done") {
      renderLeads(outcome.leads, outcome.partial);
      status("");
    } else if (outcome.kind === "failed") status(outcome.message, true);
    else if (outcome.reason === "area") status("A área mudou, então a busca anterior foi cancelada. Busque de novo.");
    else status("Busca cancelada.");
  } finally {
    const hadFocus = document.activeElement === cancel;
    button.disabled = false;
    cancel.hidden = true;
    if (hadFocus) button.focus();
  }
});

$("cancel").addEventListener("click", () => runner.cancel("user"));
