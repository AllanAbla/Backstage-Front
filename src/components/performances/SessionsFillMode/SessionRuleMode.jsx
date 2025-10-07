import React, { useState } from "react";
import { addDays, parseISO } from "date-fns";

const weekdays = [
  { value: 0, label: "Domingo" },
  { value: 1, label: "Segunda" },
  { value: 2, label: "Terça" },
  { value: 3, label: "Quarta" },
  { value: 4, label: "Quinta" },
  { value: 5, label: "Sexta" },
  { value: 6, label: "Sábado" },
];

export default function RuleModeForm({ onSubmit }) {
  const [rules, setRules] = useState([]);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const addRule = () => {
    setRules([...rules, { weekday: "", times: [""] }]);
  };

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

  const removeRule = (i) => {
    setRules(rules.filter((_, idx) => idx !== i));
  };

  const generateSessions = () => {
    if (!startDate || !endDate || rules.length === 0) return [];

    const start = parseISO(startDate);
    const end = parseISO(endDate);
    const sessions = [];

    for (
      let date = new Date(start);
      date <= end;
      date = addDays(date, 1)
    ) {
      const weekday = date.getDay();

      rules.forEach((rule) => {
        if (Number(rule.weekday) === weekday) {
          rule.times.forEach((time) => {
            if (!time) return;
            const [h, m] = time.split(":").map(Number);
            const sessionDate = new Date(date);
            sessionDate.setHours(h, m, 0, 0);
            sessions.push({ when: sessionDate.toISOString() });
          });
        }
      });
    }

    // ordena cronologicamente
    sessions.sort((a, b) => new Date(a.when) - new Date(b.when));

    return sessions;
  };

  const handleSubmit = () => {
    const sessions = generateSessions();
    if (sessions.length === 0) {
      alert("Nenhuma sessão gerada. Verifique as regras e datas.");
      return;
    }
    onSubmit(sessions);
  };

  return (
    <fieldset>
      <legend>Modo por Regra</legend>

      <div style={{ display: "flex", gap: "1rem" }}>
        <label>
          Data início*
          <input
            type="date"
            required
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </label>
        <label>
          Data fim*
          <input
            type="date"
            required
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </label>
      </div>

      <button type="button" onClick={addRule} style={{ marginTop: "10px" }}>
        ➕ Adicionar dia e horário
      </button>

      {rules.map((rule, i) => (
        <div key={i} style={{ marginTop: 12, padding: 8, border: "1px solid #444" }}>
          <label>
            Dia da semana:
            <select
              value={rule.weekday}
              onChange={(e) => updateRule(i, "weekday", e.target.value)}
            >
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

      <button
        type="button"
        className="primary"
        style={{ marginTop: "16px" }}
        onClick={handleSubmit}
      >
        Gerar Sessões
      </button>
    </fieldset>
  );
}
