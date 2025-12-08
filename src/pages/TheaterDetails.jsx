import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getTheater } from "../api/theaters";

export default function TheaterDetailsPage() {
  const { id } = useParams();
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
    <div className="card">
      <h2>{theater.name}</h2>

      {theater.photo_base64 && (
        <img
          src={theater.photo_base64}
          alt={theater.name}
          style={{ width: "100%", maxHeight: 280, objectFit: "cover", borderRadius: 12 }}
        />
      )}

      <h3>Endereço</h3>
      <p>
        {theater.street}<br />
        {theater.neighborhood}<br />
        {theater.city} - {theater.state}<br />
        CEP: {theater.postal_code}
      </p>

      {theater.website && (
        <>
          <h3>Site</h3>
          <a href={theater.website} target="_blank">{theater.website}</a>
        </>
      )}
    </div>
  );
}