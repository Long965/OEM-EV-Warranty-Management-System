import client from "./client";
const ENDPOINT = "/inventory/";

export const getInventory = () => client.get(ENDPOINT);
export const createInventoryItem = (data) => client.post(ENDPOINT, data);
export const updateInventoryItem = (id, data) => client.put(`${ENDPOINT}${id}`, data);
export const deleteInventoryItem = (id) => client.delete(`${ENDPOINT}${id}`);