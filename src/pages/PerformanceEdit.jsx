/**
 * PerformanceEdit.jsx
 * Carrega a performance pelo :id da URL, pré-preenche o PerformanceForm
 * e executa PATCH ao salvar.
 */
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getPerformance, updatePerformance } from "../api/performances";
import { uploadImage, imageUrl } from "../api/media";
import CrewEditor from "../components/performances/CrewEditor";

const CLASSIFICATIONS = ["Livre", "10", "12", "14", "16", "18"];
const listToCSV = (arr) => (arr || []).join(", ");

export default function PerformanceEditPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState(null);
  const [bannerFile, setBannerFile]       = useState(null);
  const [bannerPreview, setBannerPreview] = useState(null);
  const [loading, setLoading]             = useState(true);
  const [saving, setSaving]               = useState(false);
  const [msg, setMsg]                     = useState(null);

  // ── carrega dados ─────────────────────────────────────────────────────────
  useEffect(() => {
    getPerformance(id)
      .then((p) => {
        setForm({
          name:           p.name,
          synopsis:       p.synopsis,
          tagsCsv:        listToCSV(p.tags),
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
        tags:           csvToList(form.tagsCsv),
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
  if (loading) return <p style={{ padding: 40, opacity: .5, textAlign: "center" }}>Carregando…</p>;
  if (!form)   return <p style={{ padding: 40, color: "#ff5c7a", textAlign: "center" }}>Performance não encontrada.</p>;

  return (
    <div className="card" style={{ width: "70%", margin: "32px auto", paddingBottom: 48 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
        <h2 style={{ margin: 0 }}>Editar performance</h2>
        <button className="secondary" onClick={() => navigate("/performances")}>← Voltar</button>
      </div>

      <form onSubmit={submit} className="form">
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
          <input type="number" min="1900" max="2100"
            value={form.season} onChange={(e) => set("season", e.target.value)} />
        </label>

        <label>
          Sinopse*
          <textarea required rows="4"
            value={form.synopsis} onChange={(e) => set("synopsis", e.target.value)} />
        </label>

        <div className="grid3">
          <label>
            Tags (vírgula)
            <input placeholder="musical, comédia"
              value={form.tagsCsv} onChange={(e) => set("tagsCsv", e.target.value)} />
          </label>
          <label>
            Dramaturgia (vírgula)
            <input placeholder="Nome A, Nome B"
              value={form.dramaturgyCsv} onChange={(e) => set("dramaturgyCsv", e.target.value)} />
          </label>
          <label>
            Direção (vírgula)
            <input placeholder="Diretora X, Diretor Y"
              value={form.directionCsv} onChange={(e) => set("directionCsv", e.target.value)} />
          </label>
        </div>

        <label>
          Elenco (vírgula)
          <input placeholder="Atriz A, Ator B"
            value={form.castCsv} onChange={(e) => set("castCsv", e.target.value)} />
        </label>

        <CrewEditor value={form.crew} onChange={(v) => set("crew", v)} />

        <fieldset>
          <legend>Banner</legend>
          {bannerPreview && (
            <img src={bannerPreview} alt="Banner atual"
              style={{ maxWidth: 280, display: "block", marginBottom: 10, borderRadius: 8 }} />
          )}
          <input type="file" accept="image/jpeg,image/png,image/webp" onChange={onBannerChange} />
          {bannerPreview && (
            <small style={{ opacity: .5 }}>
              {bannerFile ? "Nova imagem selecionada." : "Imagem atual. Escolha outra para substituir."}
            </small>
          )}
        </fieldset>

        <div className="actions">
          <button type="button" className="secondary" onClick={() => navigate("/performances")}>
            Cancelar
          </button>
          <button type="submit" disabled={saving}>
            {saving ? "Salvando…" : "Salvar alterações"}
          </button>
        </div>

        {msg && <p className={msg.ok ? "ok" : "err"} role="alert">{msg.text}</p>}
      </form>
    </div>
  );
}