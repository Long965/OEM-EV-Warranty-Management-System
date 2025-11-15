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
import { Alert } from "@mui/material"; // SỬA ĐỔI: Thêm Alert để báo lỗi

export default function Alerts() {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null); // SỬA ĐỔI: Thêm state cho lỗi
  
  // API_URL của bạn đã đúng
  const API_URL = process.env.REACT_APP_API_URL || "http://localhost:8000";

  const load = async () => {
    setLoading(true);
    setError(null); // Xóa lỗi cũ
    try {
      // ĐÚNG: Gọi đến http://localhost:8000/alerts/
      const res = await axios.get(`${API_URL}/alerts/`);
      setAlerts(res.data);
    } catch (e) {
      console.error(e);
      // SỬA ĐỔI: Hiển thị lỗi cho người dùng
      setError("Không thể tải dữ liệu. Vui lòng kiểm tra kết nối hoặc thử lại."); 
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  // Cột (Columns) - Giữ nguyên
  const columns = [
    { Header: "Partname", accessor: "part_name", align: "center" },
    { Header: "Part", accessor: "part", align: "left" },
    { Header: "Type", accessor: "type", align: "center" },
    { Header: "Quantity", accessor: "quantity", align: "center" },
    { Header: "Message", accessor: "message", align: "left" },
    { Header: "Date", accessor: "created_at", align: "center" },
  ];

  // SỬA LỖI (BUG): Key trong 'rows' phải khớp với 'accessor' trong 'columns'
  const rows = alerts.map((a) => ({
    part_name: a.part_name, // Lỗi ở đây (trước đây là 'name')
    part: a.part?.name || a.part_id, // Giữ nguyên, cách xử lý này rất tốt
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
                <Button variant="contained" color="secondary" onClick={load} disabled={loading}>
                  {loading ? "Đang tải..." : "Làm mới"}
                </Button>
              </MDBox>

              {/* SỬA ĐỔI: Hiển thị lỗi hoặc loading */}
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