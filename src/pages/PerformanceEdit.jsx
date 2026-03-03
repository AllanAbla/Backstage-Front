/**
 * PerformanceEdit.jsx
 *
 * Carrega a performance pelo :id da URL, pré-preenche o formulário
 * e executa PATCH ao salvar.
 *
 * Layout espelha o PerformanceForm: banner 2:3 à esquerda | campos à direita.
 */
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getPerformance, updatePerformance } from "../api/performances";
import { uploadImage, imageUrl } from "../api/media";
import CrewEditor from "../components/performances/CrewEditor";
import TagSelector from "../components/performances/TagSelector";
import "../components/performances/PerformanceForm.css";

const CLASSIFICATIONS = ["Livre", "10", "12", "14", "16", "18"];
const listToCSV = (arr) => (arr || []).join(", ");

export default function PerformanceEditPage() {
  const { id }     = useParams();
  const navigate   = useNavigate();

  const [form, setForm]               = useState(null);
  const [bannerFile, setBannerFile]   = useState(null);
  const [bannerPreview, setBannerPreview] = useState(null);
  const [loading, setLoading]         = useState(true);
  const [saving, setSaving]           = useState(false);
  const [msg, setMsg]                 = useState(null);

  // ── carrega dados ─────────────────────────────────────────────────────────
  useEffect(() => {
    getPerformance(id)
      .then((p) => {
        setForm({
          name:           p.name,
          synopsis:       p.synopsis,
          tags:           p.tags || [],
          classification: p.classification,
          season:         p.season,
          dramaturgyCsv:  listToCSV(p.dramaturgy),
          directionCsv:   listToCSV(p.direction),
          castCsv:        listToCSV(p.cast),
          crew:           p.crew || [],
          banner_url:     p.banner_url ?? null,
        });
        if (p.banner_url) setBannerPreview(imageUrl(p.banner_url));
      })
      .catch((err) => setMsg({ ok: false, text: err.message }))
      .finally(() => setLoading(false));
  }, [id]);

  const set = (key, v) => setForm((f) => ({ ...f, [key]: v }));

  const csvToList = (s) => s.split(",").map((x) => x.trim()).filter(Boolean);

  const onBannerChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setBannerFile(file);
    setBannerPreview(URL.createObjectURL(file));
  };

  // ── salva ─────────────────────────────────────────────────────────────────
  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMsg(null);
    try {
      let banner_url = form.banner_url;
      if (bannerFile) {
        banner_url = await uploadImage(bannerFile, "banners");
      }

      await updatePerformance(id, {
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
      });

      navigate("/performances");
    } catch (err) {
      setMsg({ ok: false, text: err.message });
    } finally {
      setSaving(false);
    }
  };

  // ── render ────────────────────────────────────────────────────────────────
  if (loading) return (
    <p style={{ padding: 40, opacity: .5, textAlign: "center" }}>Carregando…</p>
  );
  if (!form) return (
    <p style={{ padding: 40, color: "#ff5c7a", textAlign: "center" }}>
      Performance não encontrada.
    </p>
  );

  return (
    <div className="pf-page">

      {/* Header */}
      <div className="pf-header">
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <button
            type="button"
            className="pf-btn-secondary"
            style={{ height: 34, padding: "0 14px", fontSize: 13 }}
            onClick={() => navigate("/performances")}
          >
            ← voltar
          </button>
          <h2 className="pf-title">Editar performance</h2>
        </div>
      </div>

      <form onSubmit={submit} className="pf-form">

        {/* Layout: banner | campos */}
        <div className="pf-layout">

          {/* Banner 2:3 */}
          <div className="pf-banner-col">
            <label className="pf-banner-upload">
              {bannerPreview
                ? <img src={bannerPreview} alt="banner atual" />
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
            <p className="pf-banner-hint">
              {bannerFile
                ? "Nova imagem selecionada."
                : bannerPreview
                  ? "Imagem atual. Clique para substituir."
                  : "Proporção recomendada: 2:3"}
            </p>
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
          <button
            type="button"
            className="pf-btn-secondary"
            onClick={() => navigate("/performances")}
          >
            Cancelar
          </button>
          <button type="submit" className="pf-btn-primary" disabled={saving}>
            {saving ? "Salvando…" : "Salvar alterações"}
          </button>
        </div>

        {msg && <p className={msg.ok ? "ok" : "err"} role="alert">{msg.text}</p>}
      </form>
    </div>
  );
}