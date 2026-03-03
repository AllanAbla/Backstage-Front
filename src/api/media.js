const BASE = import.meta.env.VITE_API_URL ?? "http://localhost:8000";

/**
 * Faz upload de um File para o backend.
 * @param {File} file
 * @param {"banners"|"theaters"} category
 * @returns {Promise<string>} URL relativa, ex: "static/uploads/banners/abc.jpg"
 */
export async function uploadImage(file, category) {
  const form = new FormData();
  form.append("file", file);
  form.append("category", category);

  const res = await fetch(`${BASE}/media/upload`, {
    method: "POST",
    body: form,
    // NÃO setar Content-Type — o browser define o boundary do multipart
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail ?? `Upload falhou: ${res.status}`);
  }

  const data = await res.json();
  return data.url; // "static/uploads/banners/abc123.jpg"
}

/**
 * Retorna a URL completa para exibição da imagem.
 * @param {string|null} relativeUrl
 */
export function imageUrl(relativeUrl) {
  if (!relativeUrl) return null;
  return `${BASE}/${relativeUrl}`;
}