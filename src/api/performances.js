import { api } from "./client";

export async function createPerformance(payload) {
  return api.post(`/performances`, payload);
}

export async function listPerformances() {
  return api.get(`/performances?limit=500`);
}

export async function updatePerformance(payload) {
  return api.patch(`/performances/{id}`, payload);
}