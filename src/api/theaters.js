import { api } from "./client";

export async function listTheaters() {
  // pega bastante pra popular selects
  return api.get(`/theaters?limit=500`);
}

export async function createTheater(payload) {
  return api.post(`/theaters`, payload);
}