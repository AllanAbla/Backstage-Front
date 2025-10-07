import React, { useState } from "react";

const weekdays = [
  { value: 0, label: "Domingo" },
  { value: 1, label: "Segunda" },
  { value: 2, label: "Terça" },
  { value: 3, label: "Quarta" },
  { value: 4, label: "Quinta" },
  { value: 5, label: "Sexta" },
  { value: 6, label: "Sábado" },
];

export default function RuleModeForm({ onChange }) {
  const [rules, setRules] = useState([]);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const addRule = () => setRules([...rules, { weekday: "", times: [""] }]);
  const updateRule = (i, field, value) => {
    const copy = [...rules];
    copy[i][field] = value;
    setRules(copy);
  };
  const updateTime = (i, j, value) => {
    const copy = [...rules];
    copy[i].times[j] = value;
    setRules(copy);
  };
  const addTime = (i) => {
    const copy = [...rules];
    copy[i].times.push("");
    setRules(copy);
  };
  const removeRule = (i) => setRules(rules.filter((_, idx) => idx !== i));

  React.useEffect(() => {
    onChange({ startDate, endDate, rules });
  }, [startDate, endDate, rules]);

  return (
    <fieldset>
      <legend>Modo por Regra</legend>
      <div style={{ display: "flex", gap: "1rem" }}>
        <label>
          Data início*
          <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
        </label>
        <label>
          Data fim*
          <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
        </label>
      </div>

      <button type="button" onClick={addRule} style={{ marginTop: "10px" }}>
        ➕ Adicionar dia e horário
      </button>

      {rules.map((rule, i) => (
        <div key={i} style={{ marginTop: 12, padding: 8, border: "1px solid #444" }}>
          <label>
            Dia da semana:
            <select value={rule.weekday} onChange={(e) => updateRule(i, "weekday", e.target.value)}>
              <option value="">Selecione</option>
              {weekdays.map((d) => (
                <option key={d.value} value={d.value}>
                  {d.label}
                </option>
              ))}
            </select>
          </label>

          <div style={{ marginTop: 8 }}>
            {rule.times.map((t, j) => (
              <input
                key={j}
                type="time"
                value={t}
                onChange={(e) => updateTime(i, j, e.target.value)}
                style={{ marginRight: 8 }}
              />
            ))}
            <button type="button" onClick={() => addTime(i)}>
              ➕ Horário
            </button>
          </div>

          <button
            type="button"
            className="secondary"
            onClick={() => removeRule(i)}
            style={{ marginTop: 6 }}
          >
            ❌ Remover Dia
          </button>
        </div>
      ))}
    </fieldset>
  );
}
