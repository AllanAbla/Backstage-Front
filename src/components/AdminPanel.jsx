import { useState } from "react";
import PerformanceManager from "./PerformanceManager";
import TheaterManager from "./TheaterManager";

export default function AdminPanel() {
  const [activeTab, setActiveTab] = useState("performances");

  return (
    <div>
      <nav style={{ display: "flex", gap: "1rem", marginBottom: "1rem" }}>
        <button
          onClick={() => setActiveTab("performances")}
          style={{
            fontWeight: activeTab === "performances" ? "bold" : "normal",
          }}
        >
          🎭 Performances
        </button>
        <button
          onClick={() => setActiveTab("theaters")}
          style={{
            fontWeight: activeTab === "theaters" ? "bold" : "normal",
          }}
        >
          🏛 Teatros
        </button>
      </nav>

      {activeTab === "performances" && <PerformanceManager />}
      {activeTab === "theaters" && <TheaterManager />}
    </div>
  );
}