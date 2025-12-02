// src/App.jsx
import { Routes, Route } from "react-router-dom";
import MapGLPage from "./pages/MapGl.jsx";
import TheatersPage from "./pages/Theaters.jsx";
import PerformancesPage from "./pages/Performances.jsx";
import BackstageNavbar from "./components/BackstageNavbar.jsx";

export default function App() {
  return (
    <>
      {/* Nova navbar dinâmica */}
      <BackstageNavbar />

      <main className="container">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/theaters" element={<TheatersPage />} />
          <Route path="/performances" element={<PerformancesPage />} />
          <Route path="/map" element={<MapGLPage />} />
          <Route path="*" element={<Home />} />
        </Routes>
      </main>
    </>
  );
}

function Home() {
  return (
    <div className="card">
      <h2>Bem-vindo 👋</h2>
      <p>Use o menu para cadastrar teatros e performances, ou abra o Mapa.</p>
    </div>
  );
}
