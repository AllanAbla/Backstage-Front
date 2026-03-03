import { Routes, Route } from "react-router-dom";
import BackstageNavbar from "./components/BackstageNavbar.jsx";

import MapGLPage from "./pages/MapGl.jsx";
import PerformancesPage from "./pages/Performances.jsx";
import PerformanceEditPage from "./pages/PerformanceEdit.jsx";
import TheatersHome from "./pages/TheatersHome.jsx";
import TheaterForm from "./components/theaters/TheaterForm.jsx";
import TheatersEditList from "./pages/TheatersEditList.jsx";

export default function App() {
  return (
    <>
      <BackstageNavbar />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Home />} />

          <Route path="/theaters" element={<TheatersHome />} />
          <Route path="/theaters/new" element={<TheaterForm />} />
          <Route path="/theaters/:id" element={<TheaterForm mode="view" showSessions />} />
          <Route path="/theaters/:id/edit" element={<TheaterForm mode="edit" />} />
          <Route path="/theaters/edit" element={<TheatersEditList />} />

          <Route path="/performances" element={<PerformancesPage />} />
          <Route path="/performances/:id/edit" element={<PerformanceEditPage />} />

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