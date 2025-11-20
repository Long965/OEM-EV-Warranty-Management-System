import React, { useState } from 'react';
import axios from 'axios';
import './LoginForm.css'; // Import CSS riêng

// Endpoint Đăng nhập của MS 1 (sử dụng cổng 8001)
const LOGIN_URL = 'http://localhost:8001/api/v1/auth/token/';

const LoginForm = ({ onLoginSuccess }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            // 1. Gửi yêu cầu POST đến MS 1 để lấy Token
            const response = await axios.post(LOGIN_URL, {
                username: username,
                password: password,
            });

            // Lấy Token từ phản hồi
            const { access, refresh } = response.data;

            // 2. Lưu Token vào Local Storage (hoặc Cookies)
            localStorage.setItem('accessToken', access);
            localStorage.setItem('refreshToken', refresh);
            
            // 3. Thông báo đăng nhập thành công và chuyển hướng/reload
            onLoginSuccess(access); 

        } catch (err) {
            console.error("Login Failed:", err.response);
            setError('Đăng nhập thất bại. Vui lòng kiểm tra tên người dùng và mật khẩu.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-container">
            <form onSubmit={handleSubmit} className="login-form">
                <h2>Đăng nhập Hệ thống Bảo hành</h2>
                
                <div className="form-group">
                    <label htmlFor="username">Tên người dùng (Superuser)</label>
                    <input
                        type="text"
                        id="username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                        disabled={loading}
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="password">Mật khẩu</label>
                    <input
                        type="password"
                        id="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        disabled={loading}
                    />
                </div>

                {error && <p className="error-message">{error}</p>}
                
                <button type="submit" disabled={loading}>
                    {loading ? 'Đang xác thực...' : 'Đăng nhập'}
                </button>
            </form>
        </div>
    );
};

export default LoginForm;