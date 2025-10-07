import React, { useState } from "react";
import RuleModeForm from "./SessionsFillMode/SessionRuleMode";
import ManualModeForm from "./SessionsFillMode/SessionManualMode";

export default function SessionsEditor({
  onSubmit,
  theaters = [],
  selectedTheater = "",
}) {
  const [mode, setMode] = useState("rule"); // 'rule' ou 'manual'

  const handleSubmit = (data) => {
    if (!selectedTheater) {
      alert("Selecione um teatro antes de adicionar sessões.");
      return;
    }

    // ✅ Envia o ObjectId do teatro junto no payload
    onSubmit({ ...data, theater_id: selectedTheater, mode });
  };

  const changeMode = (direction) => {
    if (direction === "left") setMode("rule");
    else setMode("manual");
  };

  return (
    <div className="session-form">
      <h3>Cadastrar Sessões</h3>

      {/* Alternância com setas */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "1rem",
        }}
      >
        <button type="button" onClick={() => changeMode("left")}>
          &#x276E;
        </button>
        <h4>{mode === "rule" ? "Modo por Regra" : "Modo Manual"}</h4>
        <button type="button" onClick={() => changeMode("right")}>
          &#x276F;
        </button>
      </div>

      {mode === "rule" ? (
        <RuleModeForm onSubmit={handleSubmit} />
      ) : (
        <ManualModeForm onSubmit={handleSubmit} />
      )}
    </div>
  );
}
