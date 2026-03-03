import { useState } from "react";
import PerformanceForm from "../components/performances/PerformanceForm";
import PerformancesList from "./PerformancesList";

export default function PerformancesPage() {
  const [tab, setTab] = useState("list"); // "list" | "add"

  return (
    <div>
      <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1rem" }}>
        <button
          onClick={() => setTab("list")}
          style={{ fontWeight: tab === "list" ? "bold" : "normal" }}
        >
          🎭 Listagem
        </button>
        <button
          onClick={() => setTab("add")}
          style={{ fontWeight: tab === "add" ? "bold" : "normal" }}
        >
          ➕ Nova performance
        </button>
      </div>

      {tab === "list" && (
        <PerformancesList onAddNew={() => setTab("add")} />
      )}
      {tab === "add" && (
        <PerformanceForm
          onSaved={() => setTab("list")}
          onCancel={() => setTab("list")}
        />
      )}
    </div>
  );
}