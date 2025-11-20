import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import Layout from './components/layouts/Layout'; 
import CampaignsPage from './pages/Campaigns'; 
import CampaignDetailPage from './pages/CampaignDetail';
import ReportsPage from './pages/ReportsPage';
import NotFoundPage from './pages/error/NotFound';
import FaultDataPage from './pages/FaultDataPage';

// Components Auth
import LoginForm from './components/Auth/LoginForm'; 

// Hàm kiểm tra Token 
const isAuthenticated = () => {
  return localStorage.getItem('accessToken') ? true : false;
};

// Component Authentication Guard
const AuthGuard = ({ element: Component, ...rest }) => {
  if (isAuthenticated()) {
    return Component;
  }
  return <Navigate to="/login" replace />;
};

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(isAuthenticated());

  // Hàm xử lý khi đăng nhập thành công
  const handleLoginSuccess = () => {
    setIsLoggedIn(true);
    // Chuyển hướng người dùng về trang gốc sau khi đăng nhập
    window.location.href = '/'; 
  };
  
  // Hàm xử lý đăng xuất
  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    setIsLoggedIn(false);
    window.location.href = '/login'; 
  };

  if (!isLoggedIn) {
    return (
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginForm onLoginSuccess={handleLoginSuccess} />} />
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      </BrowserRouter>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AuthGuard element={<Layout onLogout={handleLogout} />} />}>
          
          <Route index element={<CampaignsPage />} /> 
          <Route path="campaigns/:id" element={<CampaignDetailPage />} />
          <Route path="reports" element={<ReportsPage />} />
          <Route path="fault-data" element={<FaultDataPage />} />
          
          <Route path="*" element={<NotFoundPage />} />
          
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;