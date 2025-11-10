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
import AddCircleIcon from "@mui/icons-material/AddCircle";
import RemoveCircleIcon from "@mui/icons-material/RemoveCircle";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import DataTable from "examples/Tables/DataTable";
import Modal from "@mui/material/Modal";
import Box from "@mui/material/Box";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";

function Tables() {
  const [parts, setParts] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [openModal, setOpenModal] = useState(false);
  const [editPart, setEditPart] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "info" });
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    quantity: "",
  });

  const API_URL = process.env.REACT_APP_API_URL || "http://localhost:8000";

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get(`${API_URL}/parts/`);
        setParts(res.data);
      } catch (err) {
        console.error("API fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [API_URL]);

  const showSnackbar = (message, severity = "info") => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const handleOpenModal = (part = null) => {
    if (part) {
      setEditPart(part);
      setFormData({
        name: part.name,
        description: part.description,
        quantity: part.quantity,
      });
    } else {
      setEditPart(null);
      setFormData({ name: "", description: "", quantity: "" });
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
        const res = await axios.put(`${API_URL}/parts/${editPart.id}`, formData);
        setParts((prev) => prev.map((p) => (p.id === editPart.id ? res.data : p)));
        showSnackbar("Part updated successfully!", "success");
      } else {
        const res = await axios.post(`${API_URL}/parts/`, formData);
        setParts((prev) => [...prev, res.data]);
        showSnackbar("Part added successfully!", "success");
      }

      if (parseInt(formData.quantity, 10) < 5) {
        showSnackbar("⚠️ Low stock alert for this part!", "warning");
      }

      handleCloseModal();
    } catch (err) {
      console.error("Save error:", err);
      showSnackbar("Error saving part!", "error");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this part?")) return;
    try {
      await axios.delete(`${API_URL}/parts/${id}`);
      setParts((prev) => prev.filter((p) => p.id !== id));
      showSnackbar("Part deleted successfully!", "success");
    } catch (err) {
      console.error("Delete error:", err);
      showSnackbar("Error deleting part!", "error");
    }
  };

  const handleAdjustQuantity = async (part, delta) => {
    const newQty = part.quantity + delta;
    try {
      const res = await axios.put(`${API_URL}/parts/${part.id}`, {
        ...part,
        quantity: newQty,
      });
      setParts((prev) => prev.map((p) => (p.id === part.id ? res.data : p)));
      showSnackbar(`Quantity ${delta > 0 ? "increased" : "decreased"}!`, "info");
      if (newQty < 5) showSnackbar("⚠️ Low stock alert!", "warning");
    } catch (err) {
      console.error("Quantity update error:", err);
      showSnackbar("Error updating quantity!", "error");
    }
  };

  const filteredParts = parts.filter((p) =>
    p.name?.toLowerCase().includes(search.toLowerCase())
  );

  const getStockStatus = (quantity) => {
    if (quantity < 5) return <MDTypography color="error">Low Stock</MDTypography>;
    if (quantity > 20) return <MDTypography color="success">In Stock</MDTypography>;
    return <MDTypography color="warning">Limited</MDTypography>;
  };

  const columns = [
    { Header: "ID", accessor: "id", align: "center" },
    { Header: "Part Name", accessor: "name", align: "left" },
    { Header: "Description", accessor: "description", align: "left" },
    { Header: "Quantity", accessor: "quantity", align: "center" },
    { Header: "Status", accessor: "status", align: "center" },
    { Header: "Actions", accessor: "actions", align: "center" },
  ];

  const rows = filteredParts.map((p) => ({
    id: p.id,
    name: p.name,
    description: p.description,
    quantity: p.quantity,
    status: getStockStatus(p.quantity),
    actions: (
      <>
        <IconButton onClick={() => handleAdjustQuantity(p, 1)} color="success">
          <AddCircleIcon />
        </IconButton>
        <IconButton onClick={() => handleAdjustQuantity(p, -1)} color="warning">
          <RemoveCircleIcon />
        </IconButton>
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
                  Parts Inventory
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

      {/* Modal Add/Edit */}
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
          <TextField
            label="Name"
            name="name"
            fullWidth
            value={formData.name}
            onChange={handleChange}
            sx={{ mb: 2 }}
          />
          <TextField
            label="Description"
            name="description"
            fullWidth
            value={formData.description}
            onChange={handleChange}
            sx={{ mb: 2 }}
          />
          <TextField
            label="Quantity"
            name="quantity"
            fullWidth
            type="number"
            value={formData.quantity}
            onChange={handleChange}
            sx={{ mb: 2 }}
          />
          <Button variant="contained" color="info" fullWidth onClick={handleSubmit}>
            {editPart ? "Update" : "Add"}
          </Button>
        </Box>
      </Modal>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: "100%" }}>
          {snackbar.message}
        </Alert>
      </Snackbar>

      <Footer />
    </DashboardLayout>
  );
}

export default Tables;
