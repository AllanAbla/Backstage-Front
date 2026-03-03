/**
 * SessionsWizard.jsx
 *
 * Criação de sessões para uma performance já existente.
 * Recebe `performanceId` (string ObjectId) e chama:
 *   POST /sessions/rule   — modo recorrência semanal
 *   POST /sessions/manual — modo datas avulsas
 *
 * Pode ser usado tanto no fluxo de criação (PerformanceForm etapa 2)
 * quanto numa tela independente de gerenciamento de sessões.
 */
import { useState, useEffect } from "react";
import { listTheaters } from "../../api/theaters";
import { createSessionsByRule, createSessionsManual } from "../../api/sessions";

const WEEKDAYS = [
  { value: 0, label: "Segunda" },
  { value: 1, label: "Terça" },
  { value: 2, label: "Quarta" },
  { value: 3, label: "Quinta" },
  { value: 4, label: "Sexta" },
  { value: 5, label: "Sábado" },
  { value: 6, label: "Domingo" },
];

export default function SessionsWizard({ performanceId, onDone, onSkip }) {
  const [mode, setMode] = useState("rule");          // "rule" | "manual"
  const [theaters, setTheaters] = useState([]);
  const [theaterId, setTheaterId] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState(null);

  // ── Modo regra ────────────────────────────────────────────────────────────
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate]     = useState("");
  // rules: { [weekday]: ["HH:MM", ...] }
  const [rules, setRules] = useState({});

  // ── Modo manual ───────────────────────────────────────────────────────────
  const [manualDates, setManualDates] = useState([]); // ["2025-10-04T20:00", ...]
  const [manualInput, setManualInput] = useState(""); // datetime-local input

  useEffect(() => {
    listTheaters().then(setTheaters).catch(console.error);
  }, []);

  // ── Helpers de regra ──────────────────────────────────────────────────────
  const toggleWeekday = (day) => {
    setRules((prev) => {
      const next = { ...prev };
      if (next[day]) {
        delete next[day];
      } else {
        next[day] = ["20:00"]; // horário padrão
      }
      return next;
    });
  };

  const updateTime = (day, idx, val) => {
    setRules((prev) => {
      const times = [...(prev[day] || [])];
      times[idx] = val;
      return { ...prev, [day]: times };
    });
  };

  const addTime = (day) => {
    setRules((prev) => ({ ...prev, [day]: [...(prev[day] || []), "20:00"] }));
  };

  const removeTime = (day, idx) => {
    setRules((prev) => {
      const times = prev[day].filter((_, i) => i !== idx);
      if (!times.length) {
        const next = { ...prev };
        delete next[day];
        return next;
      }
      return { ...prev, [day]: times };
    });
  };

  // ── Submit ────────────────────────────────────────────────────────────────
  const submit = async () => {
    if (!theaterId) { setMsg({ ok: false, text: "Selecione um teatro." }); return; }
    setMsg(null);
    setLoading(true);

    try {
      let result;

      if (mode === "rule") {
        if (!startDate || !endDate || !Object.keys(rules).length) {
          setMsg({ ok: false, text: "Preencha datas e selecione ao menos um dia da semana." });
          return;
        }
        // rules precisa ter chaves numéricas (int) — JSON envia string, backend aceita int
        const rulesInt = Object.fromEntries(
          Object.entries(rules).map(([k, v]) => [parseInt(k), v])
        );
        result = await createSessionsByRule({
          performance_id: performanceId,
          theater_id:     parseInt(theaterId),
          start_date:     startDate,
          end_date:       endDate,
          rules:          rulesInt,
        });
      } else {
        if (!manualDates.length) {
          setMsg({ ok: false, text: "Adicione ao menos uma data/horário." });
          return;
        }
        result = await createSessionsManual({
          performance_id: performanceId,
          theater_id:     parseInt(theaterId),
          datetimes:      manualDates,
        });
      }

      setMsg({ ok: true, text: `${result.length} sessão(ões) criada(s) com sucesso!` });
      setTimeout(onDone, 1200);

    } catch (err) {
      setMsg({ ok: false, text: err.message });
    } finally {
      setLoading(false);
    }
  };

  // ── render ────────────────────────────────────────────────────────────────
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

      {/* Teatro */}
      <label>
        Teatro*
        <select value={theaterId} onChange={(e) => setTheaterId(e.target.value)}>
          <option value="">Selecione...</option>
          {theaters.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
        </select>
      </label>

      {/* Modo */}
      <div style={{ display: "flex", gap: 12 }}>
        <label style={{ cursor: "pointer" }}>
          <input type="radio" value="rule" checked={mode === "rule"} onChange={() => setMode("rule")} />
          {" "}Recorrência semanal
        </label>
        <label style={{ cursor: "pointer" }}>
          <input type="radio" value="manual" checked={mode === "manual"} onChange={() => setMode("manual")} />
          {" "}Datas avulsas
        </label>
      </div>

      {/* ── Modo Regra ── */}
      {mode === "rule" && (
        <fieldset>
          <legend>Recorrência</legend>

          <div className="grid2" style={{ marginBottom: 16 }}>
            <label>
              Data inicial*
              <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
            </label>
            <label>
              Data final*
              <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
            </label>
          </div>

          <p style={{ marginBottom: 8, opacity: .7, fontSize: 13 }}>Selecione os dias e horários:</p>

          {WEEKDAYS.map(({ value: day, label }) => (
            <div key={day} style={{ marginBottom: 10 }}>
              <label style={{ cursor: "pointer", fontWeight: rules[day] ? 600 : 400 }}>
                <input type="checkbox" checked={!!rules[day]} onChange={() => toggleWeekday(day)} />
                {" "}{label}
              </label>

              {rules[day] && (
                <div style={{ marginLeft: 24, marginTop: 6, display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {rules[day].map((t, i) => (
                    <div key={i} style={{ display: "flex", gap: 4, alignItems: "center" }}>
                      <input
                        type="time" value={t}
                        onChange={(e) => updateTime(day, i, e.target.value)}
                        style={{ width: 100 }}
                      />
                      <button type="button" className="secondary" onClick={() => removeTime(day, i)}>✕</button>
                    </div>
                  ))}
                  <button type="button" onClick={() => addTime(day)}>+ horário</button>
                </div>
              )}
            </div>
          ))}
        </fieldset>
      )}

      {/* ── Modo Manual ── */}
      {mode === "manual" && (
        <fieldset>
          <legend>Datas avulsas</legend>

          <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
            <input
              type="datetime-local"
              value={manualInput}
              onChange={(e) => setManualInput(e.target.value)}
            />
            <button
              type="button"
              onClick={() => {
                if (!manualInput) return;
                const iso = new Date(manualInput).toISOString();
                if (!manualDates.includes(iso)) {
                  setManualDates((d) => [...d, iso].sort());
                }
                setManualInput("");
              }}
            >
              Adicionar
            </button>
          </div>

          {manualDates.length === 0 && (
            <p style={{ opacity: .5, fontSize: 13 }}>Nenhuma data adicionada ainda.</p>
          )}

          <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
            {manualDates.map((iso, i) => (
              <li key={i} style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 4 }}>
                <span>{new Date(iso).toLocaleString("pt-BR")}</span>
                <button type="button" className="secondary"
                  onClick={() => setManualDates((d) => d.filter((_, j) => j !== i))}>
                  ✕
                </button>
              </li>
            ))}
          </ul>
        </fieldset>
      )}

      {msg && <p className={msg.ok ? "ok" : "err"} role="alert">{msg.text}</p>}

      <div className="actions">
        <button type="button" className="secondary" onClick={onSkip} disabled={loading}>
          Pular sessões por agora
        </button>
        <button type="button" onClick={submit} disabled={loading}>
          {loading ? "Salvando..." : "Criar sessões"}
        </button>
      </div>
    </div>
  );
}