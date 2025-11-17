// src/index.js

import React from "react";
import ReactDOM from "react-dom/client"; // Đảm bảo import từ 'react-dom/client'
import { BrowserRouter } from "react-router-dom";
import App from "App";

// Context
import { MaterialUIControllerProvider } from "context";
import { AuthProvider } from "context/AuthContext"; // <-- Import AuthProvider

// ✅ DÒNG 12 (GÂY LỖI):
// Lệnh này tìm thẻ <div id="root"> trong public/index.html
const root = ReactDOM.createRoot(document.getElementById("root"));

root.render(
  <BrowserRouter>
    <MaterialUIControllerProvider>
      {/* ✅ BỌC <App /> BẰNG <AuthProvider>
        Điều này sửa lỗi 'login' is undefined ở lần trước.
      */}
      <AuthProvider>
        <App />
      </AuthProvider>
    </MaterialUIControllerProvider>
  </BrowserRouter>
);