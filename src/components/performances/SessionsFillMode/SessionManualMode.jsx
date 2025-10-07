import React, { useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import "./calendar-dark.css"; // CSS customizado (dark mode)

export default function ManualModeForm({ onSubmit }) {
  const [sessions, setSessions] = useState({});

  const handleDayClick = (date) => {
    const dateStr = date.toISOString().split("T")[0];
    const hour = prompt(`Adicionar horário para ${dateStr} (ex: 20:00):`);
    if (hour) {
      setSessions((prev) => ({
        ...prev,
        [dateStr]: [...(prev[dateStr] || []), hour],
      }));
    }
  };

  const handleRemove = (date, hour) => {
    setSessions((prev) => ({
      ...prev,
      [date]: prev[date].filter((h) => h !== hour),
    }));
  };

  const handleSubmit = () => {
    const formatted = Object.entries(sessions)
      .map(([date, hours]) =>
        hours.map((h) => ({ date, hour: h }))
      )
      .flat()
      .sort((a, b) => new Date(`${a.date}T${a.hour}`) - new Date(`${b.date}T${b.hour}`)); // 🔹 Ordenar cronologicamente

    onSubmit({ sessions: formatted });
  };

  const sortedDates = Object.keys(sessions).sort(
    (a, b) => new Date(a) - new Date(b)
  );

  return (
    <div className="manual-mode-form">
      <Calendar onClickDay={handleDayClick} className="dark-calendar" />

      <div className="sessions-list" style={{ marginTop: "1rem" }}>
        {sortedDates.length === 0 && <p>Nenhuma sessão adicionada.</p>}
        {sortedDates.map((date) => (
          <div key={date}>
            <strong>{date}</strong>
            <ul>
              {sessions[date]
                .sort((a, b) => a.localeCompare(b))
                .map((h) => (
                  <li key={`${date}-${h}`}>
                    {h}{" "}
                    <button onClick={() => handleRemove(date, h)}>x</button>
                  </li>
                ))}
            </ul>
          </div>
        ))}
      </div>

      <button onClick={handleSubmit} style={{ marginTop: "1rem" }}>
        Salvar Sessões
      </button>
    </div>
  );
}
