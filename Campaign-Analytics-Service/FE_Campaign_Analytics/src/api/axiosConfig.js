import axios from 'axios';

// Tạo một instance Axios riêng
const axiosInstance = axios.create({
    baseURL: '/api/v1/', // Proxy sẽ lo phần http://localhost:8000
    headers: {
        'Content-Type': 'application/json',
    },
});

// Thêm Interceptor để tự động gắn Token
axiosInstance.interceptors.request.use(
    (config) => {
        // Lấy token từ LocalStorage
        const token = localStorage.getItem('accessToken');
        
        // Nếu có token, gắn vào header Authorization
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default axiosInstance;