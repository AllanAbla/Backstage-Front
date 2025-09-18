export default function CrewEditor({ value = [], onChange }) {
  const add = () =>
    onChange([...(value || []), { role: "", people: [] }]);

  const remove = (idx) =>
    onChange(value.filter((_, i) => i !== idx));

  const setRole = (idx, role) => {
    const next = value.map((c, i) => (i === idx ? { ...c, role } : c));
    onChange(next);
  };

  const setPeople = (idx, peopleCsv) => {
    const list = peopleCsv
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    const next = value.map((c, i) =>
      i === idx ? { ...c, people: list } : c
    );
    onChange(next);
  };

  return (
    <fieldset>
      <legend>Produção técnica (role + pessoas)</legend>
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
              placeholder="Ex.: Iluminação: Maria, João"
              value={(c.people || []).join(", ")}
              onChange={(e) => setPeople(idx, e.target.value)}
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