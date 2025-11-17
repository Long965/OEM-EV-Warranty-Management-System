// src/App.js
import { useState, useEffect } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import theme from "assets/theme";

// Layout
import Sidenav from "examples/Sidenav";

// Context
import { useMaterialUIController, setMiniSidenav } from "context";

// Routes
import routes from "routes";

// (Import hình ảnh brand của bạn)
import brandWhite from "assets/images/logo-ct.png";
import brandDark from "assets/images/logo-ct-dark.png";

export default function App() {
  const [controller, dispatch] = useMaterialUIController();
  const {
    miniSidenav,
    direction,
    layout,
    sidenavColor,
    transparentSidenav,
    whiteSidenav,
    darkMode,
  } = controller;
  const [onMouseEnter, setOnMouseEnter] = useState(false);
  const { pathname } = useLocation();

  const handleOnMouseEnter = () => setOnMouseEnter(true);
  const handleOnMouseLeave = () => setOnMouseEnter(false);

  useEffect(() => {
    if (layout === "dashboard") {
      setMiniSidenav(dispatch, miniSidenav);
    }
  }, [dispatch, pathname, layout, miniSidenav]);

  const getRoutes = (allRoutes) =>
    allRoutes.map((route) => {
      if (route.collapse) {
        return getRoutes(route.collapse);
      }

      if (route.children) {
        return (
          <Route element={route.component} key={route.key}>
            {getRoutes(route.children)}
          </Route>
        );
      }

      if (route.route) {
        return <Route exact path={route.route} element={route.component} key={route.key} />;
      }

      return null;
    });

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {layout === "dashboard" && (
        <Sidenav
          color={sidenavColor}
          brand={(transparentSidenav && !darkMode) || whiteSidenav ? brandDark : brandWhite}
          brandName="OEM EV WARRANTY"
          routes={routes}
          onMouseEnter={handleOnMouseEnter}
          onMouseLeave={handleOnMouseLeave}
        />
      )}
      <Routes>{getRoutes(routes)}</Routes>
    </ThemeProvider>
  );
}