import React, { useEffect, useState } from "react";
import axios from "axios";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";

function Alerts() {
  const [alerts, setAlerts] = useState([]);
  const API_URL = process.env.REACT_APP_API_URL || "http://localhost:8000";

  useEffect(() => {
    axios.get(`${API_URL}/alerts/`).then((res) => setAlerts(res.data));
  }, []);

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox pt={6} pb={3}>
        <Grid container spacing={6}>
          {alerts.map((a) => (
            <Grid item xs={12} key={a.id}>
              <Card>
                <MDBox p={3}>
                  <MDTypography variant="h6" color="error">
                    ⚠️ Low Stock Alert: {a.part_name}
                  </MDTypography>
                  <MDTypography variant="body2">
                    Only {a.quantity} items left in inventory!
                  </MDTypography>
                </MDBox>
              </Card>
            </Grid>
          ))}
        </Grid>
      </MDBox>
      <Footer />
    </DashboardLayout>
  );
}

export default Alerts;
