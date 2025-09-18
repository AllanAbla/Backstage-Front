import { Link, Routes, Route, NavLink } from "react-router-dom";
import TheaterForm from "./components/TheaterForm.jsx";
import PerformanceForm from "./components/PerformanceForm.jsx";

export default function App() {
  return (
    <div className="container">
      <header>
        <h1>Backstage Admin</h1>
        <nav>
          <NavLink to="/theaters/new">Novo Teatro</NavLink>
          <NavLink to="/performances/new">Nova Performance</NavLink>
        </nav>
      </header>

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/theaters/new" element={<TheaterForm />} />
        <Route path="/performances/new" element={<PerformanceForm />} />
      </Routes>
    </div>
  );
}

function Home() {
  return (
    <div className="card">
      <h2>Bem-vindo 👋</h2>
      <p>Use o menu acima para cadastrar teatros e performances.</p>
      <p>
        Dica: deixe o backend rodando em{" "}
        <code>http://127.0.0.1:8000</code> e o CORS habilitado.
      </p>
      <p>
        Precisando de listagens e edição depois, a gente adiciona rapidinho.
      </p>
    </div>
  );
}