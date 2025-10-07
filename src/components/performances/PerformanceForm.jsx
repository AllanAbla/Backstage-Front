import { useState, useEffect } from "react";
import { createPerformance } from "../../api/performances";
import { listTheaters } from "../../api/theaters";
import CrewEditor from "./CrewEditor";
import SessionsEditor from "./SessionsEditor";

// ---------- Helpers ----------
function csvToList(s) {
  return s
    .split(",")
    .map((x) => x.trim())
    .filter(Boolean);
}

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    if (!file) return resolve(null);
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// ---------- Geração automática das sessões ----------
function generateSessionsFromRules(ruleData) {
  if (!ruleData?.rules?.length || !ruleData.startDate || !ruleData.endDate) return [];

  const start = new Date(ruleData.startDate);
  const end = new Date(ruleData.endDate);
  const sessions = [];

  for (let date = new Date(start); date <= end; date.setDate(date.getDate() + 1)) {
    const weekday = date.getDay();
    ruleData.rules.forEach((rule) => {
      if (Number(rule.weekday) === weekday) {
        rule.times.forEach((time) => {
          if (!time) return;
          const [h, m] = time.split(":").map(Number);
          const d = new Date(date);
          d.setHours(h, m, 0, 0);
          sessions.push({ when: d.toISOString() });
        });
      }
    });
  }

  return sessions.sort((a, b) => new Date(a.when) - new Date(b.when));
}

