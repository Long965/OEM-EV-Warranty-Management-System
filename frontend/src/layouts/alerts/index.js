/* eslint-disable prettier/prettier */
import React, { useEffect, useState } from "react";
import axios from "axios";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import DataTable from "examples/Tables/DataTable";
import Button from "@mui/material/Button";

export default function Alerts() {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const API_URL = process.env.REACT_APP_API_URL || "http://localhost:8000";

  const load = async () => {
    try {
      // backend: GET /alerts/ or /alerts/low_stock
      const res = await axios.get(`${API_URL}/alerts/`);
      setAlerts(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const columns = [
    { Header: "Partname", accessor: "partname", align: "center" },
    { Header: "Part", accessor: "part", align: "left" },
    { Header: "Type", accessor: "type", align: "center" },
    { Header: "Quantity", accessor: "quantity", align: "center" },
    { Header: "Message", accessor: "message", align: "left" },
    { Header: "Date", accessor: "created_at", align: "center" },
  ];

  const rows = alerts.map((a) => ({
    name: a.partname,
    part: a.part?.name || a.part_id,
    type: a.type,
    quantity: a.quantity,
    message: a.message,
    created_at: a.created_at ? new Date(a.created_at).toLocaleString() : "-",
  }));

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox pt={6} pb={3}>
        <Grid container spacing={6}>
          <Grid item xs={12}>
            <Card>
              <MDBox mx={2} mt={-3} py={3} px={2} variant="gradient" bgColor="error" borderRadius="lg" coloredShadow="error" display="flex" justifyContent="space-between" alignItems="center">
                <MDTypography variant="h6" color="white">Cảnh báo tồn kho (Alerts)</MDTypography>
                <Button variant="contained" color="secondary" onClick={load}>Làm mới</Button>
              </MDBox>

              <MDBox pt={3}>
                {loading ? <MDTypography align="center">Loading...</MDTypography> :
                  <DataTable table={{ columns, rows }} isSorted={false} entriesPerPage={false} showTotalEntries={false} noEndBorder />
                }
              </MDBox>
            </Card>
          </Grid>
        </Grid>
      </MDBox>
      <Footer />
    </DashboardLayout>
  );
}
