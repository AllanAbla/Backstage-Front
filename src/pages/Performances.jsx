import { useState } from "react";
import PerformanceForm from "../components/performances/PerformanceForm";
import PerformancesList from "./PerformancesList";

export default function PerformancesPage() {
  const [tab, setTab] = useState("list"); // "list" | "add"

  return (
    <div>
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
