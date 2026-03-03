/**
 * PerformanceForm.jsx
 *
 * Fluxo em 2 etapas:
 *   1) Metadados + banner  →  POST /performances  →  recebe performance.id
 *   2) Sessões             →  POST /sessions/rule ou /sessions/manual
 *
 * Layout etapa 1: banner 2:3 à esquerda | campos à direita
 * (espelha o padrão visual do TheaterForm)
 */
import { useState } from "react";
import { createPerformance } from "../../api/performances";
import { uploadImage, imageUrl } from "../../api/media";
import CrewEditor from "./CrewEditor";
import SessionsWizard from "./SessionsWizard";
import TagSelector from "./TagSelector";
import "./PerformanceForm.css";

// ── helpers ───────────────────────────────────────────────────────────────────
const csvToList = (s) =>
  s.split(",").map((x) => x.trim()).filter(Boolean);

const CLASSIFICATIONS = ["Livre", "10", "12", "14", "16", "18"];

const EMPTY_FORM = {
  name: "",
  synopsis: "",
  tags: [],
  classification: "Livre",
  season: new Date().getFullYear(),
  dramaturgyCsv: "",
  directionCsv: "",
  castCsv: "",
  crew: [],
};

// ── componente ────────────────────────────────────────────────────────────────
export default function PerformanceForm({ onSaved, onCancel } = {}) {
  const [step, setStep]               = useState(1);
  const [form, setForm]               = useState(EMPTY_FORM);
  const [bannerFile, setBannerFile]   = useState(null);
  const [bannerPreview, setBannerPreview] = useState(null);
  const [loading, setLoading]         = useState(false);
  const [msg, setMsg]                 = useState(null);
  const [createdPerf, setCreatedPerf] = useState(null);

  const set = (key, v) => setForm((f) => ({ ...f, [key]: v }));

  /**
   * Gera preview local sem base64 — o arquivo real vai via FormData no submit.
   */
  const onBannerChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setBannerFile(file);
    setBannerPreview(URL.createObjectURL(file));
  };

  // ── Etapa 1: salvar metadados ─────────────────────────────────────────────
  const submitMeta = async (e) => {
    e.preventDefault();
    setMsg(null);
    setLoading(true);

    try {
      let banner_url = null;
      if (bannerFile) {
        banner_url = await uploadImage(bannerFile, "banners");
      }

      const payload = {
        name:           form.name,
        synopsis:       form.synopsis,
        tags:           form.tags,
        classification: form.classification,
        season:         parseInt(form.season, 10),
        dramaturgy:     csvToList(form.dramaturgyCsv),
        direction:      csvToList(form.directionCsv),
        cast:           csvToList(form.castCsv),
        crew:           form.crew,
        banner_url,
      };

      const perf = await createPerformance(payload);
      setCreatedPerf(perf);
      setStep(2);
    } catch (err) {
      setMsg({ ok: false, text: err.message });
    } finally {
      setLoading(false);
    }
  };

  // ── Etapa 2: sessões ──────────────────────────────────────────────────────
  const onSessionsDone = () => {
    setMsg({ ok: true, text: `Performance "${createdPerf.name}" criada com sessões!` });
    onSaved?.();
    resetForm();
  };

  const skipSessions = () => {
    setMsg({ ok: true, text: `Performance "${createdPerf.name}" criada. Sessões podem ser adicionadas depois.` });
    onSaved?.();
    resetForm();
  };

  const resetForm = () => {
    setForm(EMPTY_FORM);
    setBannerFile(null);
    setBannerPreview(null);
    setCreatedPerf(null);
    setStep(1);
  };

  // ── render ────────────────────────────────────────────────────────────────
  return (
    <div className="pf-page">

      {/* ── Etapa 1: metadados ── */}
      {step === 1 && (
        <>
          <div className="pf-header">
            <h2 className="pf-title">
              Nova Performance
              <span className="pf-step-label"> — etapa 1/2 dados</span>
            </h2>
            <div className="pf-step-dots">
              <span className="pf-dot active" />
              <span className="pf-dot" />
            </div>
          </div>

          <form onSubmit={submitMeta} className="pf-form">

            {/* Layout: banner | campos */}
            <div className="pf-layout">

              {/* Banner 2:3 */}
              <div className="pf-banner-col">
                <label className="pf-banner-upload">
                  {bannerPreview
                    ? <img src={bannerPreview} alt="preview do banner" />
                    : (
                      <>
                        <span className="pf-banner-icon">🖼</span>
                        <span className="pf-banner-label">Clique para enviar o banner</span>
                      </>
                    )
                  }
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    hidden
                    onChange={onBannerChange}
                  />
                </label>
                <p className="pf-banner-hint">Proporção recomendada: 2:3</p>
              </div>

              {/* Campos */}
              <div className="pf-fields">

                {/* Nome | Classificação | Temporada */}
                <div className="pf-row pf-row-compact">
                  <div className="pf-field">
                    <label className="pf-label">Nome <span className="pf-req">*</span></label>
                    <input
                      className="pf-input"
                      required
                      placeholder="Título da peça"
                      value={form.name}
                      onChange={(e) => set("name", e.target.value)}
                    />
                  </div>
                  <div className="pf-field pf-field-sm">
                    <label className="pf-label">Classificação <span className="pf-req">*</span></label>
                    <select
                      className="pf-select"
                      value={form.classification}
                      onChange={(e) => set("classification", e.target.value)}
                    >
                      {CLASSIFICATIONS.map((c) => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div className="pf-field pf-field-xs">
                    <label className="pf-label">Temporada <span className="pf-req">*</span></label>
                    <input
                      className="pf-input"
                      type="number"
                      min="1900"
                      max="2100"
                      value={form.season}
                      onChange={(e) => set("season", e.target.value)}
                    />
                  </div>
                </div>

                {/* Sinopse */}
                <div className="pf-field">
                  <label className="pf-label">Sinopse <span className="pf-req">*</span></label>
                  <textarea
                    className="pf-textarea"
                    required
                    rows="4"
                    placeholder="Breve descrição da peça…"
                    value={form.synopsis}
                    onChange={(e) => set("synopsis", e.target.value)}
                  />
                </div>

                {/* Tags | Dramaturgia | Direção */}
                <div className="pf-row pf-row-3">
                  <div className="pf-field">
                    <label className="pf-label">Tags</label>
                    <TagSelector
                      value={form.tags}
                      onChange={(v) => set("tags", v)}
                    />
                  </div>
                  <div className="pf-field">
                    <label className="pf-label">Dramaturgia</label>
                    <input
                      className="pf-input"
                      placeholder="Nome A, Nome B"
                      value={form.dramaturgyCsv}
                      onChange={(e) => set("dramaturgyCsv", e.target.value)}
                    />
                  </div>
                  <div className="pf-field">
                    <label className="pf-label">Direção</label>
                    <input
                      className="pf-input"
                      placeholder="Diretora X, Diretor Y"
                      value={form.directionCsv}
                      onChange={(e) => set("directionCsv", e.target.value)}
                    />
                  </div>
                </div>

                {/* Elenco */}
                <div className="pf-field">
                  <label className="pf-label">Elenco</label>
                  <input
                    className="pf-input"
                    placeholder="Atriz A, Ator B, …"
                    value={form.castCsv}
                    onChange={(e) => set("castCsv", e.target.value)}
                  />
                </div>

                {/* Produção técnica */}
                <CrewEditor value={form.crew} onChange={(v) => set("crew", v)} />

              </div>
            </div>

            {/* Ações */}
            <div className="pf-actions">
              {onCancel && (
                <button type="button" className="pf-btn-secondary" onClick={onCancel}>
                  Cancelar
                </button>
              )}
              <button type="submit" className="pf-btn-primary" disabled={loading}>
                {loading ? "Salvando…" : "Próximo: Sessões →"}
              </button>
            </div>

            {msg && <p className={msg.ok ? "ok" : "err"} role="alert">{msg.text}</p>}
          </form>
        </>
      )}

      {/* ── Etapa 2: sessões ── */}
      {step === 2 && createdPerf && (
        <>
          <div className="pf-header">
            <h2 className="pf-title">
              Sessões de <em>{createdPerf.name}</em>
              <span className="pf-step-label"> — etapa 2/2</span>
            </h2>
            <div className="pf-step-dots">
              <span className="pf-dot" />
              <span className="pf-dot active" />
            </div>
          </div>

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
