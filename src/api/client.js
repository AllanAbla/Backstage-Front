const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";

async function request(path, { method = "GET", body, headers = {} } = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: {
      ...(body ? { "Content-Type": "application/json" } : {}),
      ...headers,
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  const text = await res.text();
  let data;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }

  if (!res.ok) {
    const detail = data?.detail || res.statusText;
    throw new Error(
      typeof detail === "string" ? detail : JSON.stringify(detail)
    );
  }
  return data;
}

export const api = {
  get: (p) => request(p, { method: "GET" }),
  post: (p, body) => request(p, { method: "POST", body }),
  patch: (p, body) => request(p, { method: "PATCH", body }),
  del: (p) => request(p, { method: "DELETE" }),
};