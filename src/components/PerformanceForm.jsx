import { useState } from "react";
import { createPerformance } from "../api/performances";
import SessionsEditor, { toUtcISOString } from "./SessionsEditor";
import CrewEditor from "./CrewEditor";

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
    reader.onload = () => resolve(reader.result); // data URL
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

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
    sessions: [],
    banner: null,
  });
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState(null);
  const [bannerPreview, setBannerPreview] = useState(null);

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
        sessions: (form.sessions || []).map((s) => ({
          theater_id: s.theater_id,
          when: toUtcISOString(s.when),
        })),
        banner: form.banner || null,
      };
      const res = await createPerformance(payload);
      setMsg({ ok: true, text: `Performance criada: ${res.name}` });
      // limpa só o nome, deixa o resto pra facilitar entradas em série
      setForm((f) => ({ ...f, name: "", synopsis: "" }));
    } catch (err) {
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
                <option key={c} value={c}>{c}</option>
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
        <SessionsEditor
          value={form.sessions}
          onChange={(v) => set("sessions", v)}
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