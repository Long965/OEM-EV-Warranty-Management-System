/* eslint-disable prettier/prettier */
import React, { useEffect, useState } from "react";
import axios from "axios";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Modal from "@mui/material/Modal";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import AddIcon from "@mui/icons-material/Add";
import RefreshIcon from "@mui/icons-material/Refresh";

import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import DataTable from "examples/Tables/DataTable";

function Inventory() {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openModal, setOpenModal] = useState(false);
  const [formData, setFormData] = useState({
    part_id: "",
    warehouse: "",
    quantity: "",
    min_threshold: "",
  });

  const API_URL = process.env.REACT_APP_API_URL || "http://localhost:8000";

  // Fetch inventory list
  const fetchInventory = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/inventory/inventory/`);
      setInventory(res.data);
    } catch (err) {
      console.error("Fetch inventory error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  // Handle form input change
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle import new inventory
  const handleImport = async () => {
    try {
      await axios.post(`${API_URL}/inventory/inventory/import`, formData);
      handleCloseModal();
      fetchInventory();
    } catch (err) {
      console.error("Import error:", err);
      alert("❌ Import failed. Please check your data or backend.");
    }
  };

  const handleOpenModal = () => setOpenModal(true);
  const handleCloseModal = () => {
    setOpenModal(false);
    setFormData({
      part_id: "",
      warehouse: "",
      quantity: "",
      min_threshold: "",
    });
  };

  // Define table columns
  const columns = [
    { Header: "ID", accessor: "id", align: "center" },
    { Header: "Part ID", accessor: "part_id", align: "center" },
    { Header: "Warehouse", accessor: "warehouse", align: "left" },
    { Header: "Quantity", accessor: "quantity", align: "center" },
    { Header: "Min Threshold", accessor: "min_threshold", align: "center" },
  ];

  // Map data rows
  const rows = inventory.map((inv) => ({
    id: inv.id,
    part_id: inv.part_id,
    warehouse: inv.warehouse,
    quantity: inv.quantity,
    min_threshold: inv.min_threshold,
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
                  Inventory Management
                </MDTypography>

                <Box display="flex" gap={1}>
                  <Button
                    variant="contained"
                    color="secondary"
                    startIcon={<AddIcon />}
                    onClick={handleOpenModal}
                  >
                    Import Stock
                  </Button>
                  <IconButton color="inherit" onClick={fetchInventory}>
                    <RefreshIcon />
                  </IconButton>
                </Box>
              </MDBox>

              <MDBox pt={3} pb={2} px={2}>
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

      {/* Modal Import */}
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
            Import Inventory
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

          <Button variant="contained" color="info" fullWidth onClick={handleImport}>
            Import
          </Button>
        </Box>
      </Modal>

      <Footer />
    </DashboardLayout>
  );
}

export default Inventory;
