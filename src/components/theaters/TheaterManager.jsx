// src/components/theaters/TheaterManager.jsx
import { useEffect, useMemo, useState } from "react";
import { listTheaters, updateTheater } from "../../api/theaters";

export default function TheaterManager() {
  const [theaters, setTheaters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);
  const [editing, setEditing] = useState(null); // teatro selecionado para editar

  async function refresh() {
    setLoading(true);
    setError(null);
    try {
      const res = await listTheaters();
      const raw = Array.isArray(res) ? res : res?.data || [];
      // Normaliza o ID (cobre API que retorna _id)
      const data = raw.map((t) => ({ ...t, id: t.id || t._id }));
      setTheaters(data);
    } catch (e) {
      setError("Não foi possível carregar a lista de teatros.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh();
  }, []);

  const startEdit = (t) => {
    setMessage(null);
    setError(null);
    // Clona e garante que o id está presente
    const withId = { ...t, id: t.id || t._id };
    setEditing(JSON.parse(JSON.stringify(withId)));
  };

  const cancelEdit = () => {
    setEditing(null);
    setMessage(null);
    setError(null);
  };

  // Atualiza campos aninhados: handleField("address.city", "São Paulo")
  const handleField = (path, value) => {
    setEditing((prev) => {
      const clone = { ...(prev || {}) };
      const parts = path.split(".");
      let ref = clone;
      for (let i = 0; i < parts.length - 1; i++) {
        const k = parts[i];
        ref[k] = ref[k] ?? {};
        ref = ref[k];
      }
      ref[parts.at(-1)] = value;
      return clone;
    });
  };

  const handleSave = async () => {
    if (!editing?.id) {
      setError("ID do teatro ausente.");
      return;
    }
    setSaving(true);
    setMessage(null);
    setError(null);
    try {
      const payload = {
        name: editing.name ?? "",
        slug: editing.slug ?? "",
        address: editing.address ?? {},
        location: editing.location ?? null,
        contacts: editing.contacts ?? {},
      };
      await updateTheater(editing.id, payload); // PATCH /theaters/:id
      setMessage("Teatro atualizado com sucesso!");
      setEditing(null);
      await refresh();
    } catch (e) {
      setError(
        e?.response?.data?.message || e?.message || "Falha ao salvar alterações."
      );
    } finally {
      setSaving(false);
    }
  };

  const sorted = useMemo(
    () =>
      [...theaters].sort((a, b) =>
        (a?.name || "").localeCompare(b?.name || "", "pt-BR", {
          sensitivity: "base",
        })
      ),
    [theaters]
  );

  if (loading) return <p>Carregando teatros…</p>;

  return (
    <div className="card">
      <h3>Editar Teatros</h3>

      {error && (
        <p role="alert" style={{ color: "crimson", marginBottom: 12 }}>
          {error}
        </p>
      )}
      {message && (
        <p role="status" style={{ color: "green", marginBottom: 12 }}>
          {message}
        </p>
      )}

      {!editing ? (
        <>
          {sorted.length === 0 ? (
            <p>Nenhum teatro cadastrado.</p>
          ) : (
            <table className="table" style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  <th style={{ textAlign: "left", padding: 8 }}>Nome</th>
                  <th style={{ textAlign: "left", padding: 8 }}>Endereço</th>
                  <th style={{ textAlign: "left", padding: 8 }}>Ações</th>
                </tr>
              </thead>
              <tbody>
                {sorted.map((t) => (
                  <tr key={t.id}>
                    <td style={{ padding: 8 }}>{t.name}</td>
                    <td style={{ padding: 8 }}>
                      {[
                        t.address?.street,
                        t.address?.neighborhood,
                        t.address?.city &&
                          `${t.address.city}${t.address?.state ? `/${t.address.state}` : ""}`,
                        t.address?.postal_code,
                      ]
                        .filter(Boolean)
                        .join(" · ")}
                    </td>
                    <td style={{ padding: 8 }}>
                      <button onClick={() => startEdit(t)}>Editar</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </>
      ) : (
        <div className="form-grid" style={{ display: "grid", gap: 12, maxWidth: 720 }}>
          <div style={{ display: "grid", gap: 6 }}>
            <label>Nome</label>
            <input
              value={editing.name || ""}
              onChange={(e) => handleField("name", e.target.value)}
              placeholder="Nome do teatro"
            />
          </div>

          <div style={{ display: "grid", gap: 6 }}>
            <label>Slug</label>
            <input
              value={editing.slug || ""}
              onChange={(e) => handleField("slug", e.target.value)}
              placeholder="slug-teatro"
            />
          </div>

          <fieldset style={{ border: "1px solid #ddd", padding: 12 }}>
            <legend>Endereço</legend>
            <div style={{ display: "grid", gap: 12, gridTemplateColumns: "1fr 1fr" }}>
              <div style={{ display: "grid", gap: 6 }}>
                <label>Rua</label>
                <input
                  value={editing.address?.street || ""}
                  onChange={(e) => handleField("address.street", e.target.value)}
                  placeholder="Rua"
                />
              </div>
              <div style={{ display: "grid", gap: 6 }}>
                <label>Bairro</label>
                <input
                  value={editing.address?.neighborhood || ""}
                  onChange={(e) =>
                    handleField("address.neighborhood", e.target.value)
                  }
                  placeholder="Bairro"
                />
              </div>
              <div style={{ display: "grid", gap: 6 }}>
                <label>Cidade</label>
                <input
                  value={editing.address?.city || ""}
                  onChange={(e) => handleField("address.city", e.target.value)}
                  placeholder="Cidade"
                />
              </div>
              <div style={{ display: "grid", gap: 6 }}>
                <label>Estado</label>
                <input
                  value={editing.address?.state || ""}
                  onChange={(e) => handleField("address.state", e.target.value)}
                  placeholder="UF"
                />
              </div>
              <div style={{ display: "grid", gap: 6 }}>
                <label>CEP</label>
                <input
                  value={editing.address?.postal_code || ""}
                  onChange={(e) =>
                    handleField("address.postal_code", e.target.value)
                  }
                  placeholder="00000-000"
                />
              </div>
            </div>
          </fieldset>

          <fieldset style={{ border: "1px solid #ddd", padding: 12 }}>
            <legend>Contatos</legend>
            <div style={{ display: "grid", gap: 12, gridTemplateColumns: "1fr 1fr" }}>
              <div style={{ display: "grid", gap: 6 }}>
                <label>Telefone</label>
                <input
                  value={editing.contacts?.phone || ""}
                  onChange={(e) => handleField("contacts.phone", e.target.value)}
                  placeholder="(11) 0000-0000"
                />
              </div>
              <div style={{ display: "grid", gap: 6 }}>
                <label>E-mail</label>
                <input
                  value={editing.contacts?.email || ""}
                  onChange={(e) => handleField("contacts.email", e.target.value)}
                  placeholder="contato@exemplo.com"
                />
              </div>
            </div>
          </fieldset>

          <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
            <button type="button" onClick={cancelEdit} disabled={saving}>
              Cancelar
            </button>
            <button type="button" onClick={handleSave} disabled={saving}>
              {saving ? "Salvando…" : "Salvar"}
            </button>
          </div>

          {/* debug opcional */}
          <small style={{ opacity: 0.6 }}>ID: {editing.id}</small>
        </div>
      )}
    </div>
  );
}