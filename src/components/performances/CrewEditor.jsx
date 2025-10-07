import React, { useState } from "react";

export default function CrewEditor({ value = [], onChange }) {
  // Estado local para o texto digitado no campo de pessoas
  const [inputs, setInputs] = useState(
    value.map((v) => (v.people || []).join(", "))
  );

  const syncLocalToValue = (newInputs) => {
    setInputs(newInputs);

    // Converte cada string em lista de nomes (split por vírgula)
    const formatted = newInputs.map((text, i) => {
      const list = text
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
      return { ...value[i], people: list };
    });

    onChange(formatted);
  };

  const add = () => {
    onChange([...(value || []), { role: "", people: [] }]);
    setInputs([...(inputs || []), ""]);
  };

  const remove = (idx) => {
    onChange(value.filter((_, i) => i !== idx));
    setInputs(inputs.filter((_, i) => i !== idx));
  };

  const setRole = (idx, role) => {
    const next = value.map((c, i) => (i === idx ? { ...c, role } : c));
    onChange(next);
  };

  const handlePeopleChange = (idx, text) => {
    const nextInputs = [...inputs];
    nextInputs[idx] = text;
    syncLocalToValue(nextInputs);
  };

  return (
    <fieldset>
      <legend>Produção técnica (função + pessoas)</legend>
      {(value || []).map((c, idx) => (
        <div key={idx} className="grid3">
          <label>
            Função*
            <input
              required
              value={c.role}
              onChange={(e) => setRole(idx, e.target.value)}
            />
          </label>

          <label>
            Pessoas (separadas por vírgula)*
            <input
              required
              placeholder="Ex.: Maria Silva, João dos Santos"
              value={inputs[idx] || ""}
              // ✅ Agora o espaço funciona normalmente
              onChange={(e) => handlePeopleChange(idx, e.target.value)}
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
        + Adicionar função
      </button>
    </fieldset>
  );
}
