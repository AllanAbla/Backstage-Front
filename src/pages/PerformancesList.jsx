/**
 * PerformancesList.jsx
 *
 * Lista todas as performances em cards com banner.
 * Ao clicar num card, abre um drawer lateral com:
 *   - Metadados da performance
 *   - Sessões agrupadas por teatro (via GET /sessions/by-performance/:id)
 *   - Ações: Editar, Excluir performance, Adicionar sessões, Remover sessão
 *
 * Filtros disponíveis:
 *   - Busca textual (nome, sinopse, tag, teatro)
 *   - Temporada
 *   - Classificação
 *   - País   ← novo
 *   - Cidade ← novo (cascata a partir do país selecionado)
 */
import { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { listPerformances, deletePerformance } from "../api/performances";
import { listByPerformance, deleteSession, deleteByPerformance } from "../api/sessions";
import { listTheaters } from "../api/theaters";
import { imageUrl } from "../api/media";
import SessionsWizard from "../components/performances/SessionsWizard";
import "./performancesList.css";

const CLASSIFICATIONS = ["Livre", "10", "12", "14", "16", "18"];

// ── helpers ──────────────────────────────────────────────────────────────────

function fmtDate(iso) {
  return new Date(iso).toLocaleDateString("pt-BR", {
    weekday: "short", day: "2-digit", month: "short", year: "numeric",
  });
}

function fmtTime(iso) {
  return new Date(iso).toLocaleTimeString("pt-BR", {
    hour: "2-digit", minute: "2-digit",
  });
}

/** Agrupa sessões por theater_id → { [theater_id]: [session, ...] } */
function groupByTheater(sessions) {
  return sessions.reduce((acc, s) => {
    const k = s.theater_id;
    if (!acc[k]) acc[k] = [];
    acc[k].push(s);
    return acc;
  }, {});
}

/**
 * Deriva opções de país e cidade a partir dos teatros,
 * filtrando cidades pelo país selecionado (cascata).
 * O(n) — passagem única.
 *
 * @param {Object} theatersMap   - { [id]: { name, city, country } }
 * @param {string} filterCountry - código/nome do país selecionado ou ""
 * @returns {{ countries: string[], cities: string[] }}
 */
function deriveGeoOptions(theatersMap, filterCountry) {
  const countriesSet = new Set();
  const citiesSet = new Set();

  for (const t of Object.values(theatersMap)) {
    if (t.country) countriesSet.add(t.country);
    if (t.city && (!filterCountry || t.country === filterCountry)) {
      citiesSet.add(t.city);
    }
  }

  return {
    countries: Array.from(countriesSet).sort(),
    cities: Array.from(citiesSet).sort(),
  };
}

// ── componente principal ──────────────────────────────────────────────────────

export default function PerformancesList({ onAddNew }) {
  const navigate = useNavigate();

  const [performances, setPerformances]   = useState([]);
  /**
   * theatersMap: { [id]: { name, city, country } }
   * Armazena nome + localização para permitir filtros geo e exibição no card.
   */
  const [theatersMap, setTheatersMap]     = useState({});
  const [loading, setLoading]             = useState(true);

  // filtros
  const [q, setQ]                                   = useState("");
  const [filterSeason, setFilterSeason]             = useState("");
  const [filterClass, setFilterClass]               = useState("");
  const [filterCountry, setFilterCountry]           = useState("");
  const [filterCity, setFilterCity]                 = useState("");

  // drawer
  const [selected, setSelected]                     = useState(null);
  const [sessions, setSessions]                     = useState([]);
  const [sessionsLoading, setSessionsLoading]       = useState(false);
  const [addingSession, setAddingSession]           = useState(false);
  const [confirmDel, setConfirmDel]                 = useState(false);

  // ── carga inicial ─────────────────────────────────────────────────────────
  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [perfs, theaters] = await Promise.all([
        listPerformances(),
        listTheaters(),
      ]);
      setPerformances(perfs);

      // Mapa enriquecido: id → { name, city, country }
      const map = {};
      theaters.forEach((t) => {
        map[t.id] = {
          name:    t.name,
          city:    t.address?.city    || "",
          country: t.address?.country || "",
        };
      });
      setTheatersMap(map);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  // ── opções de geo (derivadas do mapa de teatros) ──────────────────────────
  const { countries, cities } = useMemo(
    () => deriveGeoOptions(theatersMap, filterCountry),
    [theatersMap, filterCountry]
  );

  // Reseta cidade quando o país muda para evitar seleção órfã
  const handleCountryChange = (val) => {
    setFilterCountry(val);
    setFilterCity("");
  };

  // ── filtro client-side ────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    const term = q.toLowerCase();

    return performances.filter((p) => {
      // Busca textual — inclui nome do teatro quando disponível via session_theaters
      const theaterNames = (p.session_theaters || [])
        .map((id) => (theatersMap[id]?.name || "").toLowerCase());

      const matchQ = !term ||
        p.name.toLowerCase().includes(term) ||
        (p.synopsis || "").toLowerCase().includes(term) ||
        (p.tags || []).some((t) => t.toLowerCase().includes(term)) ||
        theaterNames.some((n) => n.includes(term));

      const matchSeason  = !filterSeason  || String(p.season) === filterSeason;
      const matchClass   = !filterClass   || p.classification === filterClass;

      // Filtros geo: a performance está em cartaz nesse país/cidade?
      const matchCountry = !filterCountry || (p.session_theaters || []).some(
        (id) => theatersMap[id]?.country === filterCountry
      );
      const matchCity    = !filterCity    || (p.session_theaters || []).some(
        (id) => theatersMap[id]?.city === filterCity
      );

      return matchQ && matchSeason && matchClass && matchCountry && matchCity;
    });
  }, [performances, q, filterSeason, filterClass, filterCountry, filterCity, theatersMap]);

  const seasons = useMemo(() => {
    const s = new Set(performances.map((p) => String(p.season)));
    return Array.from(s).sort((a, b) => b - a);
  }, [performances]);

  const hasFilters = q || filterSeason || filterClass || filterCountry || filterCity;

  const clearFilters = () => {
    setQ(""); setFilterSeason(""); setFilterClass("");
    setFilterCountry(""); setFilterCity("");
  };

  // ── abrir drawer ──────────────────────────────────────────────────────────
  const openDrawer = useCallback(async (perf) => {
    setSelected(perf);
    setAddingSession(false);
    setConfirmDel(false);
    setSessionsLoading(true);
    try {
      const perfId = perf.id ?? perf._id;
      const data = await listByPerformance(perfId);
      setSessions(data);

      // Enriquece a performance com os IDs únicos de teatros onde tem sessões
      // para uso nos filtros geo (sem re-render desnecessário do array principal)
      const theaterIds = [...new Set(data.map((s) => s.theater_id))];
      setPerformances((prev) =>
        prev.map((p) =>
          (p.id ?? p._id) === perfId
            ? { ...p, session_theaters: theaterIds }
            : p
        )
      );
    } catch (err) {
      console.error(err);
      setSessions([]);
    } finally {
      setSessionsLoading(false);
    }
  }, []);

  const closeDrawer = () => {
    setSelected(null);
    setSessions([]);
    setAddingSession(false);
    setConfirmDel(false);
  };

  // ── remover sessão individual ─────────────────────────────────────────────
  const handleDeleteSession = async (sessionId) => {
    try {
      await deleteSession(sessionId);
      setSessions((prev) => prev.filter((s) => s.id !== sessionId));
    } catch (err) {
      console.error(err);
    }
  };

  // ── excluir performance ───────────────────────────────────────────────────
  const handleDeletePerf = async () => {
    if (!selected) return;
    const perfId = selected.id ?? selected._id;
    try {
      await deleteByPerformance(perfId);
      await deletePerformance(perfId);
      setPerformances((prev) => prev.filter((p) => (p.id ?? p._id) !== perfId));
      closeDrawer();
    } catch (err) {
      console.error(err);
    }
  };

  // ── após adicionar sessões pelo wizard ────────────────────────────────────
  const onSessionsAdded = async () => {
    setAddingSession(false);
    if (!selected) return;
    setSessionsLoading(true);
    try {
      const data = await listByPerformance(selected.id ?? selected._id);
      setSessions(data);
    } catch (err) {
      console.error(err);
    } finally {
      setSessionsLoading(false);
    }
  };

  // ── render ────────────────────────────────────────────────────────────────
  const grouped = useMemo(() => groupByTheater(sessions), [sessions]);

  /**
   * Retorna o nome do teatro principal de uma performance.
   * "Principal" = primeiro teatro com sessões (ordenado pelo id numérico).
   * Exibido no card abaixo do título.
   */
  const primaryTheaterName = (perf) => {
    const ids = perf.session_theaters;
    if (!ids?.length) return null;
    const sorted = [...ids].sort((a, b) => Number(a) - Number(b));
    return theatersMap[sorted[0]]?.name || null;
  };

  return (
    <div className="perf-list-page">

      {/* Cabeçalho */}
      <div className="perf-list-header">
        <h1 className="perf-list-title">Performances</h1>
        {onAddNew && (
          <button className="perf-add-btn" onClick={onAddNew}>
            ＋ Nova performance
          </button>
        )}
      </div>

      {/* Filtros — linha 1: busca | temporada | classificação */}
      <div className="perf-filters">
        <input
          placeholder="Buscar por nome, teatro, sinopse ou tag…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <select value={filterSeason} onChange={(e) => setFilterSeason(e.target.value)}>
          <option value="">Todas as temporadas</option>
          {seasons.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <select value={filterClass} onChange={(e) => setFilterClass(e.target.value)}>
          <option value="">Todas as classificações</option>
          {CLASSIFICATIONS.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {/* Filtros — linha 2: país | cidade | limpar */}
      <div className="perf-filters perf-filters-geo">
        <select
          value={filterCountry}
          onChange={(e) => handleCountryChange(e.target.value)}
        >
          <option value="">Todos os países</option>
          {countries.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>

        <select
          value={filterCity}
          onChange={(e) => setFilterCity(e.target.value)}
          disabled={!filterCountry}
        >
          <option value="">Todas as cidades</option>
          {cities.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>

        {hasFilters && (
          <button className="perf-filters-clear" onClick={clearFilters}>
            Limpar
          </button>
        )}
      </div>

      {/* Grid */}
      {loading ? (
        <p style={{ opacity: .5, textAlign: "center", padding: "48px 0" }}>Carregando…</p>
      ) : (
        <div className="perf-grid">
          {filtered.length === 0 ? (
            <div className="perf-empty-state">
              <span style={{ fontSize: 40 }}>🎭</span>
              <p>Nenhuma performance encontrada.</p>
            </div>
          ) : (
            filtered.map((p) => {
              const perfId   = p.id ?? p._id;
              const isActive = selected && (selected.id ?? selected._id) === perfId;
              const theater  = primaryTheaterName(p);

              return (
                <div
                  key={perfId}
                  className={`perf-card${isActive ? " active" : ""}`}
                  onClick={() => openDrawer(p)}
                >
                  <div className="perf-card-banner">
                    {p.banner_url
                      ? <img src={imageUrl(p.banner_url)} alt={p.name} loading="lazy" />
                      : <span className="perf-card-banner-placeholder">🎭</span>
                    }
                  </div>
                  <div className="perf-card-body">
                    <p className="perf-card-name">{p.name}</p>

                    {/* Nome do teatro — novo */}
                    {theater && (
                      <p className="perf-card-theater">{theater}</p>
                    )}

                    <div className="perf-card-meta">
                      <span>{p.season}</span>
                      <span>·</span>
                      <span>{p.classification}</span>
                    </div>

                    {p.tags?.length > 0 && (
                      <div className="perf-card-tags">
                        {p.tags.slice(0, 3).map((t) => (
                          <span key={t} className="perf-tag">{t}</span>
                        ))}
                        {p.tags.length > 3 && (
                          <span className="perf-tag">+{p.tags.length - 3}</span>
                        )}
                      </div>
                    )}

                    {p.session_count > 0 && (
                      <p className="perf-session-count">
                        {p.session_count} sessão(ões)
                      </p>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Drawer overlay */}
      {selected && (
        <>
          <div className="perf-drawer-overlay" onClick={closeDrawer} />
          <aside className="perf-drawer">

            <div className="perf-drawer-head">
              <button className="perf-drawer-close" onClick={closeDrawer}>✕</button>
              <h2 className="perf-drawer-title">{selected.name}</h2>
              <p className="perf-drawer-sub">
                {selected.season} · {selected.classification}
                {selected.tags?.length > 0 && ` · ${selected.tags.slice(0, 3).join(", ")}`}
              </p>
            </div>

            {!addingSession && (
              <div className="perf-drawer-actions">
                <button onClick={() => navigate(`/performances/${selected.id ?? selected._id}/edit`)}>
                  ✏️ Editar
                </button>
                {!confirmDel ? (
                  <button className="btn-danger" onClick={() => setConfirmDel(true)}>
                    🗑 Excluir
                  </button>
                ) : (
                  <button className="btn-danger" onClick={handleDeletePerf}>
                    Confirmar exclusão
                  </button>
                )}
              </div>
            )}

            <div className="perf-drawer-sessions">
              {addingSession ? (
                <>
                  <p style={{ fontSize: 13, color: "#9fb0bf", marginTop: 0 }}>
                    Adicionar sessões a <strong style={{ color: "#fff" }}>{selected.name}</strong>
                  </p>
                  <SessionsWizard
                    performanceId={selected.id ?? selected._id}
                    onDone={onSessionsAdded}
                    onSkip={() => setAddingSession(false)}
                  />
                </>
              ) : (
                <>
                  {sessionsLoading ? (
                    <p className="perf-sessions-loading">Carregando sessões…</p>
                  ) : sessions.length === 0 ? (
                    <div className="perf-sessions-empty">
                      <p>Nenhuma sessão cadastrada.</p>
                    </div>
                  ) : (
                    Object.entries(grouped)
                      .sort(([a], [b]) => Number(a) - Number(b))
                      .map(([theaterId, tSessions]) => (
                        <div key={theaterId} className="perf-theater-group">
                          <p className="perf-theater-group-name">
                            {theatersMap[theaterId]?.name ?? `Teatro #${theaterId}`}
                          </p>
                          {tSessions
                            .slice()
                            .sort((a, b) => new Date(a.datetime) - new Date(b.datetime))
                            .map((s) => (
                              <div key={s.id} className="perf-session-row">
                                <div className="perf-session-dt">
                                  <span className="perf-session-date">{fmtDate(s.datetime)}</span>
                                  <span className="perf-session-time">{fmtTime(s.datetime)}</span>
                                </div>
                                <button
                                  className="perf-session-del"
                                  title="Remover sessão"
                                  onClick={() => handleDeleteSession(s.id)}
                                >
                                  ✕
                                </button>
                              </div>
                            ))}
                        </div>
                      ))
                  )}

                  <button
                    className="perf-add-sessions-btn"
                    onClick={() => setAddingSession(true)}
                  >
                    ＋ Adicionar sessões
                  </button>
                </>
              )}
            </div>

          </aside>
        </>
      )}

    </div>
  );
}
