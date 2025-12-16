import { useEffect, useMemo, useState } from "react";
import { listTheaters } from "../api/theaters";
import { useNavigate } from "react-router-dom";
import "./theatersEditList.css";
import countries from "i18n-iso-countries";
import ptLocale from "i18n-iso-countries/langs/pt.json";

countries.registerLocale(ptLocale);

function countryName(code) {
  if (!code) return "";
  return countries.getName(code, "pt", { select: "official" }) || code;
}

export default function TheatersEditList() {
  const navigate = useNavigate();

  const [theaters, setTheaters] = useState([]);

  const [q, setQ] = useState("");
  const [country, setCountry] = useState("");
  const [stateUf, setStateUf] = useState("");
  const [city, setCity] = useState("");

  useEffect(() => {
    listTheaters().then(setTheaters).catch(console.error);
  }, []);

  const countryOptions = useMemo(() => {
    const set = new Set();
    theaters.forEach((t) => {
      const c = (t.address?.country || "").toUpperCase().trim();
      if (c) set.add(c);
    });
    return Array.from(set).sort();
  }, [theaters]);

  const stateOptions = useMemo(() => {
    const set = new Set();
    theaters.forEach((t) => {
      const c = (t.address?.country || "").toUpperCase().trim();
      const s = (t.address?.state || "").toUpperCase().trim();
      if (country && c !== country) return;
      if (s) set.add(s);
    });
    return Array.from(set).sort();
  }, [theaters, country]);

  const cityOptions = useMemo(() => {
    const set = new Set();
    theaters.forEach((t) => {
      const c = (t.address?.country || "").toUpperCase().trim();
      const s = (t.address?.state || "").toUpperCase().trim();
      const ci = (t.address?.city || "").trim();
      if (country && c !== country) return;
      if (stateUf && s !== stateUf) return;
      if (ci) set.add(ci);
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [theaters, country, stateUf]);

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    return theaters.filter((t) => {
      const name = (t.name || "").toLowerCase();
      const c = (t.address?.country || "").toUpperCase().trim();
      const s = (t.address?.state || "").toUpperCase().trim();
      const ci = (t.address?.city || "").trim();

      if (query && !name.includes(query)) return false;
      if (country && c !== country) return false;
      if (stateUf && s !== stateUf) return false;
      if (city && ci !== city) return false;

      return true;
    });
  }, [theaters, q, country, stateUf, city]);

  return (
    <div className="edit-list-page">
      <h2 className="edit-title">Editar Teatros</h2>

      <div className="filters-bar">
        <input
          className="filters-input"
          placeholder="Pesquisar por nome..."
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />

        <select
          className="filters-select"
          value={country}
          onChange={(e) => {
            setCountry(e.target.value);
            setStateUf("");
            setCity("");
          }}
        >
          <option value="">País</option>
          {countryOptions.map((c) => (
            <option key={c} value={c}>
              {countryName(c)}
            </option>
          ))}
        </select>

        <select
          className="filters-select"
          value={stateUf}
          onChange={(e) => {
            setStateUf(e.target.value);
            setCity("");
          }}
          disabled={!country}
        >
          <option value="">Estado</option>
          {stateOptions.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>

        <select
          className="filters-select"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          disabled={!country || !stateUf}
        >
          <option value="">Cidade</option>
          {cityOptions.map((ci) => (
            <option key={ci} value={ci}>
              {ci}
            </option>
          ))}
        </select>

        <button
          type="button"
          className="filters-clear"
          onClick={() => {
            setQ("");
            setCountry("");
            setStateUf("");
            setCity("");
          }}
        >
          Limpar
        </button>
      </div>

      <div className="cards-grid">
        {filtered.map((t) => {
          const photo = t.photo_base64 || null;
          const c = (t.address?.country || "").toUpperCase().trim();
          const s = (t.address?.state || "").toUpperCase().trim();
          const ci = (t.address?.city || "").trim();
          const line = [countryName(c), ci ? ci : null, s ? s : null]
            .filter(Boolean)
            .join(ci && s ? ", " : ", ")
            .replace(/, ([^-]+)$/, ", $1");

          return (
            <div
              key={t.id}
              className="theater-card"
              onClick={() => navigate(`/theaters/${t.id}`)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === "Enter" && navigate(`/theaters/${t.id}`)}
            >
              <div className="card-photo">
                {photo ? (
                  <img src={photo} alt={t.name} />
                ) : (
                  <div className="card-photo-placeholder">Sem foto</div>
                )}
              </div>

              <div className="card-bottom">
                <div className="card-name">{t.name}</div>
                <div className="card-meta">
                  {countryName(c)}
                  {ci ? `, ${ci}` : ""}
                  {s ? ` - ${s}` : ""}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
