import client from "./client";
const ENDPOINT = "/alerts/";

export const getAlerts = () => client.get(ENDPOINT);
export const deleteAlert = (id) => client.delete(`${ENDPOINT}${id}`);