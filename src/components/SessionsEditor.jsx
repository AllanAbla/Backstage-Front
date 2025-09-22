// src/components/SessionsEditor.jsx
export function toUtcISOString(dateStr) {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  return d.toISOString();
}

export default function SessionsEditor({ value, onChange }) {
  const sessions = value || [];

  const addSession = () => {
    onChange([...sessions, { when: "" }]);
  };

  const updateSession = (index, val) => {
    const updated = [...sessions];
    updated[index].when = val;
    onChange(updated);
  };

  const removeSession = (index) => {
    const updated = [...sessions];
    updated.splice(index, 1);
    onChange(updated);
  };

  return (
    <fieldset>
      <legend>Sessões</legend>

      {sessions.map((s, i) => (
        <div
          key={i}
          style={{
            display: "flex",
            gap: "8px",
            alignItems: "center",
            marginTop: "6px",
          }}
        >
          <input
            type="datetime-local"
            required
            value={s.when}
            onChange={(e) => updateSession(i, e.target.value)}
          />
          <button type="button" onClick={() => removeSession(i)}>
            Remover
          </button>
        </div>
      ))}

      {sessions.length === 0 && <p>Nenhuma sessão adicionada.</p>}

      <button
        type="button"
        onClick={addSession}
        style={{ marginTop: "8px", display: "block" }}
      >
        ➕ Adicionar sessão
      </button>

      <small style={{ display: "block", marginTop: "4px" }}>
        O horário é considerado no seu fuso e enviado em UTC para a API.
      </small>
    </fieldset>
  );
}