import { useState } from "react";
import TheaterForm from "./TheaterForm";
import TheaterManager from "./TheaterManager";

export default function TheatersPage() {
  const [tab, setTab] = useState("add"); // "add" | "edit"

  return (
    <div>
      <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1rem" }}>
        <button
          onClick={() => setTab("add")}
          style={{ fontWeight: tab === "add" ? "bold" : "normal" }}
        >
          ➕ Adicionar Novo
        </button>
        <button
          onClick={() => setTab("edit")}
          style={{ fontWeight: tab === "edit" ? "bold" : "normal" }}
        >
          ✏️ Editar
        </button>
      </div>

      {tab === "add" && <TheaterForm />}
      {tab === "edit" && <TheaterManager />}
    </div>
  );
}