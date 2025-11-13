/* eslint-disable prettier/prettier */
import React, { useEffect, useState } from "react";
import axios from "axios";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import DataTable from "examples/Tables/DataTable";
import Modal from "@mui/material/Modal";
import Box from "@mui/material/Box";
import Autocomplete from "@mui/material/Autocomplete";

export default function Vehicles() {
  const [vehicles, setVehicles] = useState([]);
  const [parts, setParts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [edit, setEdit] = useState(null);
  const [form, setForm] = useState({ vin: "", model: "", year: "", owner: "", installed_serials: [] });

  const API_URL = process.env.REACT_APP_API_URL || "http://localhost:8000";

  const load = async () => {
    try {
      const [r1, r2] = await Promise.all([axios.get(`${API_URL}/vehicles/`), axios.get(`${API_URL}/parts/`)]);
      setVehicles(r1.data);
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

  const openModal = (v = null) => {
    if (v) {
      setEdit(v);
      setForm({ vin: v.vin, model: v.model, year: v.year, owner: v.owner, installed_serials: v.installed_serials || [] });
    } else {
      setEdit(null);
      setForm({ vin: "", model: "", year: "", owner: "", installed_serials: [] });
    }
    setOpen(true);
  };
  const closeModal = () => setOpen(false);

  const save = async () => {
    try {
      if (edit) {
        const res = await axios.put(`${API_URL}/vehicles/${edit.id}`, form);
        setVehicles((prev) => prev.map((v) => (v.id === edit.id ? res.data : v)));
      } else {
        const res = await axios.post(`${API_URL}/vehicles/`, form);
        setVehicles((prev) => [...prev, res.data]);
      }
      closeModal();
    } catch (e) {
      console.error(e);
    }
  };

  const remove = async (id) => {
    if (!window.confirm("Xóa xe?")) return;
    try {
      await axios.delete(`${API_URL}/vehicles/${id}`);
      setVehicles((prev) => prev.filter((v) => v.id !== id));
    } catch (e) {
      console.error(e);
    }
  };

  const columns = [
    { Header: "ID", accessor: "id", align: "center" },
    { Header: "VIN", accessor: "vin", align: "left" },
    { Header: "Model", accessor: "model", align: "left" },
    { Header: "Year", accessor: "year", align: "center" },
    { Header: "Owner", accessor: "owner", align: "left" },
    { Header: "Parts(SN)", accessor: "parts", align: "left" },
    { Header: "Actions", accessor: "actions", align: "center" },
  ];

  const rows = vehicles.map((v) => ({
    id: v.id,
    vin: v.vin,
    model: v.model,
    year: v.year,
    owner: v.owner,
    parts: (v.installed_serials || []).join(", "),
    actions: (
      <>
        <IconButton onClick={() => openModal(v)} color="primary"><EditIcon /></IconButton>
        <IconButton onClick={() => remove(v.id)} color="error"><DeleteIcon /></IconButton>
      </>
    ),
  }));

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox pt={6} pb={3}>
        <Grid container spacing={6}>
          <Grid item xs={12}>
            <Card>
              <MDBox mx={2} mt={-3} py={3} px={2} variant="gradient" bgColor="dark" borderRadius="lg" coloredShadow="dark" display="flex" justifyContent="space-between" alignItems="center">
                <MDTypography variant="h6" color="white">Quản lý Xe (Vehicles)</MDTypography>
                <Button variant="contained" color="secondary" onClick={() => openModal()}>+ Thêm</Button>
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

      <Modal open={open} onClose={closeModal}>
        <Box sx={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", width: 520, bgcolor: "background.paper", borderRadius: 2, boxShadow: 24, p: 4 }}>
          <MDTypography variant="h6" mb={2}>{edit ? "Cập nhật xe" : "Thêm xe"}</MDTypography>
          <TextField label="VIN" fullWidth sx={{ mb: 2 }} value={form.vin} onChange={(e) => setForm({ ...form, vin: e.target.value })} />
          <TextField label="Model" fullWidth sx={{ mb: 2 }} value={form.model} onChange={(e) => setForm({ ...form, model: e.target.value })} />
          <TextField label="Year" type="number" fullWidth sx={{ mb: 2 }} value={form.year} onChange={(e) => setForm({ ...form, year: e.target.value })} />
          <TextField label="Owner" fullWidth sx={{ mb: 2 }} value={form.owner} onChange={(e) => setForm({ ...form, owner: e.target.value })} />

          <Autocomplete
            multiple
            options={parts}
            getOptionLabel={(o) => `${o.serial_number || o.sku || o.name} (${o.name})`}
            value={parts.filter(p => form.installed_serials.includes(p.serial_number))}
            onChange={(e, values) => setForm({ ...form, installed_serials: values.map(v => v.serial_number) })}
            renderInput={(params) => <TextField {...params} label="Gắn SN phụ tùng" placeholder="Chọn phụ tùng" sx={{ mb: 2 }} />}
          />

          <Button variant="contained" color="info" fullWidth onClick={save}>{edit ? "Cập nhật" : "Thêm"}</Button>
        </Box>
      </Modal>

      <Footer />
    </DashboardLayout>
  );
}
