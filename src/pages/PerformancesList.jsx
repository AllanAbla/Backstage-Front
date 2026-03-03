/**
 * PerformancesList.jsx
 *
 * Lista todas as performances em cards com banner.
 * Ao clicar num card, abre um drawer lateral com:
 *   - Metadados da performance
 *   - Sessões agrupadas por teatro (via GET /sessions/by-performance/:id)
 *   - Ações: Editar, Excluir performance, Adicionar sessões, Remover sessão
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
  return new Date(iso).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
}

// Agrupa sessões por theater_id → { [theater_id]: [session, ...] }
function groupByTheater(sessions) {
  return sessions.reduce((acc, s) => {
    const k = s.theater_id;
    if (!acc[k]) acc[k] = [];
    acc[k].push(s);
    return acc;
  }, {});
}

// ── componente principal ──────────────────────────────────────────────────────

export default function PerformancesList({ onAddNew }) {
  const navigate = useNavigate();

  const [performances, setPerformances] = useState([]);
  const [theatersMap, setTheatersMap]   = useState({}); // { [id]: name }
  const [loading, setLoading]           = useState(true);

  // filtros
  const [q, setQ]                             = useState("");
  const [filterSeason, setFilterSeason]       = useState("");
  const [filterClass, setFilterClass]         = useState("");

  // drawer
  const [selected, setSelected]               = useState(null);  // performance
  const [sessions, setSessions]               = useState([]);
  const [sessionsLoading, setSessionsLoading] = useState(false);
  const [addingSession, setAddingSession]     = useState(false); // exibe SessionsWizard no drawer
  const [confirmDel, setConfirmDel]           = useState(false);

  // ── carga inicial ─────────────────────────────────────────────────────────
  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [perfs, theaters] = await Promise.all([
        listPerformances(),
        listTheaters(),
      ]);
      setPerformances(perfs);
      const map = {};
      theaters.forEach((t) => { map[t.id] = t.name; });
      setTheatersMap(map);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  // ── filtro client-side ────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    const term = q.toLowerCase();
    return performances.filter((p) => {
      const matchQ = !term ||
        p.name.toLowerCase().includes(term) ||
        (p.synopsis || "").toLowerCase().includes(term) ||
        (p.tags || []).some((t) => t.toLowerCase().includes(term));
      const matchS = !filterSeason || String(p.season) === filterSeason;
      const matchC = !filterClass || p.classification === filterClass;
      return matchQ && matchS && matchC;
    });
  }, [performances, q, filterSeason, filterClass]);

  const seasons = useMemo(() => {
    const s = new Set(performances.map((p) => String(p.season)));
    return Array.from(s).sort((a, b) => b - a);
  }, [performances]);

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
      await deleteByPerformance(perfId);  // remove sessões primeiro
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

      {/* Filtros */}
      <div className="perf-filters">
        <input
          placeholder="Buscar por nome, sinopse ou tag…"
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
        {(q || filterSeason || filterClass) && (
          <button className="perf-filters-clear"
            onClick={() => { setQ(""); setFilterSeason(""); setFilterClass(""); }}>
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
              const perfId = p.id ?? p._id;
              const isActive = selected && (selected.id ?? selected._id) === perfId;
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

            {/* Cabeçalho do drawer */}
            <div className="perf-drawer-head">
              <button className="perf-drawer-close" onClick={closeDrawer}>✕</button>
              <h2 className="perf-drawer-title">{selected.name}</h2>
              <p className="perf-drawer-sub">
                {selected.season} · {selected.classification}
                {selected.tags?.length > 0 && ` · ${selected.tags.slice(0, 3).join(", ")}`}
              </p>
            </div>

            {/* Ações */}
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

            {/* Corpo: sessões ou wizard */}
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
                            {theatersMap[theaterId] ?? `Teatro #${theaterId}`}
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