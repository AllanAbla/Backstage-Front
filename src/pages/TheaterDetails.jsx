// src/pages/TheaterDetails.jsx
import { useEffect, useState } from "react";
import { getTheater } from "../api/theaters";
import { useParams, useNavigate } from "react-router-dom";

export default function TheaterDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [theater, setTheater] = useState(null);

  useEffect(() => {
    async function load() {
      const data = await getTheater(id);
      setTheater(data);
    }
    load();
  }, [id]);

  if (!theater) return <p>Carregando...</p>;

  return (
    <div className="theater-form-page">
      <h2>{theater.name}</h2>

      {theater.photo && (
        <img
          src={theater.photo}
          alt="Foto do teatro"
          style={{
            width: "320px",
            borderRadius: "12px",
            marginBottom: "20px"
          }}
        />
      )}

      <h3>Endereço</h3>
      <p>{theater.address.street}</p>
      <p>{theater.address.neighborhood}</p>
      <p>{theater.address.city} - {theater.address.state}</p>
      <p>CEP: {theater.address.postal_code}</p>

      <h3>Contato</h3>
      <p>Site: {theater.contacts?.website || "—"}</p>
      <p>Instagram: {theater.contacts?.instagram || "—"}</p>
      <p>Telefone: {theater.contacts?.phone || "—"}</p>

      <button
        style={{ marginTop: "30px" }}
        onClick={() => navigate(`/theaters/${id}/edit`)}
      >
        Editar Teatro
      </button>
    </div>
  );
}