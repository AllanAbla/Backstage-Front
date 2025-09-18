import { useEffect, useMemo, useRef, useState } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { listTheaters } from "../api/theaters";

const MAPTILER_KEY = import.meta.env.VITE_MAPTILER_KEY;
// Estilo dark vetorial (suave, sem “quadradinhos”)
const STYLE_DARK = `https://api.maptiler.com/maps/dark/style.json?key=${MAPTILER_KEY}`;

export default function MapGLPage() {
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const [theaters, setTheaters] = useState([]);

  useEffect(() => {
    listTheaters().then(setTheaters).catch(console.error);
  }, []);

  const points = useMemo(
    () =>
      (theaters || [])
        .map((t) => {
          const [lng, lat] = t.location?.coordinates || [];
          if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
          return {
            id: t._id || t.id,
            name: t.name,
            lat,
            lng,
            city: t.address?.city,
            state: t.address?.state,
          };
        })
        .filter(Boolean),
    [theaters]
  );

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: STYLE_DARK,
      center: [-51.92528, -14.235004],
      zoom: 4,
      attributionControl: true,
      cooperativeGestures: true, // melhora UX em scroller
    });
    mapRef.current = map;

    // controles (zoom + attribution mais escuro por CSS global)
    map.addControl(new maplibregl.NavigationControl({ visualizePitch: true }), "top-right");

    // quando o estilo carregar, adiciona os “marcadores” (DOM)
    map.on("load", () => {
      points.forEach((p) => addMarker(map, p));
      // fit bounds quando tiver dados
      if (points.length > 0) {
        const bounds = new maplibregl.LngLatBounds();
        points.forEach((p) => bounds.extend([p.lng, p.lat]));
        map.fitBounds(bounds, { padding: 60, duration: 800 });
      }
    });

    return () => {
      map.remove();
      mapRef.current = null;
    };
    // só cria o mapa uma vez
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // se os pontos mudarem depois que o mapa já existe (hot reload), renderizamos de novo:
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    // remova marcadores anteriores
    const old = document.querySelectorAll(".theater-marker");
    old.forEach((el) => el.remove());
    // adicione atuais
    points.forEach((p) => addMarker(map, p));
  }, [points]);

  return (
    <div className="card map-page">
      <h2>Mapa (Vector / Dark)</h2>
      <div
        ref={containerRef}
        style={{ width: "100%", height: "75vh", borderRadius: 12, overflow: "hidden" }}
      />
    </div>
  );
}

function addMarker(map, point) {
  // criamos um “dot” estilizado (fica bonito no dark)
  const el = document.createElement("div");
  el.className = "theater-marker";
  el.style.cssText = `
    width: 10px; height: 10px; border-radius: 50%;
    background: #4aa8ff;
    box-shadow: 0 0 0 3px rgba(74,168,255,.25);
    border: 1px solid rgba(0,0,0,.2);
    cursor: pointer;
  `;
  // tooltip simples via native title (hover)
  el.title = point.name + (point.city || point.state ? ` — ${point.city ?? ""}${point.city && point.state ? " · " : ""}${point.state ?? ""}` : "");

  // popup (aparece no hover ou no click)
  const popup = new maplibregl.Popup({
    closeButton: false,
    closeOnClick: false,
    offset: 12,
  }).setHTML(`
    <strong>${escapeHtml(point.name)}</strong>
    ${point.city || point.state
      ? `<div style="font-size:12px;opacity:.8">${escapeHtml(point.city ?? "")}${point.city && point.state ? " · " : ""}${escapeHtml(point.state ?? "")}</div>`
      : ""}
  `);

  el.addEventListener("mouseenter", () => {
    popup.setLngLat([point.lng, point.lat]).addTo(map);
  });
  el.addEventListener("mouseleave", () => popup.remove());
  el.addEventListener("click", () => {
    // fixa o popup se clicar (toggle simples)
    if (popup.isOpen()) popup.remove();
    else popup.setLngLat([point.lng, point.lat]).addTo(map);
  });

  new maplibregl.Marker({ element: el, anchor: "center" })
    .setLngLat([point.lng, point.lat])
    .addTo(map);
}

function escapeHtml(s = "") {
  return s.replace(/[&<>"']/g, (m) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" }[m]));
}