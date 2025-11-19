import client from "./client";
const ENDPOINT = "/parts/";

export const getParts = () => client.get(ENDPOINT);
export const createPart = (data) => client.post(ENDPOINT, data);
export const updatePart = (id, data) => client.put(`${ENDPOINT}${id}`, data);
export const deletePart = (id) => client.delete(`${ENDPOINT}${id}`);
