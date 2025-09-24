import { api } from "./client";

export async function listTheaters() {
  return api.get(`/theaters?limit=500`);
}

export async function createTheater(payload) {
  return api.post(`/theaters`, payload);
}

export async function updateTheater(id, payload) {
  return api.patch(`/theaters/${id}`, payload);
}

export async function getTheater(id) {
  return api.get(`/theaters/${id}`);
}