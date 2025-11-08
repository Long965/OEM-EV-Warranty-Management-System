import axios from "axios";

const API_BASE = "http://localhost:8000/docs"; // 🔥 Trùng với backend

export const getParts = async () => {
  const res = await axios.get(`${API_BASE}/parts/?skip=0&limit=100`);
  return res.data;
};

export const getSuppliers = async () => {
  const res = await axios.get(`${API_BASE}/suppliers/?skip=0&limit=100`);
  return res.data;
};

export const getInventory = async () => {
  const res = await axios.get(`${API_BASE}/inventory/?skip=0&limit=100`);
  return res.data;
};
