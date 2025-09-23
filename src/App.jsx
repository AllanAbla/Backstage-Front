import { NavLink, Routes, Route } from "react-router-dom";
import TheaterForm from "./components/TheaterForm.jsx";
import PerformanceForm from "./components/PerformanceForm.jsx";
import AdminPanel from "./components/AdminPanel.jsx";
import MapGLPage from "./pages/MapGl.jsx";

export default function App() {
  return (
    <>
      <header className="topbar">
        <div className="topbar-inner">
          <h1>Backstage Admin</h1>
          <nav>
            <NavLink to="/theaters/new">Novo Teatro</NavLink>
            <NavLink to="/performances/new">Nova Performance</NavLink>
            <NavLink to="/AdminPanel">Editar</NavLink>
            <NavLink to="/map-gl">Mapa</NavLink>
          </nav>
        </div>
      </header>

      <main className="page">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/theaters/new" element={<TheaterForm />} />
          <Route path="/performances/new" element={<PerformanceForm />} />
          <Route path="AdminPanel" element={<AdminPanel/>} />
          <Route path="/map-gl" element={<MapGLPage />} />
        </Routes>
      </main>
    </>
  );
}

function Home() {
  return (
    <div className="card">
      <h2>Bem-vindo 👋</h2>
      <p>Use o menu acima para cadastrar teatros e performances, ou abra o Mapa.</p>
    </div>
  );
}
