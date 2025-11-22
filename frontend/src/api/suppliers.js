import client from './client';

const ENDPOINT = '/suppliers/';
export const getSuppliers = () => client.get(ENDPOINT);
export const createSupplier = (data) => client.post(ENDPOINT, data);
export const updateSupplier = (id, data) => client.put(`${ENDPOINT}${id}`, data);
export const deleteSupplier = (id) => client.delete(`${ENDPOINT}${id}`);