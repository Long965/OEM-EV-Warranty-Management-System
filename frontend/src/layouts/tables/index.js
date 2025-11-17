/* eslint-disable prettier/prettier */
import React, { useEffect, useState } from "react";
// ✅ SỬA LỖI: Import "api" (file đã cấu hình) thay vì "axios" (gốc)
import api from "../../api/api"; // (Đảm bảo đường dẫn này trỏ đúng đến file src/api/api.js)

// (Import các component Material UI)
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

function Parts() {
  const [parts, setParts] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [openModal, setOpenModal] = useState(false);
  const [editPart, setEditPart] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    serial_number: "",
    type: "",
    price: "",
    supplier: "",
  });

  // ✅ SỬA LỖI: Xóa API_URL, vì "api" đã có baseURL
  // const API_URL = process.env.REACT_APP_API_URL || "http://localhost:8000";

  const fetchParts = async () => {
    try {
      // ✅ SỬA LỖI: Dùng "api" và gọi đường dẫn tương đối
      // Interceptor sẽ tự động đính kèm Token
      const res = await api.get("/parts/");
      setParts(res.data);
    } catch (err) {
      console.error("API fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchParts();
  }, []);

  const handleOpenModal = (part = null) => {
    if (part) {
      setEditPart(part);
      setFormData({
        name: part.name,
        description: part.description,
        serial_number: part.serial_number,
        type: part.type,
        price: part.price,
        supplier: part.supplier || "",
      });
    } else {
      setEditPart(null);
      setFormData({
        name: "",
        description: "",
        serial_number: "",
        type: "",
        price: "",
        supplier: "",
      });
    }
    setOpenModal(true);
  };

  const handleCloseModal = () => setOpenModal(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    try {
      if (editPart) {
        // ✅ SỬA LỖI: Dùng "api" và gọi đường dẫn tương đối
        const res = await api.put(`/parts/${editPart.id}`, formData);
        setParts((prev) => prev.map((p) => (p.id === editPart.id ? res.data : p)));
      } else {
        // ✅ SỬA LỖI: Dùng "api" và gọi đường dẫn tương đối
        const res = await api.post("/parts/", formData);
        setParts((prev) => [...prev, res.data]);
      }
      handleCloseModal();
    } catch (err) {
      console.error("Save error:", err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this part?")) return;
    try {
      // ✅ SỬA LỖI: Dùng "api" và gọi đường dẫn tương đối
      await api.delete(`/parts/${id}`);
      setParts((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      console.error("Delete error:", err);
    }
  };

  const filteredParts = parts.filter((p) =>
    p.name?.toLowerCase().includes(search.toLowerCase())
  );

  const columns = [
    { Header: "ID", accessor: "id", align: "center" },
    { Header: "Name", accessor: "name", align: "left" },
    { Header: "Description", accessor: "description", align: "left" },
    { Header: "Serial", accessor: "serial_number", align: "center" },
    { Header: "Type", accessor: "type", align: "center" },
    { Header: "Price", accessor: "price", align: "center" },
    { Header: "Supplier", accessor: "supplier", align: "left" },
    { Header: "Actions", accessor: "actions", align: "center" },
  ];

  const rows = filteredParts.map((p) => ({
    id: p.id,
    name: p.name,
    description: p.description,
    serial_number: p.serial_number,
    type: p.type,
    price: p.price,
    supplier: p.supplier,
    actions: (
      <>
        <IconButton onClick={() => handleOpenModal(p)} color="primary">
          <EditIcon />
        </IconButton>
        <IconButton onClick={() => handleDelete(p.id)} color="error">
          <DeleteIcon />
        </IconButton>
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
              <MDBox
                mx={2}
                mt={-3}
                py={3}
                px={2}
                variant="gradient"
                bgColor="info"
                borderRadius="lg"
                coloredShadow="info"
                display="flex"
                justifyContent="space-between"
                alignItems="center"
              >
                <MDTypography variant="h6" color="white">
                  Parts Management
                </MDTypography>
                <Button variant="contained" color="secondary" onClick={() => handleOpenModal()}>
                  + Add Part
                </Button>
              </MDBox>

              <MDBox p={2}>
                <TextField
                  label="Search part..."
                  variant="outlined"
                  fullWidth
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  sx={{ mb: 2 }}
                />
              </MDBox>

              <MDBox pt={3}>
                {loading ? (
                  <MDTypography variant="body2" align="center">
                    Loading...
                  </MDTypography>
                ) : (
                  <DataTable
                    table={{ columns, rows }}
                    isSorted={false}
                    entriesPerPage={false}
                    showTotalEntries={false}
                    noEndBorder
                  />
                )}
              </MDBox>
            </Card>
          </Grid>
        </Grid>
      </MDBox>

      <Modal open={openModal} onClose={handleCloseModal}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 400,
            bgcolor: "background.paper",
            borderRadius: 2,
            boxShadow: 24,
            p: 4,
          }}
        >
          <MDTypography variant="h6" mb={2}>
            {editPart ? "Edit Part" : "Add New Part"}
          </MDTypography>
          <TextField label="Name" name="name" fullWidth sx={{ mb: 2 }} value={formData.name} onChange={handleChange} />
          <TextField label="Description" name="description" fullWidth sx={{ mb: 2 }} value={formData.description} onChange={handleChange} />
          <TextField label="Serial Number" name="serial_number" fullWidth sx={{ mb: 2 }} value={formData.serial_number} onChange={handleChange} />
          <TextField label="Type" name="type" fullWidth sx={{ mb: 2 }} value={formData.type} onChange={handleChange} />
          <TextField label="Price" name="price" type="number" fullWidth sx={{ mb: 2 }} value={formData.price} onChange={handleChange} />
          <TextField label="Supplier" name="supplier" fullWidth sx={{ mb: 2 }} value={formData.supplier} onChange={handleChange} />
          <Button variant="contained" color="info" fullWidth onClick={handleSubmit}>
            {editPart ? "Update" : "Add"}
          </Button>
        </Box>
      </Modal>

      <Footer />
    </DashboardLayout>
  );
}

export default Parts;