// ---------- TheatersEditor ----------
function TheatersEditor({ value, onChange, theatersOptions }) {
  const addTheater = () => {
    onChange([...value, { theater_id: "", sessions: { mode: "rule", ruleData: {}, manualSessions: [] } }]);
  };

  const updateTheater = (index, field, v) => {
    const updated = [...value];
    updated[index][field] = v;
    onChange(updated);
  };

  const updateSessions = (index, sessions) => {
    const updated = [...value];
    updated[index].sessions = sessions;
    onChange(updated);
  };

  const removeTheater = (index) => {
    const updated = [...value];
    updated.splice(index, 1);
    onChange(updated);
  };

  return (
    <fieldset>
      <legend>Teatros</legend>
      <button type="button" onClick={addTheater}>
        ➕ Adicionar Teatro
      </button>

      {value.map((theater, i) => (
        <div
          key={i}
          className="theater-block"
          style={{
            border: "1px solid #ccc",
            padding: 10,
            marginTop: 10,
            borderRadius: 8,
          }}
        >
          <label>
            Teatro*
            <select
              required
              value={theater.theater_id}
              onChange={(e) => updateTheater(i, "theater_id", e.target.value)}
            >
              <option value="">Selecione...</option>
              {theatersOptions.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </label>

          <SessionsEditor
            onChange={(sessions) => updateSessions(i, sessions)}
            value={theater.sessions}
          />

          <button
            type="button"
            className="secondary"
            onClick={() => removeTheater(i)}
          >
            ❌ Remover Teatro
          </button>
        </div>
      ))}
    </fieldset>
  );
}

// ---------- PerformanceForm ----------
export default function PerformanceForm() {
  const [form, setForm] = useState({
    name: "",
    synopsis: "",
    tagsCsv: "",
    classification: "Livre",
    season: new Date().getFullYear(),
    dramaturgyCsv: "",
    directionCsv: "",
    castCsv: "",
    crew: [],
    theaters: [],
    banner: null,
  });
  const [theatersOptions, setTheatersOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState(null);
  const [bannerPreview, setBannerPreview] = useState(null);

  // carregar lista de teatros
  useEffect(() => {
    async function fetchTheaters() {
      try {
        const data = await listTheaters();
        setTheatersOptions(data);
      } catch (err) {
        console.error("Erro ao carregar teatros:", err);
      }
    }
    fetchTheaters();
  }, []);

  const set = (key, v) => setForm((f) => ({ ...f, [key]: v }));

  const onBannerChange = async (e) => {
    const file = e.target.files?.[0];
    const dataUrl = await fileToBase64(file);
    set("banner", dataUrl);
    setBannerPreview(dataUrl);
  };

  const submit = async (e) => {
    e.preventDefault();
    setMsg(null);
    setLoading(true);
    try {
      const payload = {
        name: form.name,
        synopsis: form.synopsis,
        tags: csvToList(form.tagsCsv),
        classification: form.classification,
        season: parseInt(form.season, 10),
        dramaturgy: csvToList(form.dramaturgyCsv),
        direction: csvToList(form.directionCsv),
        cast: csvToList(form.castCsv),
        crew: form.crew,
        theaters: (form.theaters || []).map((t) => {
          let sessions = [];

          // 🔥 Gera sessões automaticamente
          if (t.sessions?.mode === "rule") {
            sessions = generateSessionsFromRules(t.sessions.ruleData);
          } else if (t.sessions?.mode === "manual") {
            sessions = t.sessions.manualSessions || [];
          }

          return {
            theater_id: t.theater_id,
            sessions,
          };
        }),
        banner: form.banner || null,
      };

      const res = await createPerformance(payload);
      setMsg({ ok: true, text: `Performance criada: ${res.name}` });
      setForm((f) => ({ ...f, name: "", synopsis: "" }));
    } catch (err) {
      console.error("Erro ao salvar performance:", err);
      setMsg({ ok: false, text: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card">
      <h2>Nova Performance</h2>
      <form onSubmit={submit} className="form">
        <div className="grid2">
          <label>
            Nome*
            <input
              required
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
            />
          </label>
          <label>
            Classificação*
            <select
              value={form.classification}
              onChange={(e) => set("classification", e.target.value)}
            >
              {["Livre", "10", "12", "14", "16", "18"].map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </label>
        </div>

        <label>
          Temporada (ano)*
          <input
            type="number"
            min="1900"
            max="2100"
            value={form.season}
            onChange={(e) => set("season", e.target.value)}
          />
        </label>

        <label>
          Sinopse*
          <textarea
            required
            rows="4"
            value={form.synopsis}
            onChange={(e) => set("synopsis", e.target.value)}
          />
        </label>

        <div className="grid3">
          <label>
            Tags (vírgula)
            <input
              placeholder="musical, comédia"
              value={form.tagsCsv}
              onChange={(e) => set("tagsCsv", e.target.value)}
            />
          </label>
          <label>
            Dramaturgia (vírgula)
            <input
              placeholder="Nome A, Nome B"
              value={form.dramaturgyCsv}
              onChange={(e) => set("dramaturgyCsv", e.target.value)}
            />
          </label>
          <label>
            Direção (vírgula)
            <input
              placeholder="Diretora X, Diretor Y"
              value={form.directionCsv}
              onChange={(e) => set("directionCsv", e.target.value)}
            />
          </label>
        </div>

        <label>
          Elenco (vírgula)
          <input
            placeholder="Atriz A, Ator B"
            value={form.castCsv}
            onChange={(e) => set("castCsv", e.target.value)}
          />
        </label>

        <CrewEditor value={form.crew} onChange={(v) => set("crew", v)} />

        <TheatersEditor
          value={form.theaters}
          onChange={(v) => set("theaters", v)}
          theatersOptions={theatersOptions}
        />

        <fieldset>
          <legend>Banner (base64)</legend>
          <input type="file" accept="image/*" onChange={onBannerChange} />
          {bannerPreview && (
            <>
              <small>Prévia:</small>
              <img
                src={bannerPreview}
                alt="Banner preview"
                style={{ maxWidth: "320px", display: "block", marginTop: 8 }}
              />
            </>
          )}
        </fieldset>

        <div className="actions">
          <button disabled={loading}>
            {loading ? "Salvando..." : "Salvar"}
          </button>
        </div>

        {msg && (
          <p className={msg.ok ? "ok" : "err"} role="alert">
            {msg.text}
          </p>
        )}
      </form>
    </div>
  );
}
