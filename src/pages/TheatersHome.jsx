import { useEffect, useState } from "react";
import { listTheaters } from "../api/theaters";
import { useNavigate } from "react-router-dom";
import "./theatersHome.css";

export default function TheatersHome() {
  const navigate = useNavigate();
  const [theaters, setTheaters] = useState([]);
  const [selecting, setSelecting] = useState(false);

  useEffect(() => {
    listTheaters().then(setTheaters).catch(console.error);
  }, []);

  return (
    <div className="theaters-home">

      {/* Fundo borrado */}
      <div className="bg-blur" />

      {/* Container dividido */}
      <div className="split-container">

        {/* ------------------------------------------------ */}
        {/* LADO ESQUERDO — NOVO */}
        {/* ------------------------------------------------ */}
        <div className="option side-left" onClick={() => navigate("/theaters/new")}>
          <div className="option-content">
            <div className="icon">+</div>
            <h2>novo</h2>
            <p>criar um novo teatro</p>
          </div>
        </div>

        {/* Linha divisória */}
        <div className="divider"></div>

        {/* ------------------------------------------------ */}
        {/* LADO DIREITO — EDITAR */}
        {/* ------------------------------------------------ */}
        {!selecting ? (
          <div className="option side-right" onClick={() => setSelecting(true)}>
            <div className="option-content">
              <div className="icon">✎</div>
              <h2>editar</h2>
              <p>selecionar e editar teatro</p>
            </div>
          </div>
        ) : (
          <div className="option-list side-right">
            <h3>Selecione um teatro</h3>

            <ul>
              {theaters.map((t) => (
                <li key={t.id} onClick={() => navigate(`/theaters/${t.id}`)}>
                  {t.name}
                </li>
              ))}
            </ul>

            <button onClick={() => setSelecting(false)} className="back-btn">
              voltar
            </button>
          </div>
        )}
      </div>
    </div>
  );
}