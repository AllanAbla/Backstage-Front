import { api } from "./client";

/**
 * Cria sessões por regra de recorrência semanal.
 * @param {{ performance_id, theater_id, start_date, end_date, rules }} payload
 */
export const createSessionsByRule = (payload) =>
  api.post("/sessions/rule", payload);

/**
 * Cria sessões com datas avulsas.
 * @param {{ performance_id, theater_id, datetimes: string[] }} payload
 */
export const createSessionsManual = (payload) =>
  api.post("/sessions/manual", payload);

/** Lista todas as sessões de uma performance. */
export const listByPerformance = (performanceId) =>
  api.get(`/sessions/by-performance/${performanceId}`);

/** Lista todas as sessões de um teatro. */
export const listByTheater = (theaterId) =>
  api.get(`/sessions/by-theater/${theaterId}`);

/** Remove uma sessão individual. */
export const deleteSession = (sessionId) =>
  api.del(`/sessions/${sessionId}`);

/** Remove todas as sessões de uma performance. */
export const deleteByPerformance = (performanceId) =>
  api.del(`/sessions/by-performance/${performanceId}`);

/** Lista todas as sessões (para popular session_theaters no grid). */
export const listAllSessions = (limit = 2000) =>
  api.get(`/sessions?limit=${limit}`);