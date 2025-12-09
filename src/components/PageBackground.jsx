import Particles from "./Particles/Particles";
import "./PageBackground.css";

export default function PageBackground({ children }) {
  return (
    <div className="page-bg-wrapper">
      <Particles
        particleColors={["#e41b1b"]}
        particleCount={500}
        particleSpread={10}
        speed={0.1}
        particleBaseSize={800}
        moveParticlesOnHover={false}
        alphaParticles={false}
        disableRotation={true}
      />

      <div className="page-bg-content">
        {children}
      </div>
    </div>
  );
}
