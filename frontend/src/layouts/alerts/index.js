/* eslint-disable prettier/prettier */
import React, { useEffect, useState } from "react";
// ✅ SỬA LỖI: Import "api" (file đã cấu hình) thay vì "axios" (gốc)
import api from "../../api/api"; // (Đảm bảo đường dẫn này trỏ đúng đến file src/api/api.js)

// (Import các component Material UI)
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import DataTable from "examples/Tables/DataTable";
import Button from "@mui/material/Button";
import { Alert } from "@mui/material"; 

export default function Alerts() {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null); 
  
  // ✅ SỬA LỖI: Xóa API_URL, vì "api" đã có baseURL
  // const API_URL = process.env.REACT_APP_API_URL || "http://localhost:8000";

  const load = async () => {
    setLoading(true);
    setError(null); 
    try {
      // ✅ SỬA LỖI: Dùng "api" và gọi đường dẫn tương đối
      // Interceptor sẽ tự động đính kèm Token
      const res = await api.get("/alerts/");
      setAlerts(res.data);
    } catch (e) {
      console.error(e);
      setError("Không thể tải dữ liệu. Vui lòng kiểm tra kết nối hoặc thử lại."); 
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  // Cột (Columns)
  const columns = [
    { Header: "Part Name", accessor: "part_name", align: "left" },
    { Header: "Quantity", accessor: "quantity", align: "center" },
    // (Bạn có thể thêm các cột khác nếu API trả về)
    // { Header: "Message", accessor: "message", align: "left" },
    // { Header: "Date", accessor: "created_at", align: "center" },
  ];

  // Hàng (Rows)
  const rows = alerts.map((a) => ({
    part_name: a.part_name, 
    quantity: a.quantity,
    // message: a.message,
    // created_at: a.created_at ? new Date(a.created_at).toLocaleString() : "-",
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
                <Button variant="contained" color="secondary" onClick={load} disabled={loading}>
                  {loading ? "Đang tải..." : "Làm mới"}
                </Button>
              </MDBox>

              <MDBox p={3}>
                {loading && <MDTypography align="center">Loading...</MDTypography>}
                {error && <Alert severity="error">{error}</Alert>}
                {!loading && !error && (
                  <DataTable 
                    table={{ columns, rows }} 
                    isSorted={false} 
                    entriesPerPage={false} 
                    showTotalEntries={false} 
                    noEndBorder 
                  />
                )}
                {!loading && !error && rows.length === 0 && (
                  <MDTypography align="center" p={3}>Không có cảnh báo nào.</MDTypography>
                )}
              </MDBox>
              
            </Card>
          </Grid>
        </Grid>
      </MDBox>
      <Footer />
    </DashboardLayout>
  );
}