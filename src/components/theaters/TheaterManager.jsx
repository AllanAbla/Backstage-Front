import { useEffect, useState } from "react";
import { listTheaters, updateTheater } from "../../api/theaters";

export default function TheaterManager() {
  const [theaters, setTheaters] = useState([]);
  const [editing, setEditing] = useState(null); // objeto do teatro sendo editado
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState(null);

  async function refresh() {
    const data = await listTheaters();
    setTheaters(data || []);
  }

  useEffect(() => { refresh(); }, []);

  const startEdit = (t) => {
    // garante que usamos `id` e clona pra formulário
    setEditing(JSON.parse(JSON.stringify(t)));
    setMsg(null);
  };

  const cancelEdit = () => {
    setEditing(null);
    setMsg(null);
  };

  const handleField = (path, value) => {
    // atualiza campos aninhados (ex: address.city)
    setEditing((prev) => {
      const clone = { ...prev };
      const parts = path.split(".");
      let ref = clone;
      for (let i = 0; i < parts.length - 1; i++) {
        ref[parts[i]] = ref[parts[i]] ?? {};
        ref = ref[parts[i]];
      }
      ref[parts.at(-1)] = value;
      return clone;
    });
  };

  const handleSave = async () => {
    if (!editing?.id) return;
    setSaving(true);
    setMsg(null);
    try {
      const payload = {
        name: editing.name,
        slug: editing.slug,
        address: editing.address,
        location: editing.location,
        contacts: editing.contacts,
      };
      await updateTheater(editing.id, payload);
      await refresh();
      setMsg({ ok: true, text: "Teatro atualizado com sucesso!" });
      setEditing(null);
    } catch (e) {
      setMsg({ ok: false, text: String(e.message || e) });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="card">
      <h3>Editar Teatros</h3>

      {!editing ? (
        <table className="table">
          <thead>
            <tr>
              <th>Nome</th>
              <th>Endereço</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {theaters.map((t) => (
              <tr key={t.id /* <- usar id */}>
                <td>{t.name}</td>
                <td>
                  {t.address?.street} - {t.address?.city}/{t.address?.state}
                </td>
                <td>
                  <button onClick={() => startEdit(t)}>Editar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <div className="form-grid">
          <label>
            Nome
            <input
              value={editing.name || ""}
              onChange={(e) => handleField("name", e.target.value)}
            />
          </label>

          <label>
            Slug
            <input
              value={editing.slug || ""}
              onChange={(e) => handleField("slug", e.target.value)}
            />
          </label>

          <label>
            Rua
            <input
              value={editing.address?.street || ""}
              onChange={(e) => handleField("address.street", e.target.value)}
            />
          </label>

          <label>
            Bairro
            <input
              value={editing.address?.neighborhood || ""}
              onChange={(e) => handleField("address.neighborhood", e.target.value)}
            />
          </label>

          <label>
            Cidade
            <input
              value={editing.address?.city || ""}
              onChange={(e) => handleField("address.city", e.target.value)}
            />
          </label>

          <label>
            Estado
            <input
              value={editing.address?.state || ""}
              onChange={(e) => handleField("address.state", e.target.value)}
            />
          </label>

          <label>
            CEP
            <input
              value={editing.address?.postal_code || ""}
              onChange={(e) => handleField("address.postal_code", e.target.value)}
            />
          </label>

          <div className="actions" style={{ marginTop: "0.75rem" }}>
            <button onClick={cancelEdit} disabled={saving}>Cancelar</button>
            <button onClick={handleSave} disabled={saving}>
              {saving ? "Salvando..." : "Salvar"}
            </button>
          </div>

          {msg && (
            <p className={msg.ok ? "ok" : "err"} role="alert" style={{ gridColumn: "1 / -1" }}>
              {msg.text}
            </p>
          )}
        </div>
      )}
    </div>
  );
}