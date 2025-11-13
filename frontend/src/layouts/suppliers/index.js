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

export default function Suppliers() {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [edit, setEdit] = useState(null);
  const [form, setForm] = useState({ name: "", email: "", address: "" });

  const API_URL = process.env.REACT_APP_API_URL || "http://localhost:8000";

  const load = async () => {
    try {
      const res = await axios.get(`${API_URL}/suppliers/`);
      setSuppliers(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const openModal = (s = null) => {
    if (s) {
      setEdit(s);
      setForm({ name: s.name || "", email: s.email || "", address: s.address || "" });
    } else {
      setEdit(null);
      setForm({ name: "", email: "", address: "" });
    }
    setOpen(true);
  };
  const closeModal = () => setOpen(false);

  const handleSave = async () => {
    try {
      if (edit) {
        const res = await axios.put(`${API_URL}/suppliers/${edit.id}`, form);
        setSuppliers((prev) => prev.map((p) => (p.id === edit.id ? res.data : p)));
      } else {
        const res = await axios.post(`${API_URL}/suppliers/`, form);
        setSuppliers((prev) => [...prev, res.data]);
      }
      closeModal();
    } catch (e) {
      console.error(e);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Xóa nhà cung cấp?")) return;
    try {
      await axios.delete(`${API_URL}/suppliers/${id}`);
      setSuppliers((prev) => prev.filter((p) => p.id !== id));
    } catch (e) {
      console.error(e);
    }
  };

  const filtered = suppliers.filter((s) =>
    s.name?.toLowerCase().includes(search.toLowerCase())
  );

  const columns = [
    { Header: "ID", accessor: "id", align: "center" },
    { Header: "Tên", accessor: "name", align: "left" },
    { Header: "Email", accessor: "email", align: "left" },
    { Header: "Địa chỉ", accessor: "address", align: "left" },
    { Header: "Hành động", accessor: "actions", align: "center" },
  ];

  const rows = filtered.map((s) => ({
    id: s.id,
    name: s.name,
    email: s.email,
    address: s.address,
    actions: (
      <>
        <IconButton onClick={() => openModal(s)} color="primary"><EditIcon /></IconButton>
        <IconButton onClick={() => handleDelete(s.id)} color="error"><DeleteIcon /></IconButton>
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
              <MDBox mx={2} mt={-3} py={3} px={2} variant="gradient" bgColor="success" borderRadius="lg" coloredShadow="success" display="flex" justifyContent="space-between" alignItems="center">
                <MDTypography variant="h6" color="white">Nhà cung cấp (Suppliers)</MDTypography>
                <Button variant="contained" color="secondary" onClick={() => openModal()}>+ Thêm</Button>
              </MDBox>

              <MDBox p={2}>
                <TextField label="Tìm kiếm..." variant="outlined" fullWidth value={search} onChange={(e) => setSearch(e.target.value)} />
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
        <Box sx={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", width: 420, bgcolor: "background.paper", borderRadius: 2, boxShadow: 24, p: 4 }}>
          <MDTypography variant="h6" mb={2}>{edit ? "Sửa nhà cung cấp" : "Thêm nhà cung cấp"}</MDTypography>
          <TextField label="Tên" name="name" fullWidth sx={{ mb: 2 }} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <TextField label="Email" name="email" fullWidth sx={{ mb: 2 }} value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          <TextField label="Địa chỉ" name="address" fullWidth sx={{ mb: 2 }} value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
          <Button variant="contained" color="info" fullWidth onClick={handleSave}>{edit ? "Cập nhật" : "Thêm"}</Button>
        </Box>
      </Modal>

      <Footer />
    </DashboardLayout>
  );
}
