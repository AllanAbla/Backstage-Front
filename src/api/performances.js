import { api } from "./client";

export async function createPerformance(payload) {
  return api.post(`/performances`, payload);
}