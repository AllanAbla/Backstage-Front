import { useEffect, useMemo, useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Tooltip,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import { listTheaters } from "../api/theaters";

// Fix do ícone padrão do Leaflet em bundlers (Vite/webpack)
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

function FitBounds({ points }) {
  const map = useMap();
  useEffect(() => {
    if (!points?.length) return;
    const bounds = L.latLngBounds(points.map((p) => [p.lat, p.lng]));
    map.fitBounds(bounds.pad(0.2), { animate: true });
  }, [points, map]);
  return null;
}

export default function MapPage() {
  const [theaters, setTheaters] = useState([]);
  const [error, setError] = useState(null);

  // carrega teatros
  useEffect(() => {
    listTheaters()
      .then(setTheaters)
      .catch((e) => setError(e.message || String(e)));
  }, []);

  // converte dados -> pontos [lat,lng] (React-Leaflet usa [lat,lng]; sua API está [lng,lat])
  const points = useMemo(() => {
    return (theaters || [])
      .map((t) => {
        const coords = t.location?.coordinates;
        if (!coords || coords.length !== 2) return null;
        const [lng, lat] = coords; // sua API vem [lng, lat]
        if (typeof lat !== "number" || typeof lng !== "number") return null;
        return {
          id: t._id || t.id,
          name: t.name,
          lat,
          lng,
          city: t.address?.city,
          state: t.address?.state,
        };
      })
      .filter(Boolean);
  }, [theaters]);

  // centro e zoom inicial (Brasil)
  const initialCenter = [-14.235004, -51.92528]; // [lat, lng]
  const initialZoom = 4;

  return (
    <div className="card map-page">
      <h2>Mapa de Teatros</h2>
      {error && <p className="err">{error}</p>}
      <MapContainer
        className="map"
        center={initialCenter}
        zoom={initialZoom}
        scrollWheelZoom
        worldCopyJump
        updateWhenIdle
        preferCanvas={true} // ajuda em algumas GPUs
      >
        <TileLayer
          attribution="&copy; Esri, HERE, Garmin, FAO, NOAA, USGS | © OpenStreetMap contributors"
          url="https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}"
        />
        {/* ajusta o mapa para caber todos os pontos quando carregar */}
        <FitBounds points={points} />

        {points.map((p) => (
          <Marker key={p.id} position={[p.lat, p.lng]}>
            {/* Tooltip aparece ao passar o mouse */}
            <Tooltip direction="top" offset={[0, -10]} opacity={1} sticky>
              <strong>{p.name}</strong>
              {p.city || p.state ? (
                <div style={{ fontSize: 12, opacity: 0.85 }}>
                  {p.city}
                  {p.city && p.state ? " · " : ""}
                  {p.state}
                </div>
              ) : null}
            </Tooltip>
          </Marker>
        ))}
      </MapContainer>

      <small style={{ opacity: 0.7 }}>
        Tiles &copy; OpenStreetMap contributors · Use o scroll ou pinch para
        zoom.
      </small>
    </div>
  );
}
