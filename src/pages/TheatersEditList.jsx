import { useEffect, useState } from "react";
import { listTheaters } from "../api/theaters";
import { useNavigate } from "react-router-dom";
import "./theatersEditList.css";

export default function TheatersEditList() {
  const navigate = useNavigate();
  const [theaters, setTheaters] = useState([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    listTheaters().then(setTheaters).catch(console.error);
  }, []);

  const filtered = theaters.filter((t) =>
    t.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="edit-list-page">

      <h2>Editar Teatros</h2>

      {/* Barra de busca */}
      <input
        className="search-bar"
        placeholder="Pesquisar teatro por nome..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {/* Lista */}
      <div className="list-container">
        {filtered.map((t) => (
          <div
            key={t.id}
            className="list-item"
            onClick={() => navigate(`/theaters/${t.id}`)}
          >
            {t.name}
          </div>
        ))}
      </div>

    </div>
  );
}