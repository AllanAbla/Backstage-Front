import { useState } from "react";
import PerformanceForm from "../components/performances/PerformanceForm";
import PerformanceManager from "../components/performances/PerformanceManager";

export default function PerformancesPage() {
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

      {tab === "add" && <PerformanceForm />}
      {tab === "edit" && <PerformanceManager />}
    </div>
  );
}