import { useState } from "react";
import { createTheater } from "../api/theaters";

export default function TheaterForm() {
  const [form, setForm] = useState({
    name: "",
    slug: "",
    address: {
      street: "",
      neighborhood: "",
      city: "São Paulo",
      state: "SP",
      postal_code: "",
      country: "BR",
    },
    location: { type: "Point", coordinates: ["", ""] }, // [lng, lat]
    contacts: { website: "" },
  });
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState(null);

  const set = (path, val) => {
    setForm((f) => {
      const next = structuredClone(f);
      const keys = path.split(".");
      let cur = next;
      for (let i = 0; i < keys.length - 1; i++) cur = cur[keys[i]];
      cur[keys.at(-1)] = val;
      return next;
    });
  };

  const submit = async (e) => {
    e.preventDefault();
    setMsg(null);
    setLoading(true);
    try {
      const lng = parseFloat(form.location.coordinates[0]);
      const lat = parseFloat(form.location.coordinates[1]);
      if (Number.isNaN(lng) || Number.isNaN(lat))
        throw new Error("Coordenadas inválidas");
      const payload = {
        ...form,
        location: { type: "Point", coordinates: [lng, lat] },
        contacts: form.contacts.website ? form.contacts : null,
      };
      const res = await createTheater(payload);
      setMsg({ ok: true, text: `Teatro criado: ${res.name}` });
      // limpa só o essencial
      setForm((f) => ({ ...f, name: "", slug: "" }));
    } catch (err) {
      setMsg({ ok: false, text: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card">
      <h2>Novo Teatro</h2>
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
            Slug* (único)
            <input
              required
              value={form.slug}
              onChange={(e) => set("slug", e.target.value)}
            />
          </label>
        </div>

        <fieldset>
          <legend>Endereço</legend>
          <div className="grid2">
            <label>
              Rua
              <input
                value={form.address.street}
                onChange={(e) => set("address.street", e.target.value)}
              />
            </label>
            <label>
              Bairro
              <input
                value={form.address.neighborhood}
                onChange={(e) =>
                  set("address.neighborhood", e.target.value)
                }
              />
            </label>
          </div>
          <div className="grid3">
            <label>
              Cidade
              <input
                value={form.address.city}
                onChange={(e) => set("address.city", e.target.value)}
              />
            </label>
            <label>
              Estado
              <input
                value={form.address.state}
                onChange={(e) => set("address.state", e.target.value)}
              />
            </label>
            <label>
              CEP
              <input
                value={form.address.postal_code}
                onChange={(e) => set("address.postal_code", e.target.value)}
              />
            </label>
          </div>
        </fieldset>

        <fieldset>
          <legend>Localização (GeoJSON)</legend>
          <div className="grid2">
            <label>
              Longitude (lng)*
              <input
                required
                value={form.location.coordinates[0]}
                onChange={(e) =>
                  set("location.coordinates.0", e.target.value)
                }
              />
            </label>
            <label>
              Latitude (lat)*
              <input
                required
                value={form.location.coordinates[1]}
                onChange={(e) =>
                  set("location.coordinates.1", e.target.value)
                }
              />
            </label>
          </div>
        </fieldset>

        <label>
          Site
          <input
            placeholder="https://..."
            value={form.contacts.website}
            onChange={(e) => set("contacts.website", e.target.value)}
          />
        </label>

        <div className="actions">
          <button disabled={loading}>{loading ? "Salvando..." : "Salvar"}</button>
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