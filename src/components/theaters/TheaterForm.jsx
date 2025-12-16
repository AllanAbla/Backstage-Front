import { useState, useEffect, useRef } from "react";
import { createTheater, getTheater, updateTheater } from "../../api/theaters";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import "./theaterForm.css";
import toast from "react-hot-toast";
import Select from "react-select";
import { components } from "react-select";
import countries from "i18n-iso-countries";
import ptLocale from "i18n-iso-countries/langs/pt.json";
import { useMemo } from "react";

const countrySelectStyles = {
  control: (base, state) => ({
    ...base,
    backgroundColor: "transparent",
    borderColor: "#ffffff33",
    boxShadow: state.isFocused ? "0 0 0 1px #c72829" : "none",
    minHeight: "40px",
  }),
  valueContainer: (base) => ({
    ...base,
    padding: "0 10px",
  }),
  input: (base) => ({
    ...base,
    color: "#fff",
  }),
  singleValue: (base) => ({
    ...base,
    color: "#fff",
  }),
  placeholder: (base) => ({
    ...base,
    color: "#ffffff80",
  }),
  indicatorsContainer: (base) => ({
    ...base,
    color: "#ffffffaa",
  }),
  dropdownIndicator: (base, state) => ({
    ...base,
    color: state.isFocused ? "#c72829" : "#ffffffaa",
    ":hover": { color: "#c72829" },
  }),
  clearIndicator: (base) => ({
    ...base,
    color: "#ffffffaa",
    ":hover": { color: "#c72829" },
  }),
  menu: (base) => ({
    ...base,
    backgroundColor: "#2b2b2b",
    border: "1px solid #ffffff22",
    zIndex: 9999,
  }),
  menuList: (base) => ({
    ...base,
    backgroundColor: "#e6e6e6",
    padding: 0,
    maxHeight: 240,
  }),
  option: (base, state) => ({
    ...base,
    backgroundColor: state.isSelected
      ? "#c72829"
      : state.isFocused
      ? "#c72829"
      : "transparent",
    color: state.isSelected || state.isFocused ? "#fff" : "#111",
    cursor: "pointer",
  }),
};

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function TheaterForm({ mode, showSessions = false }) {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();

  const [editOpen, setEditOpen] = useState(() => {
    if (!id) return true;
    if (mode === "edit") return true;
    return false;
  });

  useEffect(() => {
    skipInitialZipLookupRef.current = true;
    if (!id) {
      setEditOpen(true);
      return;
    }
    setEditOpen(mode === "edit");
  }, [id, mode, location.pathname]);

  const readOnly = !!id && !editOpen;
  const isCreate = !id;
  const isEdit = !!id && editOpen;
  const backTarget = isCreate ? "/theaters" : "/theaters/edit";

  const skipInitialZipLookupRef = useRef(true);

  const [form, setForm] = useState({
    name: "",
    address: {
      street: "",
      number: "",
      neighborhood: "",
      city: "",
      state: "",
      postal_code: "",
      country: "",
    },
    location: { type: "Point", coordinates: ["", ""] },
    contacts: { website: "", instagram: "", phone: "" },
    photo_base64: null,
  });

  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState(null);

  // ---------------------------------------------------------
  // FUNÇÕES DE ENDEREÇO
  // ---------------------------------------------------------

  countries.registerLocale(ptLocale);

  const countryToFlag = (isoCode) => {
    return isoCode
      .toUpperCase()
      .split("")
      .map((char) => String.fromCodePoint(127397 + char.charCodeAt(0)))
      .join("");
  };

  const countryOptions = useMemo(() => {
    const names = countries.getNames("pt", { select: "official" });
    return Object.entries(names)
      .map(([code, name]) => ({
        value: code,
        name,
        label: `${countryToFlag(code)} ${name}`,
      }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, []);

  const [zipEnabled, setZipEnabled] = useState(false);
  const [addressLocked, setAddressLocked] = useState(true);
  const [zipSearching, setZipSearching] = useState(false);
  const [lastLookupKey, setLastLookupKey] = useState(null);

  async function lookupByZip(country, postal) {
    const cc = (country || "BR").toUpperCase();

    if (cc === "BR") {
      const cep = (postal || "").replace(/\D/g, "");
      if (cep.length !== 8) return { found: false };
      const res = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
      const data = await res.json();
      if (data?.erro) return { found: false };
      return {
        found: true,
        address: {
          street: data.logradouro || "",
          neighborhood: data.bairro || "",
          city: data.localidade || "",
          state: data.uf || "",
          postal_code: data.cep || postal,
          country: "BR",
        },
      };
    }

    const zip = (postal || "").trim().replace(" ", "");
    if (zip.length < 3) return { found: false };

    const res = await fetch(
      `https://api.zippopotam.us/${cc.toLowerCase()}/${zip}`
    );
    if (!res.ok) return { found: false };
    const data = await res.json();
    const p = data?.places?.[0];
    if (!p) return { found: false };

    return {
      found: true,
      address: {
        street: "",
        neighborhood: "",
        city: p["place name"] || "",
        state: p["state abbreviation"] || p["state"] || "",
        postal_code: data["post code"] || zip,
        country: cc,
      },
    };
  }

  const onCountryChangeSelect = (opt) => {
    const cc = opt?.value || "";
    set("address.country", cc);

    if (isEdit) {
      setZipEnabled(true);
      setAddressLocked(false);
      setLastLookupKey(null);
      return;
    }

    set("address.postal_code", "");
    set("address.street", "");
    set("address.number", "");
    set("address.neighborhood", "");
    set("address.city", "");
    set("address.state", "");

    setLastLookupKey(null);
    setZipEnabled(!!cc);
    setAddressLocked(true);
  };

  const onZipChange = (e) => {
    set("address.postal_code", e.target.value);
    if (!isEdit) setAddressLocked(true);
  };

  useEffect(() => {
    const cc = (form.address.country || "").toUpperCase();
    const zipRaw = form.address.postal_code || "";

    if (readOnly) return;

    if (!zipEnabled || !cc) return;

    if (cc === "BR") {
      const cep = zipRaw.replace(/\D/g, "");
      if (cep.length !== 8) return;
    } else {
      const zip = zipRaw.trim().replace(" ", "");
      if (zip.length < 3) return;
    }

    const key = `${cc}:${zipRaw}`;

    if (isEdit && skipInitialZipLookupRef.current) {
      skipInitialZipLookupRef.current = false;
      setLastLookupKey(key);
      return;
    }

    if (lastLookupKey === key) return;

    const t = setTimeout(async () => {
      setZipSearching(true);
      try {
        const r = await lookupByZip(cc, zipRaw);
        setLastLookupKey(key);

        if (r.found) {
          set("address.street", r.address.street || "");
          set("address.neighborhood", r.address.neighborhood || "");
          set("address.city", r.address.city || "");
          set("address.state", r.address.state || "");
          set("address.postal_code", r.address.postal_code || zipRaw);
          set("address.country", r.address.country || cc);
        } else {
          toast.error("erro ao pesquisar por zip-code");
        }

        setAddressLocked(false);
      } catch {
        setLastLookupKey(key);
        setAddressLocked(false);
        toast.error("erro ao pesquisar por zip-code");
      } finally {
        setZipSearching(false);
      }
    }, 450);

    return () => clearTimeout(t);
  }, [
    form.address.country,
    form.address.postal_code,
    zipEnabled,
    lastLookupKey,
    readOnly,
  ]);

  // ---------------------------------------------------------
  // CARREGAR TEATRO NO MODO EDIÇÃO
  // ---------------------------------------------------------
  useEffect(() => {
    async function load() {
      if (!id) return;
      try {
        const data = await getTheater(id);

        skipInitialZipLookupRef.current = true;

        setForm({
          ...data,
          contacts: {
            website: data.contacts?.website || "",
            instagram: data.contacts?.instagram || "",
            phone: data.contacts?.phone || "",
          },
        });

        setPreview(data.photo_base64 || null);

        setZipEnabled(true);
        setAddressLocked(false);
        setLastLookupKey(null);
      } catch (err) {
        toast.error(err.message || "Erro ao carregar teatro");
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
      toast.error(err.message || "Erro ao consultar CEP");
    }
  }

  // ---------------------------------------------------------
  // Upload da foto
  // ---------------------------------------------------------
  const handlePhotoChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const base64 = await fileToBase64(file);
    set("photo_base64", base64);
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

      const { slug, id: _id, ...rest } = form;

      const payload = {
        ...rest,
        location: { type: "Point", coordinates: [lng, lat] },
        contacts: Object.values(rest.contacts).some((v) => v?.trim())
          ? rest.contacts
          : null,
      };

      if (id) {
        // MODO EDITAR
        await updateTheater(id, payload);
        toast.success("Teatro cadastrado com sucesso!");
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
      <div className="tf-header">
        {!id || readOnly ? (
          <span className="tf-back" onClick={() => navigate(backTarget)}>
            ← voltar
          </span>
        ) : (
          <span />
        )}

        <h2 className="tf-title">
          {id
            ? readOnly
              ? "Teatro"
              : "Editar Teatro"
            : "Cadastrar Novo Teatro"}
        </h2>

        {id ? (
          readOnly ? (
            <button
              type="button"
              className="tf-edit-btn"
              onClick={() => {
                skipInitialZipLookupRef.current = true;
                setEditOpen(true);
                navigate(`/theaters/${id}/edit`);
              }}
            >
              Editar
            </button>
          ) : (
            <button
              type="button"
              className="tf-edit-btn"
              onClick={() => {
                setEditOpen(false);
                navigate(`/theaters/${id}`);
              }}
            >
              Cancelar
            </button>
          )
        ) : (
          <span />
        )}
      </div>

      <form className="theater-form" onSubmit={submit}>
        {/* FOTO + CAMPOS PRINCIPAIS */}
        <div className="photo-and-main">
          {/* FOTO */}
          {readOnly ? (
            <div className="photo-box is-readonly">
              {preview ? (
                <img src={preview} alt="preview" className="photo-preview" />
              ) : (
                <span>Sem foto</span>
              )}
            </div>
          ) : (
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
          )}

          {/* CAMPOS PRINCIPAIS */}
          <div className="main-fields">
            {/* Nome */}
            <label>
              Nome*
              <input
                required
                value={form.name}
                onChange={(e) => set("name", e.target.value)}
                disabled={readOnly}
              />
            </label>

            {/* Endereço */}
            <fieldset>
              <legend>Endereço</legend>

              <div className="grid4">
                <label>
                  País
                  <Select
                    classNamePrefix="rs"
                    options={countryOptions}
                    value={
                      countryOptions.find(
                        (o) => o.value === form.address.country
                      ) || null
                    }
                    onChange={onCountryChangeSelect}
                    isDisabled={readOnly}
                    placeholder="Digite para pe"
                    isClearable
                    isSearchable
                    noOptionsMessage={() => "Nenhum país encontrado"}
                    styles={countrySelectStyles}
                  />
                </label>

                <label>
                  Zip-Code*
                  <input
                    type="text"
                    placeholder={
                      form.address.country === "BR" ? "00000-000" : "ZIP"
                    }
                    value={form.address.postal_code || ""}
                    onChange={onZipChange}
                    disabled={readOnly || (isCreate ? !zipEnabled : false)}
                  />
                </label>

                <label>
                  Endereço*
                  <input
                    type="text"
                    value={form.address.street || ""}
                    onChange={(e) => set("address.street", e.target.value)}
                    disabled={readOnly || (isCreate ? addressLocked : false)}
                  />
                </label>

                <label>
                  Número
                  <input
                    type="text"
                    value={form.address.number || ""}
                    onChange={(e) => set("address.number", e.target.value)}
                    disabled={readOnly || (isCreate ? addressLocked : false)}
                  />
                </label>
              </div>

              <div className="grid3">
                <label>
                  Bairro
                  <input
                    type="text"
                    value={form.address.neighborhood || ""}
                    onChange={(e) =>
                      set("address.neighborhood", e.target.value)
                    }
                    disabled={readOnly || (isCreate ? addressLocked : false)}
                  />
                </label>

                <label>
                  Cidade
                  <input
                    type="text"
                    value={form.address.city || ""}
                    onChange={(e) => set("address.city", e.target.value)}
                    disabled={readOnly || (isCreate ? addressLocked : false)}
                  />
                </label>

                <label>
                  Estado
                  <input
                    type="text"
                    value={form.address.state || ""}
                    onChange={(e) => set("address.state", e.target.value)}
                    disabled={readOnly || (isCreate ? addressLocked : false)}
                  />
                </label>
              </div>

              {zipSearching && (
                <small style={{ opacity: 0.75 }}>Buscando endereço…</small>
              )}
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
                disabled={readOnly}
              />
            </label>

            <label>
              Latitude (lat)*
              <input
                required
                value={form.location.coordinates[1]}
                onChange={(e) => set("location.coordinates.1", e.target.value)}
                disabled={readOnly}
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
              disabled={readOnly}
            />
          </label>

          <label>
            Instagram
            <input
              placeholder="@perfil"
              value={form.contacts.instagram}
              onChange={(e) => set("contacts.instagram", e.target.value)}
              disabled={readOnly}
            />
          </label>

          <label>
            Telefone
            <input
              placeholder="(11) 99999-9999"
              value={form.contacts.phone}
              onChange={(e) => set("contacts.phone", e.target.value)}
              disabled={readOnly}
            />
          </label>
        </fieldset>

        {/* BOTÃO */}
        {!readOnly && (
          <button disabled={loading}>
            {loading ? "Salvando..." : id ? "Salvar alterações" : "Salvar"}
          </button>
        )}

        {msg && <p className={msg.ok ? "ok" : "err"}>{msg.text}</p>}
      </form>
    </div>
  );
}
