import React, { useState, useEffect } from "react";
import axios from "axios";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";

export default function Allocations() {
  const [parts, setParts] = useState([]);
  const [partId, setPartId] = useState("");
  const [center, setCenter] = useState("");
  const [quantity, setQuantity] = useState("");
  const [message, setMessage] = useState("");
  const API_URL = process.env.REACT_APP_API_URL || "http://localhost:8000";

  useEffect(() => {
    axios.get(`${API_URL}/parts`).then((res) => setParts(res.data));
  }, []);

  const handleAllocate = async () => {
    if (!partId || !center || !quantity) {
      setMessage("Vui lòng nhập đủ thông tin!");
      return;
    }
    try {
      await axios.post(`${API_URL}/allocations`, null, {
        params: { part_id: partId, service_center: center, quantity: parseInt(quantity) },
      });
      setMessage("✅ Phân bổ thành công!");
    } catch {
      setMessage("❌ Lỗi khi phân bổ phụ tùng!");
    }
  };

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox pt={6} pb={3}>
        <Grid container justifyContent="center">
          <Grid item xs={12} md={8}>
            <Card sx={{ p: 3 }}>
              <MDTypography variant="h6" mb={2}>
                Phân bổ phụ tùng cho trung tâm dịch vụ
              </MDTypography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={4}>
                  <TextField
                    select
                    fullWidth
                    label="-- Chọn phụ tùng --"
                    SelectProps={{ native: true }}
                    value={partId}
                    onChange={(e) => setPartId(e.target.value)}
                  >
                    <option value=""></option>
                    {parts.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </TextField>
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField
                    label="Trung tâm dịch vụ"
                    fullWidth
                    value={center}
                    onChange={(e) => setCenter(e.target.value)}
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField
                    label="Số lượng"
                    type="number"
                    fullWidth
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Button variant="contained" color="info" onClick={handleAllocate}>
                    Xác nhận phân bổ
                  </Button>
                </Grid>
              </Grid>
              {message && (
                <MDTypography color="secondary" mt={2}>
                  {message}
                </MDTypography>
              )}
            </Card>
          </Grid>
        </Grid>
      </MDBox>
      <Footer />
    </DashboardLayout>
  );
}
