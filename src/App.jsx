import { NavLink, Routes, Route } from "react-router-dom";
import MapGLPage from "./pages/MapGl.jsx";
import TheatersPage from "./components/theaters/TheatersPage.jsx";
import PerformancesPage from "./components/performances/PerformancesPage.jsx";

export default function App() {
  return (
    <>
      <header className="topbar">
        <div className="topbar-inner">
          <h1>Backstage Admin</h1>
          <nav>
            <NavLink to="/theaters">Teatros</NavLink>
            <NavLink to="/performances">Performances</NavLink>
            <NavLink to="/map">Mapa</NavLink>
          </nav>
        </div>
      </header>

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
      <p>Use o menu acima para cadastrar teatros e performances, ou abra o Mapa.</p>
    </div>
  );
}