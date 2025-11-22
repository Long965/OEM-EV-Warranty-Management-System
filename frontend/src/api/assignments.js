import client from "./client";
const ENDPOINT = "/assignments/";

export const getAssignments = () => client.get(ENDPOINT);
export const createAssignment = (data) => client.post(ENDPOINT, data);
export const updateAssignment = (id, data) => client.put(`${ENDPOINT}${id}`, data);
export const deleteAssignment = (id) => client.delete(`${ENDPOINT}${id}`);