import axios from "axios";

const axiosClient = axios.create({
  baseURL: "http://backend:8000/docs", // Tên service backend trong docker-compose
});

export default axiosClient;
