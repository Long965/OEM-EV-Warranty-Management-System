// src/routes.js
import Dashboard from "layouts/dashboard";
import Inventory from "layouts/inventory";
import Alerts from "layouts/alerts";
import SignIn from "layouts/authentication/sign-in";
import { Navigate } from "react-router-dom"; // <-- ✅ THÊM DÒNG NÀY

// Import Guard (Người gác cổng)
import AdminRoute from "components/AdminRoute";

import Icon from "@mui/material/Icon";

const routes = [
  // --- Route Công khai (Đăng nhập) ---
  {
    type: "route",
    name: "Sign In",
    key: "sign-in",
    route: "/authentication/sign-in",
    component: <SignIn />,
  },

  // --- Các Route Admin (Được bảo vệ) ---
  {
    type: "route",
    key: "admin-wrapper",
    component: <AdminRoute />,
    children: [
      {
        type: "collapse",
        name: "Dashboard",
        key: "dashboard",
        icon: <Icon fontSize="small">dashboard</Icon>,
        route: "/dashboard",
        component: <Dashboard />,
      },
      {
        type: "collapse",
        name: "Inventory",
        key: "inventory",
        icon: <Icon fontSize="small">inventory</Icon>,
        route: "/inventory",
        component: <Inventory />,
      },
      {
        type: "collapse",
        name: "Alerts",
        key: "alerts",
        icon: <Icon fontSize="small">warning</Icon>,
        route: "/alerts",
        component: <Alerts />,
      },
      // (Thêm các trang Admin khác của bạn tại đây)
    ],
  },

  // --- Redirect mặc định ---
  {
    type: "route",
    key: "default-redirect",
    route: "*",
    component: <Navigate to="/authentication/sign-in" />,
  },
];

export default routes;