import React, { useEffect, useState } from "react";
import { getInventory, createInventoryItem, updateInventoryItem, deleteInventoryItem } from "../api/inventory";
import {
  Container, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
  IconButton, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Typography, Box, Alert, CircularProgress, Chip
} from "@mui/material";
import { Edit, Delete, Add } from "@mui/icons-material";

// Giá trị mặc định
const initialForm = { part_id: "", warehouse: "", quantity: 0, min_threshold: 10 };

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
      // Đảm bảo luôn là mảng để không lỗi map
      setItems(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Load Error:", err);
      setError("Không thể tải dữ liệu kho. Kiểm tra kết nối Server.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const handleOpen = (item = null) => {
    setError(""); // Reset lỗi cũ
    setEditId(item ? item.id : null);
    
    if (item) {
      setFormData({
        part_id: item.part_id,
        warehouse: item.warehouse,
        quantity: item.quantity,
        min_threshold: item.min_threshold
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
    setError(""); // Xóa lỗi cũ trước khi gửi

    // 1. VALIDATION CƠ BẢN TẠI FRONTEND
    if (!formData.part_id || !formData.warehouse) {
        setError("Vui lòng nhập Mã Phụ Tùng và Tên Kho.");
        return;
    }

    try {
      // 2. CHUẨN HÓA DỮ LIỆU (QUAN TRỌNG)
      // API yêu cầu số nguyên, form trả về chuỗi -> Cần ép kiểu
      const payload = { 
        warehouse: formData.warehouse,
        part_id: parseInt(formData.part_id),
        quantity: parseInt(formData.quantity) || 0, // Nếu rỗng thì mặc định 0
        min_threshold: parseInt(formData.min_threshold) || 0
      };

      console.log("Sending Payload:", payload); // Xem log này ở F12 nếu lỗi

      if (editId) await updateInventoryItem(editId, payload);
      else await createInventoryItem(payload);
      
      handleClose();
      loadData();
    } catch (err) { 
      console.error("Submit Error:", err);
      
      // 3. HIỂN THỊ LỖI CHÍNH XÁC TỪ SERVER
      // Nếu server trả về detail (FastAPI thường dùng key này), hiển thị nó
      const serverMsg = err.response?.data?.detail || err.message;
      
      // Nếu lỗi là object (ví dụ validation error), convert sang chuỗi dễ đọc
      const displayMsg = typeof serverMsg === 'object' 
        ? JSON.stringify(serverMsg) 
        : serverMsg || "Lỗi không xác định khi lưu dữ liệu.";

      setError(displayMsg); 
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa mục kho này?")) {
      try { 
        await deleteInventoryItem(id); 
        loadData(); 
      } catch (err) { 
        console.error("Delete Error:", err);
        setError("Xóa thất bại. Có thể dữ liệu này đang được sử dụng."); 
      }
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Box display="flex" justifyContent="space-between" mb={3}>
        <Typography variant="h4" fontWeight="bold">Quản Lý Kho</Typography>
        <Button variant="contained" startIcon={<Add />} onClick={() => handleOpen()}>
          Nhập Kho Mới
        </Button>
      </Box>

      {/* Hiển thị lỗi chi tiết màu đỏ */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>
          {error}
        </Alert>
      )}

      {loading ? (
        <Box display="flex" justifyContent="center" mt={5}><CircularProgress /></Box>
      ) : (
        <TableContainer component={Paper} elevation={3}>
          <Table>
            <TableHead sx={{ bgcolor: '#e3f2fd' }}>
              <TableRow>
                <TableCell><b>ID</b></TableCell>
                <TableCell><b>Mã Phụ Tùng (Part ID)</b></TableCell>
                <TableCell><b>Tên Kho</b></TableCell>
                <TableCell align="center"><b>Số Lượng</b></TableCell>
                <TableCell align="center"><b>Ngưỡng Min</b></TableCell>
                <TableCell align="center"><b>Trạng Thái</b></TableCell>
                <TableCell align="right"><b>Hành Động</b></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {items.length > 0 ? (
                items.map((row) => (
                  <TableRow key={row.id} hover>
                    <TableCell>{row.id}</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                        {row.part_id}
                    </TableCell>
                    <TableCell>{row.warehouse}</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 'bold' }}>
                        {row.quantity}
                    </TableCell>
                    <TableCell align="center">{row.min_threshold}</TableCell>
                    <TableCell align="center">
                      {row.quantity < row.min_threshold ? 
                        <Chip label="Sắp hết hàng" color="error" size="small" /> : 
                        <Chip label="Ổn định" color="success" size="small" />
                      }
                    </TableCell>
                    <TableCell align="right">
                      <IconButton color="primary" onClick={() => handleOpen(row)}><Edit /></IconButton>
                      <IconButton color="error" onClick={() => handleDelete(row.id)}><Delete /></IconButton>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                    <TableCell colSpan={7} align="center">Chưa có dữ liệu kho</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
        <DialogTitle>{editId ? "Cập Nhật Kho" : "Nhập Kho Mới"}</DialogTitle>
        <DialogContent>
          <Box component="form" sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            
            <TextField 
                label="Mã Phụ Tùng (Part ID)" 
                name="part_id" 
                type="number" 
                fullWidth 
                required
                // Không cho sửa Part ID khi Edit vì liên quan đến khóa ngoại
                disabled={!!editId} 
                value={formData.part_id} 
                onChange={handleChange} 
                helperText="ID của phụ tùng phải tồn tại trong hệ thống"
            />
            
            <TextField 
                label="Tên Kho / Vị Trí" 
                name="warehouse" 
                fullWidth 
                required
                value={formData.warehouse} 
                onChange={handleChange} 
                placeholder="Ví dụ: Kho Hà Nội, Kệ A-01"
            />
            
            <Box display="flex" gap={2}>
                <TextField 
                    label="Số Lượng Thực Tế" 
                    name="quantity" 
                    type="number" 
                    fullWidth 
                    value={formData.quantity} 
                    onChange={handleChange} 
                />
                <TextField 
                    label="Ngưỡng Tối Thiểu (Cảnh báo)" 
                    name="min_threshold" 
                    type="number" 
                    fullWidth 
                    value={formData.min_threshold} 
                    onChange={handleChange} 
                />
            </Box>

          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={handleClose} color="inherit">Hủy</Button>
          <Button onClick={handleSubmit} variant="contained" color="primary">
            {editId ? "Cập Nhật" : "Lưu Dữ Liệu"}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}