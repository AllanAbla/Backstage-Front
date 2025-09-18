import { Routes, Route, NavLink } from "react-router-dom";
import TheaterForm from "./components/TheaterForm.jsx";
import PerformanceForm from "./components/PerformanceForm.jsx";
import MapPage from "./pages/Map.jsx"; // <-- ADICIONE ESSA LINHA

export default function App() {
  return (
    <div className="container">
      <header>
        <h1>Backstage Admin</h1>
        <nav>
          <NavLink to="/theaters/new">Novo Teatro</NavLink>
          <NavLink to="/performances/new">Nova Performance</NavLink>
          <NavLink to="/map">Mapa</NavLink>
        </nav>
      </header>

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/theaters/new" element={<TheaterForm />} />
        <Route path="/performances/new" element={<PerformanceForm />} />
        <Route path="/map" element={<MapPage />} /> {/* <-- usa o componente importado */}
      </Routes>
    </div>
  );
}

function Home() {
  return (
    <div className="card">
      <h2>Bem-vindo 👋</h2>
      <p>Use o menu acima para cadastrar teatros e performances.</p>
    </div>
  );
}
