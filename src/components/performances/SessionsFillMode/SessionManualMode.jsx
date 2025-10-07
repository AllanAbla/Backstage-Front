import React, { useState, useEffect } from "react";
import { formatISO } from "date-fns";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import "./calendar-dark.css"; // ✅ importa teu dark mode

export default function ManualModeForm({ onChange }) {
  const [sessions, setSessions] = useState([]); // [{ date, time }]
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [newTime, setNewTime] = useState("");

  // ✅ Atualiza automaticamente o pai sempre que a lista muda
  useEffect(() => {
    const sessionObjects = sessions.map((s) => ({
      when: formatISO(new Date(`${s.date}T${s.time}:00`)),
    }));
    onChange(sessionObjects);
  }, [sessions]);

  const addSession = () => {
    if (!selectedDate || !newTime) return;
    const date = selectedDate.toISOString().split("T")[0];
    const updated = [...sessions, { date, time: newTime }];

    // remove duplicadas e ordena cronologicamente
    const unique = updated.filter(
      (v, i, a) =>
        a.findIndex((s) => s.date === v.date && s.time === v.time) === i
    );
    setSessions(
      unique.sort(
        (a, b) =>
          new Date(`${a.date}T${a.time}`) - new Date(`${b.date}T${b.time}`)
      )
    );
    setNewTime("");
  };

  const removeSession = (i) => {
    const updated = [...sessions];
    updated.splice(i, 1);
    setSessions(updated);
  };

  return (
    <fieldset>
      <legend>Modo Manual</legend>

      {/* 🗓️ Calendário dark full width */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "1rem",
          alignItems: "center",
          width: "100%",
        }}
      >
        <Calendar
          onChange={setSelectedDate}
          value={selectedDate}
          calendarType="gregory"
          locale="pt-BR"
          nextLabel="›"
          prevLabel="‹"
          next2Label={null}
          prev2Label={null}
          className="dark-calendar" // ✅ aplica o tema escuro
        />

        {/* Seletor de horário */}
        <div
          style={{
            marginTop: "1rem",
            textAlign: "center",
            width: "100%",
          }}
        >
          <h4>Adicionar Sessão</h4>
          <p>
            Dia selecionado:{" "}
            <strong>
              {selectedDate.toLocaleDateString("pt-BR", {
                weekday: "long",
                day: "2-digit",
                month: "2-digit",
              })}
            </strong>
          </p>
          <div style={{ display: "flex", justifyContent: "center", gap: "0.5rem" }}>
            <input
              type="time"
              value={newTime}
              onChange={(e) => setNewTime(e.target.value)}
            />
            <button type="button" onClick={addSession}>
              ➕ Adicionar
            </button>
          </div>
        </div>
      </div>

      {/* Lista de sessões adicionadas */}
      {sessions.length > 0 && (
        <div style={{ marginTop: "1.5rem", width: "100%" }}>
          <h4>Sessões cadastradas</h4>
          <ul style={{ listStyle: "none", padding: 0 }}>
            {sessions.map((s, i) => (
              <li
                key={i}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "0.5rem 0",
                  borderBottom: "1px solid #333",
                }}
              >
                <span>
                  {new Date(`${s.date}T${s.time}`).toLocaleString("pt-BR", {
                    dateStyle: "short",
                    timeStyle: "short",
                  })}
                </span>
                <button
                  type="button"
                  className="secondary"
                  onClick={() => removeSession(i)}
                >
                  ❌
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </fieldset>
  );
}
