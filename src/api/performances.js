import { api } from "./client";

export const listPerformances = (params = {}) => {
  const qs = new URLSearchParams({ limit: 500, ...params }).toString();
  return api.get(`/performances?${qs}`);
};

export const getPerformance = (id) =>
  api.get(`/performances/${id}`);

export const createPerformance = (payload) =>
  api.post("/performances", payload);

// ⚠️ Corrigido: estava "/performances/{id}" (literal) no arquivo original
export const updatePerformance = (id, payload) =>
  api.patch(`/performances/${id}`, payload);

export const deletePerformance = (id) =>
  api.del(`/performances/${id}`);