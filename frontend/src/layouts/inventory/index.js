// src/layouts/inventory/index.js

/* eslint-disable prettier/prettier */
import React, { useEffect, useState } from "react";
// import axios from "axios"; // <-- XÓA DÒNG NÀY
// import api from "src/api/api"; // <-- LỖI Ở ĐÂY
import api from "../../api/api"; // <-- ✅ SỬA LẠI (đường dẫn tương đối)

// (Import các component còn lại...)
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Modal from "@mui/material/Modal";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import Alert from "@mui/material/Alert";

// Icons
import AddIcon from "@mui/icons-material/Add";
import RefreshIcon from "@mui/icons-material/Refresh";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import DataTable from "examples/Tables/DataTable";

// --- Style cho Modal ---
const modalStyle = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 400,
  bgcolor: "background.paper",
  borderRadius: 2,
  boxShadow: 24,
  p: 4,
};

// --- Dữ liệu form rỗng ---
const emptyFormData = {
  part_id: "",
  warehouse: "",
  quantity: "",
  min_threshold: "",
};

function Inventory() {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openModal, setOpenModal] = useState(false);
  const [formData, setFormData] = useState(emptyFormData);
  const [currentId, setCurrentId] = useState(null);

  const INVENTORY_API_URL = "/inventory";

  // Fetch inventory list
  const fetchInventory = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get(`${INVENTORY_API_URL}/`);
      if (Array.isArray(res.data)) {
        setInventory(res.data);
      } else {
        setInventory([]);
      }
    } catch (err) {
      console.error("Fetch inventory error:", err);
      setError("Không thể tải dữ liệu.");
      setInventory([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleOpenModal = (item = null) => {
    if (item) {
      setFormData({
        part_id: item.part_id,
        warehouse: item.warehouse,
        quantity: item.quantity,
        min_threshold: item.min_threshold,
      });
      setCurrentId(item.id);
    } else {
      setFormData(emptyFormData);
      setCurrentId(null);
    }
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setFormData(emptyFormData);
    setCurrentId(null);
  };

  const handleSubmit = async () => {
    setError(null);
    try {
      if (currentId) {
        await api.put(`${INVENTORY_API_URL}/${currentId}/`, formData);
      } else {
        await api.post(`${INVENTORY_API_URL}/`, formData);
      }
      handleCloseModal();
      fetchInventory();
    } catch (err) {
      console.error("Submit error:", err);
      setError("Thao tác thất bại. Vui lòng kiểm tra lại dữ liệu.");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa mục này?")) {
      setError(null);
      try {
        await api.delete(`${INVENTORY_API_URL}/${id}/`);
        fetchInventory();
      } catch (err) {
        console.error("Delete error:", err);
        setError("Xóa thất bại.");
      }
    }
  };

  const columns = [
    { Header: "ID", accessor: "id", align: "center", width: "5%" },
    { Header: "Part ID", accessor: "part_id", align: "center" },
    { Header: "Warehouse", accessor: "warehouse", align: "left" },
    { Header: "Quantity", accessor: "quantity", align: "center" },
    { Header: "Min Threshold", accessor: "min_threshold", align: "center" },
    { Header: "Actions", accessor: "actions", align: "center", width: "10%" },
  ];

  const rows = Array.isArray(inventory)
    ? inventory.map((inv) => ({
        id: inv.id,
        part_id: inv.part_id,
        warehouse: inv.warehouse,
        quantity: inv.quantity,
        min_threshold: inv.min_threshold,
        actions: (
          <MDBox display="flex" justifyContent="center" gap={1}>
            <Tooltip title="Edit">
              <IconButton color="info" size="small" onClick={() => handleOpenModal(inv)}>
                <EditIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Delete">
              <IconButton color="error" size="small" onClick={() => handleDelete(inv.id)}>
                <DeleteIcon />
              </IconButton>
            </Tooltip>
          </MDBox>
        ),
      }))
    : [];

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
                  Inventory Management
                </MDTypography>
                <Box display="flex" gap={1}>
                  <Button
                    variant="contained"
                    color="secondary"
                    startIcon={<AddIcon />}
                    onClick={() => handleOpenModal()}
                  >
                    Add New Item
                  </Button>
                  <IconButton color="inherit" onClick={fetchInventory} disabled={loading}>
                    <RefreshIcon />
                  </IconButton>
                </Box>
              </MDBox>
              <MDBox pt={3} pb={2} px={2}>
                {error && (
                  <MDBox mb={2}>
                    <Alert severity="error">{error}</Alert>
                  </MDBox>
                )}
                {loading ? (
                  <MDTypography align="center">Loading...</MDTypography>
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

      {/* Modal (Dùng cho cả Thêm và Sửa) */}
      <Modal open={openModal} onClose={handleCloseModal}>
        <Box sx={modalStyle}>
          <MDTypography variant="h6" mb={2}>
            {currentId ? "Edit Inventory Item" : "Add New Inventory Item"}
          </MDTypography>
          <TextField
            label="Part ID"
            name="part_id"
            fullWidth
            value={formData.part_id}
            onChange={handleChange}
            sx={{ mb: 2 }}
          />
          <TextField
            label="Warehouse"
            name="warehouse"
            fullWidth
            value={formData.warehouse}
            onChange={handleChange}
            sx={{ mb: 2 }}
          />
          <TextField
            label="Quantity"
            name="quantity"
            type="number"
            fullWidth
            value={formData.quantity}
            onChange={handleChange}
            sx={{ mb: 2 }}
          />
          <TextField
            label="Min Threshold"
            name="min_threshold"
            type="number"
            fullWidth
            value={formData.min_threshold}
            onChange={handleChange}
            sx={{ mb: 2 }}
          />
          <Button variant="contained" color="info" fullWidth onClick={handleSubmit}>
            {currentId ? "Save Changes" : "Create"}
          </Button>
        </Box>
      </Modal>

      <Footer />
    </DashboardLayout>
  );
}

export default Inventory;