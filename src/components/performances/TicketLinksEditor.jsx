/**
 * TicketLinksEditor.jsx
 *
 * Gerencia a lista de links de ingressos por teatro.
 * Cada item representa um teatro onde a performance terá temporada.
 *
 * Comportamento:
 *  - Toggle "Sem link ainda" → url fica null, campo URL some
 *  - Toggle desativado → campo URL aparece para preenchimento
 *  - Botão "+" adiciona novo teatro (selecionado de theatersMap)
 *  - Botão "×" remove o item
 *
 * @param {Array}    value        - lista atual: [{theater_id, theater_name, url}]
 * @param {Function} onChange     - callback (newList) => void
 * @param {Object}   theatersMap  - { [id]: { name, ... } } — todos os teatros disponíveis
 */
import { useState } from "react";
import "./TicketLinksEditor.css";

export default function TicketLinksEditor({ value = [], onChange, theatersMap = {} }) {
  const [selectedTheaterId, setSelectedTheaterId] = useState("");

  /**
   * Teatros ainda não adicionados à lista — evita duplicatas.
   * O(n) onde n = total de teatros (≤ centenas).
   */
  const addedIds    = new Set(value.map((l) => l.theater_id));
  const available   = Object.entries(theatersMap).filter(([id]) => !addedIds.has(id));

  const addTheater = () => {
    if (!selectedTheaterId || addedIds.has(selectedTheaterId)) return;
    const name = theatersMap[selectedTheaterId]?.name ?? "";
    onChange([...value, { theater_id: selectedTheaterId, theater_name: name, url: null }]);
    setSelectedTheaterId("");
  };

  const removeTheater = (theater_id) => {
    onChange(value.filter((l) => l.theater_id !== theater_id));
  };

  /**
   * Alterna entre "sem link" (url=null) e "com link" (url="").
   * Quando o toggle vai para false o campo de URL aparece vazio.
   */
  const toggleNoLink = (theater_id, noLink) => {
    onChange(
      value.map((l) =>
        l.theater_id === theater_id
          ? { ...l, url: noLink ? null : "" }
          : l
      )
    );
  };

  const setUrl = (theater_id, url) => {
    onChange(
      value.map((l) =>
        l.theater_id === theater_id ? { ...l, url } : l
      )
    );
  };

  return (
    <div className="tl-root">
      <label className="pf-label">Links de ingressos por teatro</label>

      {/* Lista de teatros adicionados */}
      {value.length > 0 && (
        <ul className="tl-list">
          {value.map(({ theater_id, theater_name, url }) => {
            const noLink = url === null;
            return (
              <li key={theater_id} className="tl-item">

                {/* Nome do teatro + botão remover */}
                <div className="tl-item-header">
                  <span className="tl-theater-name">{theater_name || theater_id}</span>
                  <button
                    type="button"
                    className="tl-remove"
                    onClick={() => removeTheater(theater_id)}
                    aria-label={`Remover ${theater_name}`}
                  >
                    ×
                  </button>
                </div>

                {/* Toggle "Sem link ainda" */}
                <label className="tl-toggle-label">
                  <input
                    type="checkbox"
                    className="tl-toggle-input"
                    checked={noLink}
                    onChange={(e) => toggleNoLink(theater_id, e.target.checked)}
                  />
                  <span className="tl-toggle-track">
                    <span className="tl-toggle-thumb" />
                  </span>
                  <span className="tl-toggle-text">
                    {noLink ? "Sem link ainda" : "Link disponível"}
                  </span>
                </label>

                {/* Campo URL — visível apenas quando há link */}
                {!noLink && (
                  <input
                    className="pf-input tl-url-input"
                    type="url"
                    placeholder="https://bilheteria.com.br/..."
                    value={url ?? ""}
                    onChange={(e) => setUrl(theater_id, e.target.value)}
                  />
                )}
              </li>
            );
          })}
        </ul>
      )}

      {/* Adicionar teatro */}
      {available.length > 0 && (
        <div className="tl-add-row">
          <select
            className="pf-select tl-select"
            value={selectedTheaterId}
            onChange={(e) => setSelectedTheaterId(e.target.value)}
          >
            <option value="">Selecione o teatro…</option>
            {available.map(([id, t]) => (
              <option key={id} value={id}>{t.name}</option>
            ))}
          </select>
          <button
            type="button"
            className="tl-add-btn"
            onClick={addTheater}
            disabled={!selectedTheaterId}
          >
            + Adicionar
          </button>
        </div>
      )}

      {available.length === 0 && value.length === 0 && (
        <p className="tl-empty">Nenhum teatro cadastrado ainda.</p>
      )}
    </div>
  );
}
