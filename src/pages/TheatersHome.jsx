import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./theatersHome.css";

export default function TheatersHome() {
  const navigate = useNavigate();
  const [hover, setHover] = useState(""); // controla expansão visual

  return (
    <div className={`theaters-home ${hover}`}>
      
      {/* --- NOVO --- */}
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

      {/* Divisor central */}
      <div className="vertical-divider"></div>

      {/* --- EDITAR --- */}
      <div
        className="side side-right"
        onMouseEnter={() => setHover("hover-right")}
        onMouseLeave={() => setHover("")}
        onClick={() => navigate("/theaters/edit")}
      >
        <div className="side-bg right-bg" />

        <div className="side-content">
          <div className="icon">✎</div>
          <h2>editar</h2>
          <p>selecionar e editar teatro</p>
        </div>
      </div>

    </div>
  );
}
