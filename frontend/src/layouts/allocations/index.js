/* eslint-disable prettier/prettier */
import React, { useEffect, useState } from "react";
import axios from "axios";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import InputLabel from "@mui/material/InputLabel";
import FormControl from "@mui/material/FormControl";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import DataTable from "examples/Tables/DataTable";

export default function Allocations() {
  const [allocs, setAllocs] = useState([]);
  const [parts, setParts] = useState([]);
  const [centers, setCenters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ part_id: "", quantity: 0, to_center: "" });
  const API_URL = process.env.REACT_APP_API_URL || "http://localhost:8000";

  const load = async () => {
    try {
      const [r1, r2, r3] = await Promise.all([
        axios.get(`${API_URL}/allocations/`), // list allocations
        axios.get(`${API_URL}/parts/`),
        axios.get(`${API_URL}/service_centers/`), // or /service-centers/
      ]);
      setAllocs(r1.data);
      setParts(r2.data);
      setCenters(r3.data);
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
      const res = await axios.post(`${API_URL}/allocations/`, form);
      setAllocs((prev) => [...prev, res.data]);
      setForm({ part_id: "", quantity: 0, to_center: "" });
    } catch (e) {
      console.error(e);
    }
  };

  const columns = [
    { Header: "ID", accessor: "id", align: "center" },
    { Header: "Part", accessor: "part", align: "left" },
    { Header: "Số lượng", accessor: "quantity", align: "center" },
    { Header: "Tới trung tâm", accessor: "to_center", align: "left" },
    { Header: "Ngày", accessor: "created_at", align: "center" },
  ];

  const rows = allocs.map((a) => ({
    id: a.id,
    part: a.part?.name || a.part_id,
    quantity: a.quantity,
    to_center: a.to_center?.name || a.to_center,
    created_at: a.created_at ? new Date(a.created_at).toLocaleString() : "-",
  }));

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox pt={6} pb={3}>
        <Grid container spacing={6}>
          <Grid item xs={12}>
            <Card>
              <MDBox mx={2} mt={-3} py={3} px={2} variant="gradient" bgColor="primary" borderRadius="lg" coloredShadow="primary" display="flex" justifyContent="space-between" alignItems="center">
                <MDTypography variant="h6" color="white">Phân bổ phụ tùng (Allocations)</MDTypography>
              </MDBox>

              <MDBox p={2} display="flex" gap={2} flexWrap="wrap">
                <FormControl sx={{ minWidth: 220 }}>
                  <InputLabel id="part-label">Chọn phụ tùng</InputLabel>
                  <Select labelId="part-label" value={form.part_id} label="Chọn phụ tùng" onChange={(e) => setForm({ ...form, part_id: e.target.value })}>
                    {parts.map((p) => <MenuItem value={p.id} key={p.id}>{p.name}</MenuItem>)}
                  </Select>
                </FormControl>
                <TextField label="Số lượng" type="number" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: Number(e.target.value) })} />
                <FormControl sx={{ minWidth: 220 }}>
                  <InputLabel id="center-label">Tới</InputLabel>
                  <Select labelId="center-label" value={form.to_center} label="Tới" onChange={(e) => setForm({ ...form, to_center: e.target.value })}>
                    {centers.map((c) => <MenuItem value={c.id} key={c.id}>{c.name}</MenuItem>)}
                  </Select>
                </FormControl>
                <Button variant="contained" color="secondary" onClick={submit}>Tạo phân bổ</Button>
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
