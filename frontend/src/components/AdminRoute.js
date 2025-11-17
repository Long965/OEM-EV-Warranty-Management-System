// src/components/AdminRoute.js
import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "context/AuthContext"; // Import hook
import MDBox from "components/MDBox";
import { CircularProgress } from "@mui/material";

const AdminRoute = () => {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
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

  if (user.role !== "Admin") {
    // 2. Đã đăng nhập nhưng không phải Admin, đá về trang chủ
    return <Navigate to="/dashboard" replace />;
  }

  // 3. Đã đăng nhập VÀ là Admin -> Hiển thị trang
  return <Outlet />;
};

export default AdminRoute;