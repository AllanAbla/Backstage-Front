import { useEffect, useMemo, useState } from "react";
import { listTheaters } from "../api/theaters";

export default function SessionsEditor({ value = [], onChange }) {
  const [theaters, setTheaters] = useState([]);
  useEffect(() => {
    listTheaters().then(setTheaters).catch(console.error);
  }, []);

  const add = () => onChange([...(value || []), { theater_id: "", when: "" }]);
  const remove = (idx) =>
    onChange(value.filter((_, i) => i !== idx));
  const set = (idx, path, val) => {
    const next = value.map((s, i) =>
      i === idx ? { ...s, [path]: val } : s
    );
    onChange(next);
  };

  const theaterOptions = useMemo(
    () =>
      theaters.map((t) => ({
        id: t._id || t.id,
        label: `${t.name} (${t.address?.city || "?"})`,
      })),
    [theaters]
  );

  return (
    <fieldset>
      <legend>Sessões</legend>
      {(value || []).map((s, idx) => (
        <div key={idx} className="grid3">
          <label>
            Teatro*
            <select
              required
              value={s.theater_id}
              onChange={(e) => set(idx, "theater_id", e.target.value)}
            >
              <option value="">Selecione...</option>
              {theaterOptions.map((opt) => (
                <option key={opt.id} value={opt.id}>
                  {opt.label}
                </option>
              ))}
            </select>
          </label>
          <label>
            Data/Hora (local)*
            <input
              type="datetime-local"
              required
              value={s.when}
              onChange={(e) => set(idx, "when", e.target.value)}
            />
          </label>
          <div className="row-end">
            <button
              type="button"
              className="secondary"
              onClick={() => remove(idx)}
            >
              Remover
            </button>
          </div>
        </div>
      ))}

      <button type="button" onClick={add}>
        + Adicionar sessão
      </button>
      <small>
        O horário é considerado no seu fuso e enviado em UTC para a API.
      </small>
    </fieldset>
  );
}

// util para converter datetime-local -> ISO UTC
export function toUtcISOString(localValue) {
  // "2025-11-10T17:00" (local) -> ISO "2025-11-10T20:00:00.000Z" (em BRT)
  return new Date(localValue).toISOString();
}