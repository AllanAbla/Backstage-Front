/**
 * PerformanceForm.jsx
 *
 * Fluxo em 2 etapas:
 *   1) Metadados + banner  →  POST /performances  →  recebe performance.id
 *   2) Sessões             →  POST /sessions/rule ou /sessions/manual
 *      usando o id recém-criado como performance_id
 *
 * TheatersEditor foi movido para ./TheatersEditor.jsx
 * A lógica de geração de sessões vive APENAS no backend agora.
 */
import { useState, useEffect } from "react";
import { createPerformance } from "../../api/performances";
import { uploadImage, imageUrl } from "../../api/media";
import CrewEditor from "./CrewEditor";
import SessionsWizard from "./SessionsWizard";

// ── helpers ──────────────────────────────────────────────────────────────────
const csvToList = (s) =>
  s.split(",").map((x) => x.trim()).filter(Boolean);

const CLASSIFICATIONS = ["Livre", "10", "12", "14", "16", "18"];

const EMPTY_FORM = {
  name: "",
  synopsis: "",
  tagsCsv: "",
  classification: "Livre",
  season: new Date().getFullYear(),
  dramaturgyCsv: "",
  directionCsv: "",
  castCsv: "",
  crew: [],
};

// ── componente ────────────────────────────────────────────────────────────────
export default function PerformanceForm({ onSaved, onCancel } = {}) {
  const [step, setStep] = useState(1);          // 1 = metadados, 2 = sessões
  const [form, setForm] = useState(EMPTY_FORM);
  const [bannerFile, setBannerFile] = useState(null);
  const [bannerPreview, setBannerPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState(null);
  const [createdPerf, setCreatedPerf] = useState(null); // performance criada na etapa 1

  const set = (key, v) => setForm((f) => ({ ...f, [key]: v }));

  const onBannerChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setBannerFile(file);
    setBannerPreview(URL.createObjectURL(file)); // preview local sem base64
  };

  // ── Etapa 1: salvar metadados ─────────────────────────────────────────────
  const submitMeta = async (e) => {
    e.preventDefault();
    setMsg(null);
    setLoading(true);

    try {
      // 1a) Upload do banner (se escolhido) antes de criar a performance
      let banner_url = null;
      if (bannerFile) {
        banner_url = await uploadImage(bannerFile, "banners");
      }

      const payload = {
        name:           form.name,
        synopsis:       form.synopsis,
        tags:           csvToList(form.tagsCsv),
        classification: form.classification,
        season:         parseInt(form.season, 10),
        dramaturgy:     csvToList(form.dramaturgyCsv),
        direction:      csvToList(form.directionCsv),
        cast:           csvToList(form.castCsv),
        crew:           form.crew,
        banner_url,
      };

      // 1b) Cria a performance (apenas metadados)
      const perf = await createPerformance(payload);
      setCreatedPerf(perf);
      setStep(2); // avança para etapa de sessões
    } catch (err) {
      setMsg({ ok: false, text: err.message });
    } finally {
      setLoading(false);
    }
  };

  // ── Etapa 2: sessões criadas via SessionsWizard ───────────────────────────
  const onSessionsDone = () => {
    setMsg({ ok: true, text: `Performance "${createdPerf.name}" criada com sessões!` });
    onSaved?.();
    // Reset para criar outra
    setForm(EMPTY_FORM);
    setBannerFile(null);
    setBannerPreview(null);
    setCreatedPerf(null);
    setStep(1);
  };

  const skipSessions = () => {
    setMsg({ ok: true, text: `Performance "${createdPerf.name}" criada. Sessões podem ser adicionadas depois.` });
    onSaved?.();
    setForm(EMPTY_FORM);
    setBannerFile(null);
    setBannerPreview(null);
    setCreatedPerf(null);
    setStep(1);
  };

  // ── render ────────────────────────────────────────────────────────────────
  return (
    <div className="card">

      {/* ── Etapa 1: metadados ── */}
      {step === 1 && (
        <>
          <h2>Nova Performance <small style={{ opacity: .5, fontSize: "0.6em" }}>etapa 1/2 — dados</small></h2>

          <form onSubmit={submitMeta} className="form">
            <div className="grid2">
              <label>
                Nome*
                <input required value={form.name} onChange={(e) => set("name", e.target.value)} />
              </label>
              <label>
                Classificação*
                <select value={form.classification} onChange={(e) => set("classification", e.target.value)}>
                  {CLASSIFICATIONS.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </label>
            </div>

            <label>
              Temporada (ano)*
              <input
                type="number" min="1900" max="2100"
                value={form.season}
                onChange={(e) => set("season", e.target.value)}
              />
            </label>

            <label>
              Sinopse*
              <textarea required rows="4" value={form.synopsis} onChange={(e) => set("synopsis", e.target.value)} />
            </label>

            <div className="grid3">
              <label>
                Tags (vírgula)
                <input placeholder="musical, comédia" value={form.tagsCsv} onChange={(e) => set("tagsCsv", e.target.value)} />
              </label>
              <label>
                Dramaturgia (vírgula)
                <input placeholder="Nome A, Nome B" value={form.dramaturgyCsv} onChange={(e) => set("dramaturgyCsv", e.target.value)} />
              </label>
              <label>
                Direção (vírgula)
                <input placeholder="Diretora X, Diretor Y" value={form.directionCsv} onChange={(e) => set("directionCsv", e.target.value)} />
              </label>
            </div>

            <label>
              Elenco (vírgula)
              <input placeholder="Atriz A, Ator B" value={form.castCsv} onChange={(e) => set("castCsv", e.target.value)} />
            </label>

            <CrewEditor value={form.crew} onChange={(v) => set("crew", v)} />

            {/* Banner — arquivo, não base64 */}
            <fieldset>
              <legend>Banner</legend>
              <input type="file" accept="image/jpeg,image/png,image/webp" onChange={onBannerChange} />
              {bannerPreview && (
                <img src={bannerPreview} alt="Prévia do banner"
                  style={{ maxWidth: 320, display: "block", marginTop: 8, borderRadius: 8 }} />
              )}
            </fieldset>

            <div className="actions">
              {onCancel && <button type="button" className="secondary" onClick={onCancel}>Cancelar</button>}
              <button type="submit" disabled={loading}>
                {loading ? "Salvando..." : "Próximo: Sessões →"}
              </button>
            </div>

            {msg && <p className={msg.ok ? "ok" : "err"} role="alert">{msg.text}</p>}
          </form>
        </>
      )}

      {/* ── Etapa 2: sessões ── */}
      {step === 2 && createdPerf && (
        <>
          <h2>
            Sessões de <em>{createdPerf.name}</em>
            <small style={{ opacity: .5, fontSize: "0.6em", marginLeft: 8 }}>etapa 2/2</small>
          </h2>

          <SessionsWizard
            performanceId={createdPerf.id ?? createdPerf._id}
            onDone={onSessionsDone}
            onSkip={skipSessions}
          />
        </>
      )}

    </div>
  );
}