import { Routes, Route } from "react-router-dom";

import BackstageNavbar from "./components/BackstageNavbar.jsx";

// Páginas
import MapGLPage from "./pages/MapGl.jsx";
import PerformancesPage from "./pages/Performances.jsx";
import TheatersHome from "./pages/TheatersHome.jsx";
import TheaterForm from "./components/theaters/TheaterForm.jsx";
import TheaterDetailsPage from "./pages/TheaterDetails.jsx";

export default function App() {
  return (
    <>
      {/* Navbar fixa */}
      <BackstageNavbar />

      {/* Conteúdo da aplicação */}
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Home />} />

          {/* Teatros */}
          <Route path="/theaters" element={<TheatersHome />} />
          <Route path="/theaters/new" element={<TheaterForm />} />
          <Route path="/theaters/:id" element={<TheaterDetailsPage />} />

          {/* Performances */}
          <Route path="/performances" element={<PerformancesPage />} />

          {/* Mapa */}
          <Route path="/map" element={<MapGLPage />} />

          {/* Fallback */}
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
