// src/components/AdminRoute.js

import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "context/AuthContext"; // Import hook
import MDBox from "components/MDBox";
import { CircularProgress } from "@mui/material";

const AdminRoute = () => {
  // ✅ SỬA LỖI: Lấy thêm hàm "logout" từ Context
  const { isAuthenticated, user, loading, logout } = useAuth();

  if (loading) {
    // 0. Nếu đang kiểm tra token, hiển thị xoay tròn
    return (
      <MDBox display="flex" justifyContent="center" alignItems="center" height="100vh">
        <CircularProgress />
      </MDBox>
    );
  }

  if (!isAuthenticated) {
    // 1. Nếu chưa đăng nhập, đá về trang Login
    return <Navigate to="/authentication/sign-in" replace />;
  }

  // ✅ SỬA LỖI LOGIC:
  if (user.role !== "Admin") {
    // 2. Đã đăng nhập nhưng không phải Admin
    // (Lỗi: Đang cố truy cập trang Admin)
    // Đăng xuất họ (xóa token) và đẩy về trang đăng nhập.
    
    // (Một lựa chọn khác là tạo trang "403 Forbidden" 
    // và điều hướng đến đó, nhưng logout an toàn hơn)
    
    logout(); // <-- Chạy hàm logout
    return <Navigate to="/authentication/sign-in" replace />;
  }

  // 3. Đã đăng nhập VÀ là Admin -> Hiển thị trang
  return <Outlet />;
};

export default AdminRoute;