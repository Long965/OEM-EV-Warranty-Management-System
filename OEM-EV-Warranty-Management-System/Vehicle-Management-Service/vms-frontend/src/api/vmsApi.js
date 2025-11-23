import axios from 'axios';

// Base URL của Service VMS (Đang chạy ở Docker Host port 8000)
const BASE_URL = 'http://localhost:8000/api/v1'; 

const vmsApi = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const api = vmsApi;

// Hàm lấy danh sách xe
export const getVehicles = async () => {
  const response = await vmsApi.get('/vehicles/');
  return response.data;
};

// Hàm lấy danh sách khách hàng
export const getCustomers = async () => {
  const response = await vmsApi.get('/customers/');
  return response.data;
};

// Hàm đăng ký xe mới
export const registerVehicle = async (vehicleData) => {
  const response = await vmsApi.post('/vehicles/', vehicleData);
  return response.data;
};