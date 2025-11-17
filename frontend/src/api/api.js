// src/api/api.js

import axios from "axios";

// Tạo một instance (thể hiện) của axios
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || "http://localhost:8000",
});

// Thêm một "Interceptor" (bộ đánh chặn) yêu cầu
// Hàm này sẽ chạy TRƯỚC KHI mọi yêu cầu API được gửi đi
api.interceptors.request.use(
  (config) => {
    // Lấy token từ localStorage
    const token = localStorage.getItem("token");
    
    if (token) {
      // Nếu có token, đính kèm vào header Authorization
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;