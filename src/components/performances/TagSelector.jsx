/**
 * TagSelector.jsx
 *
 * Campo de autocomplete para seleção de tags padronizadas.
 *
 * Comportamento:
 *  - Digitar filtra a lista das 16 tags canônicas
 *  - Clicar numa sugestão adiciona a tag
 *  - Máximo de MAX_TAGS tags selecionadas (padrão: 3)
 *  - Tags selecionadas aparecem como chips removíveis
 *  - Input fica desabilitado ao atingir o limite
 *
 * @param {string[]}  value     - tags selecionadas atualmente
 * @param {Function}  onChange  - callback (newTags: string[]) => void
 * @param {number}    [max=3]   - limite de tags
 */
import { useState, useRef, useEffect } from "react";
import "./TagSelector.css";

export const CANONICAL_TAGS = [
  "Comédia",
  "Tragédia",
  "Drama",
  "Musical",
  "Independente",
  "Experimental",
  "Itinerante",
  "Documentário",
  "Monólogo",
  "Infantil",
  "Ópera",
  "Imersivo",
  "Interativo",
  "Circo-teatro",
  "Dança-teatro",
  "Político",
];

const MAX_TAGS = 3;

export default function TagSelector({ value = [], onChange, max = MAX_TAGS }) {
  const [query, setQuery]         = useState("");
  const [open, setOpen]           = useState(false);
  const containerRef              = useRef(null);

  const isAtLimit = value.length >= max;

  /**
   * Sugestões filtradas:
   *  - Contém o texto digitado (case-insensitive)
   *  - Não está já selecionada
   * O(n) — n = 16, custo desprezível.
   */
  const suggestions = CANONICAL_TAGS.filter(
    (tag) =>
      !value.includes(tag) &&
      tag.toLowerCase().includes(query.toLowerCase())
  );

  const addTag = (tag) => {
    if (isAtLimit || value.includes(tag)) return;
    onChange([...value, tag]);
    setQuery("");
    setOpen(false);
  };

  const removeTag = (tag) => {
    onChange(value.filter((t) => t !== tag));
  };

  // Fecha o dropdown ao clicar fora
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="ts-root" ref={containerRef}>

      {/* Chips das tags selecionadas */}
      {value.length > 0 && (
        <div className="ts-chips">
          {value.map((tag) => (
            <span key={tag} className="ts-chip">
              {tag}
              <button
                type="button"
                className="ts-chip-remove"
                onClick={() => removeTag(tag)}
                aria-label={`Remover tag ${tag}`}
              >
                ×
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Input de busca */}
      <div className="ts-input-wrap">
        <input
          className="pf-input ts-input"
          type="text"
          placeholder={
            isAtLimit
              ? `Limite de ${max} tags atingido`
              : "Digite para buscar uma tag…"
          }
          value={query}
          disabled={isAtLimit}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          autoComplete="off"
        />

        {/* Contador */}
        <span className={`ts-counter ${isAtLimit ? "ts-counter-limit" : ""}`}>
          {value.length}/{max}
        </span>
      </div>

      {/* Dropdown de sugestões */}
      {open && !isAtLimit && suggestions.length > 0 && (
        <ul className="ts-dropdown" role="listbox">
          {suggestions.map((tag) => (
            <li
              key={tag}
              className="ts-option"
              role="option"
              onMouseDown={(e) => {
                e.preventDefault(); // evita blur no input antes do click
                addTag(tag);
              }}
            >
              {tag}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
