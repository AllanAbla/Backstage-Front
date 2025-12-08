// src/pages/TheatersEdit.jsx
import { useEffect, useState } from "react";
import { listTheaters } from "../api/theaters";
import { useNavigate } from "react-router-dom";

export default function TheatersEdit() {
  const [theaters, setTheaters] = useState([]);
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    async function load() {
      const data = await listTheaters();
      setTheaters(data);
    }
    load();
  }, []);

  const filtered = theaters.filter(t =>
    t.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="theater-form-page">
      <h2>Editar Teatro</h2>

      {/* 🔍 Campo de Busca */}
      <input
        placeholder="Buscar por nome..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={{
          marginBottom: "20px",
          padding: "12px",
          width: "100%",
          borderRadius: "10px",
          background: "rgba(255,255,255,0.04)",
          border: "1px solid rgba(255,255,255,0.10)",
          color: "white"
        }}
      />

      {/* Lista */}
      <ul style={{ listStyle: "none", padding: 0, marginTop: "20px" }}>
        {filtered.map(t => (
          <li
            key={t.id}
            onClick={() => navigate(`/theaters/${t.id}`)}
            style={{
              padding: "14px",
              borderRadius: "10px",
              border: "1px solid rgba(255,255,255,0.1)",
              background: "rgba(255,255,255,0.03)",
              marginBottom: "10px",
              cursor: "pointer",
              transition: "0.2s"
            }}
          >
            <strong>{t.name}</strong>
            <p style={{ opacity: 0.6, margin: 0, marginTop: "4px" }}>
              {t.address?.city} — {t.address?.state}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}