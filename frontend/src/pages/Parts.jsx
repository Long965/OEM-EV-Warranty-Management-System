import React, { useEffect, useState } from "react";
import { getParts, createPart, updatePart, deletePart } from "../api/parts";
import {
  Container, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
  IconButton, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Typography, Box, Alert, CircularProgress
} from "@mui/material";
import { Edit, Delete, Add } from "@mui/icons-material";

// Cập nhật state khớp với JSON: thay oem_number bằng sku, thêm price, supplier_id
const initialForm = { 
  name: "", 
  sku: "", 
  category: "", 
  price: "", 
  description: "",
  supplier_id: "" 
};

export default function Parts() {
  const [parts, setParts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState(initialForm);
  const [editId, setEditId] = useState(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await getParts();
      setParts(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      setError("Lỗi tải danh sách phụ tùng.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const handleOpen = (item = null) => {
    setError("");
    setEditId(item ? item.id : null);
    // Khi edit, map dữ liệu vào form. Lưu ý xử lý null cho các trường có thể null
    setFormData(item ? { 
      name: item.name,
      sku: item.sku,
      category: item.category || "",
      price: item.price,
      description: item.description || "",
      supplier_id: item.supplier_id || ""
    } : initialForm);
    setOpen(true);
  };

  const handleClose = () => setOpen(false);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async () => {
    // Validate đơn giản
    if (!formData.name || !formData.sku || !formData.price) {
        setError("Vui lòng nhập Tên, SKU và Giá.");
        return;
    }

    try {
      // Chuyển đổi dữ liệu số trước khi gửi lên Server
      const payload = {
        ...formData,
        price: Number(formData.price),
        supplier_id: formData.supplier_id ? Number(formData.supplier_id) : null
      };

      if (editId) await updatePart(editId, payload);
      else await createPart(payload);
      
      handleClose();
      loadData();
    } catch (err) { 
      setError("Lỗi khi lưu dữ liệu. Kiểm tra lại API."); 
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Bạn có chắc chắn xóa phụ tùng này không?")) {
      try { await deletePart(id); loadData(); } catch (err) { setError("Xóa thất bại."); }
    }
  };

  // Hàm format tiền tệ VND
  const formatCurrency = (value) => {
    if (!value) return "0 ₫";
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Box display="flex" justifyContent="space-between" mb={3}>
        <Typography variant="h4" fontWeight="bold">Quản Lý Phụ Tùng</Typography>
        <Button variant="contained" startIcon={<Add />} onClick={() => handleOpen()}>
          Thêm Phụ Tùng
        </Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {loading ? (
        <Box display="flex" justifyContent="center"><CircularProgress /></Box>
      ) : (
        <TableContainer component={Paper} elevation={3}>
          <Table>
            <TableHead sx={{ bgcolor: '#e0f7fa' }}>
              <TableRow>
                <TableCell><b>ID</b></TableCell>
                <TableCell><b>Tên Phụ Tùng</b></TableCell>
                <TableCell><b>Mã SKU</b></TableCell>
                <TableCell><b>Giá</b></TableCell>
                <TableCell><b>Danh Mục</b></TableCell>
                <TableCell><b>Mô Tả</b></TableCell>
                <TableCell align="right"><b>Hành Động</b></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {parts.map((row) => (
                <TableRow key={row.id} hover>
                  <TableCell>{row.id}</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', color: 'primary.main' }}>{row.name}</TableCell>
                  <TableCell>{row.sku}</TableCell>
                  <TableCell sx={{ color: 'success.main', fontWeight: 'bold' }}>
                    {formatCurrency(row.price)}
                  </TableCell>
                  <TableCell>{row.category || "---"}</TableCell>
                  <TableCell>{row.description}</TableCell>
                  <TableCell align="right">
                    <IconButton color="primary" onClick={() => handleOpen(row)}><Edit /></IconButton>
                    <IconButton color="error" onClick={() => handleDelete(row.id)}><Delete /></IconButton>
                  </TableCell>
                </TableRow>
              ))}
              {parts.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} align="center">Chưa có dữ liệu</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Dialog Form */}
      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
        <DialogTitle>{editId ? "Cập Nhật Phụ Tùng" : "Thêm Mới Phụ Tùng"}</DialogTitle>
        <DialogContent>
          <Box component="form" sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField 
                label="Tên Phụ Tùng" 
                name="name" 
                fullWidth 
                required
                value={formData.name} 
                onChange={handleChange} 
            />
            <Box display="flex" gap={2}>
                <TextField 
                    label="Mã SKU" 
                    name="sku" 
                    fullWidth 
                    required
                    value={formData.sku} 
                    onChange={handleChange} 
                    placeholder="VD: VF-WHEEL-001"
                />
                <TextField 
                    label="Giá (VNĐ)" 
                    name="price" 
                    type="number" 
                    fullWidth 
                    required
                    value={formData.price} 
                    onChange={handleChange} 
                />
            </Box>
            <Box display="flex" gap={2}>
                <TextField 
                    label="Danh Mục" 
                    name="category" 
                    fullWidth 
                    value={formData.category} 
                    onChange={handleChange} 
                />
                <TextField 
                    label="Supplier ID" 
                    name="supplier_id" 
                    type="number"
                    fullWidth 
                    value={formData.supplier_id} 
                    onChange={handleChange} 
                />
            </Box>
            <TextField 
                label="Mô Tả Chi Tiết" 
                name="description" 
                fullWidth 
                multiline 
                rows={3} 
                value={formData.description} 
                onChange={handleChange} 
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={handleClose} color="inherit">Hủy</Button>
          <Button onClick={handleSubmit} variant="contained" color="primary">
            {editId ? "Cập Nhật" : "Lưu Mới"}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}