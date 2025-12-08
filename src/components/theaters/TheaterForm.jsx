import { useState, useEffect } from "react";
import {
  createTheater,
  getTheater,
  updateTheater,
} from "../../api/theaters";
import { useNavigate, useParams } from "react-router-dom";
import "./theaterForm.css";

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function TheaterForm() {
  const navigate = useNavigate();
  const { id } = useParams(); // <-- detecta modo edição

  const [form, setForm] = useState({
    name: "",
    address: {
      street: "",
      neighborhood: "",
      city: "",
      state: "",
      postal_code: "",
      country: "BR",
    },
    location: { type: "Point", coordinates: ["", ""] },
    contacts: { website: "", instagram: "", phone: "" },
    photo: null,
  });

  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState(null);

  // ---------------------------------------------------------
  // CARREGAR TEATRO NO MODO EDIÇÃO
  // ---------------------------------------------------------
  useEffect(() => {
    async function load() {
      if (!id) return; // modo criação
      try {
        const data = await getTheater(id);
        setForm(data);
        setPreview(data.photo || null);
      } catch {
        setMsg({ ok: false, text: "Erro ao carregar teatro" });
      }
    }
    load();
  }, [id]);

  // ---------------------------------------------------------
  // Atualizador profundo
  // ---------------------------------------------------------
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

  // ---------------------------------------------------------
  // Buscar CEP automaticamente (Brasil)
  // ---------------------------------------------------------
  async function fetchCEP() {
    const cep = form.address.postal_code.replace(/\D/g, "");
    if (cep.length !== 8) return;

    try {
      const res = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
      const data = await res.json();

      if (data.erro) {
        setMsg({ ok: false, text: "CEP não encontrado" });
        return;
      }

      set("address.street", data.logradouro || "");
      set("address.neighborhood", data.bairro || "");
      set("address.city", data.localidade || "");
      set("address.state", data.uf || "");

    } catch (err) {
      setMsg({ ok: false, text: "Erro ao consultar CEP" });
    }
  }

  // ---------------------------------------------------------
  // Upload da foto
  // ---------------------------------------------------------
  const handlePhotoChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const base64 = await fileToBase64(file);
    set("photo", base64);
    setPreview(base64);
  };

  // ---------------------------------------------------------
  // SUBMIT – criação ou edição
  // ---------------------------------------------------------
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
        contacts:
          Object.values(form.contacts).some((v) => v?.trim())
            ? form.contacts
            : null,
      };

      if (id) {
        // MODO EDITAR
        await updateTheater(id, payload);
        setMsg({ ok: true, text: "Teatro atualizado com sucesso!" });
        setTimeout(() => navigate(`/theaters/${id}`), 800);
      } else {
        // MODO CRIAR
        const newTheater = await createTheater(payload);
        navigate(`/theaters/${newTheater.id}`);
      }

    } catch (err) {
      setMsg({ ok: false, text: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="theater-form-page">

      <h2>{id ? "Editar Teatro" : "Novo Teatro"}</h2>

      <form className="theater-form" onSubmit={submit}>

        {/* FOTO + CAMPOS PRINCIPAIS */}
        <div className="photo-and-main">

          {/* FOTO */}
          <label className="photo-box">
            {preview ? (
              <img src={preview} alt="preview" className="photo-preview" />
            ) : (
              <span>Clique para enviar foto</span>
            )}
            <input
              type="file"
              accept="image/*"
              hidden
              onChange={handlePhotoChange}
            />
          </label>

          {/* CAMPOS PRINCIPAIS */}
          <div className="main-fields">
            
            {/* Nome */}
            <label>
              Nome*
              <input
                required
                value={form.name}
                onChange={(e) => set("name", e.target.value)}
              />
            </label>

            {/* Endereço */}
            <fieldset>
              <legend>Endereço</legend>

              {/* CEP */}
              <label>
                CEP*
                <input
                  placeholder="00000-000"
                  value={form.address.postal_code}
                  maxLength={9}
                  onBlur={fetchCEP}
                  onChange={(e) => {
                    let v = e.target.value.replace(/\D/g, "");
                    if (v.length > 5) v = v.replace(/(\d{5})(\d)/, "$1-$2");
                    set("address.postal_code", v);
                  }}
                />
              </label>

              <label>
                Rua
                <input
                  value={form.address.street}
                  onChange={(e) => set("address.street", e.target.value)}
                />
              </label>

              <div className="grid2">
                <label>
                  Bairro
                  <input
                    value={form.address.neighborhood}
                    onChange={(e) => set("address.neighborhood", e.target.value)}
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
              </div>
            </fieldset>
          </div>
        </div>

        {/* LOCALIZAÇÃO */}
        <fieldset>
          <legend>Localização</legend>

          <div className="grid2">
            <label>
              Longitude (lng)*
              <input
                required
                value={form.location.coordinates[0]}
                onChange={(e) => set("location.coordinates.0", e.target.value)}
              />
            </label>

            <label>
              Latitude (lat)*
              <input
                required
                value={form.location.coordinates[1]}
                onChange={(e) => set("location.coordinates.1", e.target.value)}
              />
            </label>
          </div>
        </fieldset>

        {/* CONTATOS */}
        <fieldset>
          <legend>Contatos</legend>

          <label>
            Site
            <input
              placeholder="https://..."
              value={form.contacts.website}
              onChange={(e) => set("contacts.website", e.target.value)}
            />
          </label>

          <label>
            Instagram
            <input
              placeholder="@perfil"
              value={form.contacts.instagram}
              onChange={(e) => set("contacts.instagram", e.target.value)}
            />
          </label>

          <label>
            Telefone
            <input
              placeholder="(11) 99999-9999"
              value={form.contacts.phone}
              onChange={(e) => set("contacts.phone", e.target.value)}
            />
          </label>
        </fieldset>

        {/* BOTÃO */}
        <button disabled={loading}>
          {loading ? "Salvando..." : id ? "Salvar alterações" : "Salvar"}
        </button>

        {msg && <p className={msg.ok ? "ok" : "err"}>{msg.text}</p>}
      </form>
    </div>
  );
}
