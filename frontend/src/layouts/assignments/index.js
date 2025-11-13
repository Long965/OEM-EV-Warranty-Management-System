/* eslint-disable prettier/prettier */
import React, { useEffect, useState } from "react";
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
import DataTable from "examples/Tables/DataTable";

export default function Assignments() {
  const [assignments, setAssignments] = useState([]);
  const [parts, setParts] = useState([]);
  const [form, setForm] = useState({ part_id: "", vin: "", assigned_to: "", note: "" });
  const [loading, setLoading] = useState(true);
  const API_URL = process.env.REACT_APP_API_URL || "http://localhost:8000";

  const load = async () => {
    try {
      const [r1, r2] = await Promise.all([axios.get(`${API_URL}/assignments/assignments/`), axios.get(`${API_URL}/parts/`)]);
      setAssignments(r1.data);
      setParts(r2.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const submit = async () => {
    try {
      const res = await axios.post(`${API_URL}/assignments/assignments/`, form);
      setAssignments((prev) => [...prev, res.data]);
      setForm({ part_id: "", vin: "", assigned_to: "", note: "" });
    } catch (e) {
      console.error(e);
    }
  };

  const columns = [
    { Header: "ID", accessor: "id", align: "center" },
    { Header: "Part", accessor: "part", align: "left" },
    { Header: "VIN", accessor: "vin", align: "center" },
    { Header: "Kỹ thuật viên", accessor: "assigned_to", align: "left" },
    { Header: "Ngày", accessor: "assigned_date", align: "center" },
    { Header: "Ghi chú", accessor: "note", align: "left" },
  ];

  const rows = assignments.map((a) => ({
    id: a.id,
    part: a.part?.name || a.part_id,
    vin: a.vin,
    assigned_to: a.assigned_to,
    assigned_date: a.assigned_date ? new Date(a.assigned_date).toLocaleString() : "-",
    note: a.note || "",
  }));

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox pt={6} pb={3}>
        <Grid container spacing={6}>
          <Grid item xs={12}>
            <Card>
              <MDBox mx={2} mt={-3} py={3} px={2} variant="gradient" bgColor="info" borderRadius="lg" coloredShadow="info" display="flex" justifyContent="space-between" alignItems="center">
                <MDTypography variant="h6" color="white">Phân bổ (Assignments)</MDTypography>
              </MDBox>

              <MDBox p={2} display="flex" gap={2} flexWrap="wrap">
                <TextField label="VIN (xe nhận)" value={form.vin} onChange={(e) => setForm({ ...form, vin: e.target.value })} />
                <TextField label="Part ID" select value={form.part_id} onChange={(e) => setForm({ ...form, part_id: e.target.value })} SelectProps={{ native: true }}>
                  <option value="">-- Chọn --</option>
                  {parts.map((p) => <option key={p.id} value={p.id}>{p.name} ({p.serial_number||p.sku||p.id})</option>)}
                </TextField>
                <TextField label="Người nhận" value={form.assigned_to} onChange={(e) => setForm({ ...form, assigned_to: e.target.value })} />
                <TextField label="Ghi chú" value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} />
                <Button variant="contained" color="secondary" onClick={submit}>Phân bổ</Button>
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
