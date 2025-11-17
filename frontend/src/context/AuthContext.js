// src/context/AuthContext.js

import React, { createContext, useContext, useState, useEffect } from "react";
import PropTypes from "prop-types"; // <-- ✅ THÊM DÒNG NÀY (sửa lỗi prop-types)
import { jwtDecode } from "jwt-decode";
// import api from "src/api/api"; // <-- LỖI Ở ĐÂY
import api from "../api/api"; // <-- ✅ SỬA LẠI (đường dẫn tương đối)

const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token") || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      try {
        const decodedToken = jwtDecode(token);
        if (decodedToken.exp * 1000 < Date.now()) {
          logout();
        } else {
          setUser(decodedToken);
        }
      } catch (e) {
        logout();
      }
    }
    setLoading(false);
  }, [token]);

  const login = async (username, password) => {
    try {
      const response = await api.post("/auth/login", {
        username,
        password,
      });
      const { access_token } = response.data;
      localStorage.setItem("token", access_token);
      setToken(access_token);
      const decodedToken = jwtDecode(access_token);
      setUser(decodedToken);
      return true;
    } catch (error) {
      console.error("Login failed:", error);
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
  };

  const value = {
    user,
    token,
    isAuthenticated: !!user,
    loading,
    login,
    logout,
  };

  // ✅ Sửa lỗi Prettier: Xóa các dòng trắng thừa
  return <AuthContext.Provider value={value}>{!loading && children}</AuthContext.Provider>;
};

// ✅ THÊM DÒNG NÀY (sửa lỗi prop-types)
AuthProvider.propTypes = {
  children: PropTypes.node.isRequired,
};