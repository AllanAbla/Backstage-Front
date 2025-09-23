import { useEffect, useState } from "react";
import { listPerformances } from "../../api/performances";
import PerformanceForm from "./PerformanceForm";

export default function PerformanceManager() {
  const [performances, setPerformances] = useState([]);
  const [editing, setEditing] = useState(null);

  useEffect(() => {
    async function fetchData() {
      const data = await listPerformances();
      setPerformances(data);
    }
    fetchData();
  }, []);

  if (editing) {
    return (
      <PerformanceForm
        initialData={editing}
        onSaved={() => {
          setEditing(null);
          window.location.reload(); // simplão, pode trocar por refetch
        }}
        onCancel={() => setEditing(null)}
      />
    );
  }

  return (
    <div>
      <h2>Performances</h2>
      <table>
        <thead>
          <tr>
            <th>Nome</th>
            <th>Ano</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {performances.map((p) => (
            <tr key={p._id}>
              <td>{p.name}</td>
              <td>{p.season}</td>
              <td>
                <button onClick={() => setEditing(p)}>Editar</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}