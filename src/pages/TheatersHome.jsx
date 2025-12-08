import { useEffect, useState } from "react";
import { listTheaters } from "../api/theaters";
import { useNavigate } from "react-router-dom";
import "./theatersHome.css";

export default function TheatersHome() {
  const navigate = useNavigate();
  const [theaters, setTheaters] = useState([]);
  const [selecting, setSelecting] = useState(false);
  const [hover, setHover] = useState(""); // ← controla expansão

  useEffect(() => {
    listTheaters().then(setTheaters).catch(console.error);
  }, []);

  return (
    <div className={`theaters-home ${hover}`}>
      {/* NOVO */}
      <div
        className="side side-left"
        onMouseEnter={() => setHover("hover-left")}
        onMouseLeave={() => setHover("")}
        onClick={() => navigate("/theaters/new")}
      >
        <div className="side-bg left-bg" />
        <div className="side-content">
          <div className="icon">+</div>
          <h2>novo</h2>
          <p>criar um novo teatro</p>
        </div>
      </div>

      <div className="vertical-divider"></div>

      {/* EDITAR */}
      <div
        className="side side-right"
        onMouseEnter={() => setHover("hover-right")}
        onMouseLeave={() => setHover("")}
      >
        <div className="side-bg right-bg" />

        {!selecting ? (
          <div className="side-content" onClick={() => setSelecting(true)}>
            <div className="icon">✎</div>
            <h2>editar</h2>
            <p>selecionar e editar teatro</p>
          </div>
        ) : (
          <div className="option-list">
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