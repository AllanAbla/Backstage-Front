import { useEffect, useMemo, useRef, useState } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { listTheaters } from "../api/theaters";

// escolha um estilo (sem chave) — raster dark bonito:
const STYLE_RASTER_DARK = {
  version: 8,
  sources: {
    cartoDark: {
      type: "raster",
      tiles: [
        "https://a.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png",
        "https://b.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png",
        "https://c.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png"
      ],
      tileSize: 256,
      attribution: '© OpenStreetMap contributors · Tiles © Carto',
    },
  },
  layers: [{ id: "cartoDark", type: "raster", source: "cartoDark" }],
};

// se preferir MapTiler dark vetorial (requer chave):
// const STYLE_DARK = `https://api.maptiler.com/maps/dark/style.json?key=${import.meta.env.VITE_MAPTILER_KEY}`;

export default function MapGLPage() {
  const wrapRef = useRef(null);
  const mapRef = useRef(null);
  const [theaters, setTheaters] = useState([]);

  useEffect(() => { listTheaters().then(setTheaters).catch(console.error); }, []);

  const points = useMemo(
    () => (theaters || [])
      .map((t) => {
        const [lng, lat] = t.location?.coordinates || [];
        if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
        return {
          id: t._id || t.id, name: t.name, lat, lng,
          city: t.address?.city, state: t.address?.state,
        };
      })
      .filter(Boolean),
    [theaters]
  );

  useEffect(() => {
    if (!wrapRef.current || mapRef.current) return;
    const map = new maplibregl.Map({
      container: wrapRef.current,
      style: STYLE_RASTER_DARK,
      center: [-51.92528, -14.235004],
      zoom: 4,
      attributionControl: true,
      cooperativeGestures: false,
    });
    mapRef.current = map;

    map.addControl(new maplibregl.NavigationControl({ visualizePitch: true }), "top-right");

    map.on("load", () => {
      points.forEach((p) => addMarker(map, p));
      if (points.length) {
        const bounds = new maplibregl.LngLatBounds();
        points.forEach((p) => bounds.extend([p.lng, p.lat]));
        map.fitBounds(bounds, { padding: 60, duration: 800 });
      }
    });

    return () => { map.remove(); mapRef.current = null; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    document.querySelectorAll(".theater-marker").forEach((el) => el.remove());
    points.forEach((p) => addMarker(map, p));
  }, [points]);

  return (
    // mapa full: essa div ocupa todo o viewport abaixo da navbar
    <div className="map-full">
      <div ref={wrapRef} className="map-canvas" />
    </div>
  );
}

function addMarker(map, point) {
  const el = document.createElement("div");
  el.className = "theater-marker";
  el.style.cssText = `
    width: 10px; height: 10px; border-radius: 50%;
    background: #4aa8ff;
    box-shadow: 0 0 0 3px rgba(74,168,255,.25);
    border: 1px solid rgba(0,0,0,.2);
    cursor: pointer;
  `;
  el.title = point.name + (point.city || point.state ? ` — ${point.city ?? ""}${point.city && point.state ? " · " : ""}${point.state ?? ""}` : "");

  const popup = new maplibregl.Popup({ closeButton: false, closeOnClick: false, offset: 12 }).setHTML(`
    <strong>${escapeHtml(point.name)}</strong>
    ${point.city || point.state
      ? `<div style="font-size:12px;opacity:.8">${escapeHtml(point.city ?? "")}${point.city && point.state ? " · " : ""}${escapeHtml(point.state ?? "")}</div>`
      : ""}
  `);
  el.addEventListener("mouseenter", () => popup.setLngLat([point.lng, point.lat]).addTo(map));
  el.addEventListener("mouseleave", () => popup.remove());

  new maplibregl.Marker({ element: el, anchor: "center" })
    .setLngLat([point.lng, point.lat])
    .addTo(map);
}

function escapeHtml(s = "") {
  return s.replace(/[&<>"']/g, (m) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" }[m]));
}