import { useEffect, useState } from "react";
import { listTheaters, updateTheater } from "../api/theaters";

export default function TheaterManager() {
  const [theaters, setTheaters] = useState([]);
  const [editing, setEditing] = useState(null);

  useEffect(() => {
    async function fetchData() {
      const data = await listTheaters();
      setTheaters(data);
    }
    fetchData();
  }, []);

  const handleSave = async (t) => {
    await updateTheater(t._id, t);
    setEditing(null);
    window.location.reload(); // pode trocar por refetch
  };

  if (editing) {
    return (
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSave(editing);
        }}
      >
        <h3>Editar Teatro</h3>
        <label>
          Nome
          <input
            value={editing.name}
            onChange={(e) => setEditing({ ...editing, name: e.target.value })}
          />
        </label>
        <label>
          Endereço
          <input
            value={editing.address}
            onChange={(e) => setEditing({ ...editing, address: e.target.value })}
          />
        </label>
        <button type="submit">Salvar</button>
        <button type="button" onClick={() => setEditing(null)}>
          Cancelar
        </button>
      </form>
    );
  }

  return (
    <div>
      <h2>Teatros</h2>
      <table>
        <thead>
          <tr>
            <th>Nome</th>
            <th>Endereço</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {theaters.map((t) => (
            <tr key={t._id}>
              <td>{t.name}</td>
              <td>{t.address}</td>
              <td>
                <button onClick={() => setEditing(t)}>Editar</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}