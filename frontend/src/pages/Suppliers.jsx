import React, { useEffect, useState } from "react";
// Import từ file API riêng biệt (ĐÚNG YÊU CẦU)
import { getSuppliers, createSupplier, updateSupplier, deleteSupplier } from "../api/suppliers";
import {
  Container, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
  IconButton, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Typography, Box, Alert, CircularProgress
} from "@mui/material";
import { Edit, Delete, Add, Business } from "@mui/icons-material";

const initialForm = { 
  name: "", 
  contact_info: "", 
  address: "", 
  email: "" 
};

export default function Suppliers() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState(initialForm);
  const [editId, setEditId] = useState(null);

  // Hàm tải dữ liệu dùng API import
  const loadData = async () => {
    setLoading(true);
    try {
      const res = await getSuppliers();
      setData(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Load Suppliers Error:", err);
      setError("Lỗi tải danh sách nhà cung cấp.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const handleOpen = (item = null) => {
    setError("");
    setEditId(item ? item.id : null);
    
    if (item) {
      setFormData({
        name: item.name,
        contact_info: item.contact_info || "",
        address: item.address || "",
        email: item.email || ""
      });
    } else {
      setFormData(initialForm);
    }
    setOpen(true);
  };

  const handleClose = () => setOpen(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async () => {
    if (!formData.name.trim() || !formData.email.trim()) {
      setError("Vui lòng điền Tên nhà cung cấp và Email.");
      return;
    }

    try {
      if (editId) {
        await updateSupplier(editId, formData);
      } else {
        await createSupplier(formData);
      }
      
      handleClose();
      loadData();
    } catch (err) { 
      console.error("Submit Error:", err);
      const serverMsg = err.response?.data?.detail || err.message;
      const displayMsg = typeof serverMsg === 'object' ? JSON.stringify(serverMsg) : serverMsg;
      setError(`Lỗi lưu dữ liệu: ${displayMsg}`); 
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa nhà cung cấp này?")) {
      try { 
        await deleteSupplier(id); 
        loadData(); 
      } catch (err) { 
        console.error("Delete Error:", err);
        setError("Xóa thất bại. Có thể nhà cung cấp đang được sử dụng."); 
      }
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Box display="flex" justifyContent="space-between" mb={3}>
        <Typography variant="h4" fontWeight="bold" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
           <Business fontSize="large" color="primary" /> Quản Lý Nhà Cung Cấp
        </Typography>
        <Button variant="contained" startIcon={<Add />} onClick={() => handleOpen()}>
          Thêm Nhà Cung Cấp
        </Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>{error}</Alert>}

      {loading ? (
        <Box display="flex" justifyContent="center" mt={5}><CircularProgress /></Box>
      ) : (
        <TableContainer component={Paper} elevation={3}>
          <Table>
            <TableHead sx={{ bgcolor: '#e3f2fd' }}>
              <TableRow>
                <TableCell><b>ID</b></TableCell>
                <TableCell><b>Tên Nhà Cung Cấp</b></TableCell>
                <TableCell><b>Liên Hệ</b></TableCell>
                <TableCell><b>Email</b></TableCell>
                <TableCell><b>Địa Chỉ</b></TableCell>
                <TableCell align="center"><b>Hành động</b></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data.length > 0 ? (
                data.map((row) => (
                  <TableRow key={row.id} hover>
                    <TableCell>{row.id}</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', color: 'primary.main' }}>{row.name}</TableCell>
                    <TableCell>{row.contact_info || "---"}</TableCell>
                    <TableCell>{row.email}</TableCell>
                    <TableCell>{row.address || "---"}</TableCell>
                    <TableCell align="center">
                      <IconButton color="primary" onClick={() => handleOpen(row)} size="small">
                        <Edit />
                      </IconButton>
                      <IconButton color="error" onClick={() => handleDelete(row.id)} size="small">
                        <Delete />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 3, color: 'text.secondary' }}>
                    Không có dữ liệu
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
        <DialogTitle sx={{ bgcolor: '#f5f5f5', pb: 2 }}>
          {editId ? "Chỉnh Sửa Nhà Cung Cấp" : "Thêm Nhà Cung Cấp Mới"}
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          <Box component="form" sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            
            <TextField 
              label="Tên Nhà Cung Cấp" 
              name="name" 
              fullWidth 
              required
              value={formData.name} 
              onChange={handleChange} 
              placeholder="Ví dụ: Công Ty TNHH Phụ Tùng A"
            />
            
            <Box display="flex" gap={2}>
              <TextField 
                label="Người Liên Hệ / SĐT" 
                name="contact_info" 
                fullWidth 
                value={formData.contact_info} 
                onChange={handleChange} 
                placeholder="Ví dụ: 0909123456 (Anh A)"
              />
              
              <TextField 
                label="Email" 
                name="email" 
                type="email"
                fullWidth 
                required
                value={formData.email} 
                onChange={handleChange} 
                placeholder="contact@company.com"
              />
            </Box>

            <TextField 
              label="Địa Chỉ" 
              name="address" 
              fullWidth 
              multiline 
              rows={2} 
              value={formData.address} 
              onChange={handleChange} 
              placeholder="Nhập địa chỉ văn phòng/kho..."
            />
            
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={handleClose} color="inherit">Hủy</Button>
          <Button onClick={handleSubmit} variant="contained" color="primary">
            {editId ? "Cập Nhật" : "Lưu Lại"}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}