// File: src/examples/LayoutContainers/DashboardLayout/index.js (Hoàn chỉnh)

import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import PropTypes from "prop-types";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";

// Material Dashboard 2 React context
import { useMaterialUIController, setLayout } from "context";

// Material Dashboard 2 React examples
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Sidenav from "examples/Sidenav";

// ✅ BƯỚC 1: SỬA LỖI - Thêm lại import cho Footer
import Footer from "examples/Footer";

// Import file routes.js của bạn
import routes from "routes";

function DashboardLayout({ children }) {
  const [controller, dispatch] = useMaterialUIController();
  const { miniSidenav } = controller;
  const { pathname } = useLocation();

  useEffect(() => {
    setLayout(dispatch, "dashboard");
  }, [pathname]);

  // Trích xuất đúng mảng routes cho Sidenav
  const adminRoutes = routes.find(
    (route) => route.key === "admin-wrapper"
  )?.children || [];

  return (
    <MDBox
      sx={({ breakpoints, transitions, functions: { pxToRem } }) => ({
        p: 3,
        position: "relative",

        [breakpoints.up("xl")]: {
          marginLeft: miniSidenav ? pxToRem(120) : pxToRem(274),
          transition: transitions.create(["margin-left"], {
            easing: transitions.easing.easeInOut,
            duration: transitions.duration.standard,
          }),
        },
      })}
    >
      {/* Truyền adminRoutes (đã trích xuất) vào Sidenav */}
      <Sidenav
        routes={adminRoutes}
      />
      
      <DashboardNavbar />
      <MDBox py={3}>{children}</MDBox>
      
      {/* ✅ BƯỚC 2: Component này giờ đã hợp lệ vì đã được import */}
      <Footer />
    </MDBox>
  );
}

DashboardLayout.propTypes = {
  children: PropTypes.node.isRequired,
};

export default DashboardLayout;