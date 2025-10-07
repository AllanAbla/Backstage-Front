import React, { useState } from "react";
import RuleModeForm from "./SessionsFillMode/SessionRuleMode";
import ManualModeForm from "./SessionsFillMode/SessionManualMode";

export default function SessionsEditor({ onChange }) {
  const [mode, setMode] = useState("rule");
  const [ruleData, setRuleData] = useState({});
  const [manualSessions, setManualSessions] = useState([]);

  const handleRuleChange = (data) => setRuleData(data);
  const handleManualChange = (sessions) => setManualSessions(sessions);

  // devolve sempre os dados atuais pro form
  React.useEffect(() => {
    onChange({ mode, ruleData, manualSessions });
  }, [mode, ruleData, manualSessions]);

  const changeMode = (direction) => {
    if (direction === "left") setMode("rule");
    else setMode("manual");
  };

  return (
    <div className="session-form">
      <h3>Cadastrar Sessões</h3>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <button type="button" onClick={() => changeMode("left")}>
          &#x276E;
        </button>
        <h4>{mode === "rule" ? "Modo por Regra" : "Modo Manual"}</h4>
        <button type="button" onClick={() => changeMode("right")}>
          &#x276F;
        </button>
      </div>

      {mode === "rule" ? (
        <RuleModeForm onChange={handleRuleChange} />
      ) : (
        <ManualModeForm onChange={handleManualChange} />
      )}
    </div>
  );
}
