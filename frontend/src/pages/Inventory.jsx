import React, { useEffect, useState } from "react";
import { getInventory, createInventoryItem, updateInventoryItem, deleteInventoryItem } from "../api/inventory";
import {
  Container, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
  IconButton, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Typography, Box, Alert, CircularProgress, Chip
} from "@mui/material";
import { Edit, Delete, Add } from "@mui/icons-material";

const initialForm = { part_id: "", warehouse: "", quantity: "", min_threshold: 10 };

export default function Inventory() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState(initialForm);
  const [editId, setEditId] = useState(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await getInventory();
      setItems(Array.isArray(res.data) ? res.data : []);
    } catch (err) { setError("Lỗi tải dữ liệu kho."); } 
    finally { setLoading(false); }
  };

  useEffect(() => { loadData(); }, []);

  const handleOpen = (item = null) => {
    setError("");
    setEditId(item ? item.id : null);
    setFormData(item ? { ...item } : initialForm);
    setOpen(true);
  };

  const handleClose = () => setOpen(false);
  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async () => {
    try {
      const payload = { 
        ...formData, 
        quantity: Number(formData.quantity), 
        min_threshold: Number(formData.min_threshold), 
        part_id: Number(formData.part_id) 
      };
      if (editId) await updateInventoryItem(editId, payload);
      else await createInventoryItem(payload);
      handleClose();
      loadData();
    } catch (err) { setError("Lỗi khi lưu dữ liệu."); }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Xóa mục này?")) {
      try { await deleteInventoryItem(id); loadData(); } catch (err) { setError("Xóa thất bại."); }
    }
  };

  return (
    <>
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Box display="flex" justifyContent="space-between" mb={3}>
          <Typography variant="h4">Quản Lý Kho</Typography>
          <Button variant="contained" startIcon={<Add />} onClick={() => handleOpen()}>Nhập Kho</Button>
        </Box>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {loading ? <CircularProgress /> : (
          <TableContainer component={Paper}>
            <Table>
              <TableHead sx={{ bgcolor: '#e3f2fd' }}>
                <TableRow>
                  <TableCell>ID</TableCell><TableCell>Mã Phụ Tùng</TableCell><TableCell>Kho</TableCell>
                  <TableCell align="center">Số Lượng</TableCell><TableCell align="center">Min</TableCell>
                  <TableCell align="center">Trạng Thái</TableCell><TableCell align="right">Hành Động</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {items.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell>{row.id}</TableCell><TableCell>{row.part_id}</TableCell><TableCell>{row.warehouse}</TableCell>
                    <TableCell align="center">{row.quantity}</TableCell><TableCell align="center">{row.min_threshold}</TableCell>
                    <TableCell align="center">
                      {row.quantity < row.min_threshold ? <Chip label="Sắp hết" color="error" size="small"/> : <Chip label="OK" color="success" size="small"/>}
                    </TableCell>
                    <TableCell align="right">
                      <IconButton color="primary" onClick={() => handleOpen(row)}><Edit /></IconButton>
                      <IconButton color="error" onClick={() => handleDelete(row.id)}><Delete /></IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
        <Dialog open={open} onClose={handleClose}>
          <DialogTitle>{editId ? "Sửa Kho" : "Nhập Kho"}</DialogTitle>
          <DialogContent>
            <TextField margin="dense" label="Part ID" name="part_id" type="number" fullWidth value={formData.part_id} onChange={handleChange} disabled={!!editId} />
            <TextField margin="dense" label="Kho" name="warehouse" fullWidth value={formData.warehouse} onChange={handleChange} />
            <TextField margin="dense" label="Số Lượng" name="quantity" type="number" fullWidth value={formData.quantity} onChange={handleChange} />
            <TextField margin="dense" label="Ngưỡng Tối Thiểu" name="min_threshold" type="number" fullWidth value={formData.min_threshold} onChange={handleChange} />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose}>Hủy</Button>
            <Button onClick={handleSubmit} variant="contained">Lưu</Button>
          </DialogActions>
        </Dialog>
      </Container>
    </>
  );
}