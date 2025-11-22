import React, { useEffect, useState } from "react";
import { getAssignments, createAssignment, updateAssignment, deleteAssignment } from "../api/assignments";
import {
  Container, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
  IconButton, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Typography, Box, Alert, CircularProgress
} from "@mui/material";
import { Edit, Delete, Add } from "@mui/icons-material";

// Cập nhật state ban đầu theo đúng key của API
const initialForm = { 
  part_id: "", 
  vin: "", 
  assigned_to: "", 
  note: "" 
};

export default function Assignments() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState(initialForm);
  const [editId, setEditId] = useState(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await getAssignments();
      // Đảm bảo res.data là mảng, nếu không thì mảng rỗng
      setData(Array.isArray(res.data) ? res.data : []);
    } catch (err) { 
      setError("Lỗi tải danh sách phân công."); 
      console.error(err);
    } finally { 
      setLoading(false); 
    }
  };

  useEffect(() => { loadData(); }, []);

  const handleOpen = (item = null) => {
    setError("");
    setEditId(item ? item.id : null);
    // Nếu là edit thì load dữ liệu vào form, nếu mới thì dùng initialForm
    setFormData(item ? { 
      part_id: item.part_id,
      vin: item.vin,
      assigned_to: item.assigned_to,
      note: item.note
    } : initialForm);
    setOpen(true);
  };

  const handleClose = () => setOpen(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async () => {
    // Validate cơ bản
    if (!formData.part_id || !formData.vin || !formData.assigned_to) {
      setError("Vui lòng điền đầy đủ Part ID, VIN và Người thực hiện.");
      return;
    }

    try {
      // Chuyển đổi part_id sang số nguyên trước khi gửi
      const payload = { ...formData, part_id: parseInt(formData.part_id) };

      if (editId) await updateAssignment(editId, payload);
      else await createAssignment(payload);
      
      handleClose();
      loadData();
    } catch (err) { 
      setError("Lỗi lưu dữ liệu. Kiểm tra lại API."); 
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa phân công này?")) {
      try { 
        await deleteAssignment(id); 
        loadData(); 
      } catch (err) { 
        setError("Xóa thất bại."); 
      }
    }
  };

  // Hàm format ngày giờ cho dễ đọc
  const formatDate = (dateString) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleString('vi-VN');
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Box display="flex" justifyContent="space-between" mb={3}>
        <Typography variant="h4" fontWeight="bold">Quản Lý Phân Công (Assignments)</Typography>
        <Button variant="contained" startIcon={<Add />} onClick={() => handleOpen()}>
          Tạo Phân Công
        </Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {loading ? (
        <Box display="flex" justifyContent="center"><CircularProgress /></Box>
      ) : (
        <TableContainer component={Paper} elevation={3}>
          <Table>
            <TableHead sx={{ bgcolor: '#e3f2fd' }}>
              <TableRow>
                <TableCell><b>ID</b></TableCell>
                <TableCell><b>Part ID</b></TableCell>
                <TableCell><b>VIN (Số khung)</b></TableCell>
                <TableCell><b>Phân công cho</b></TableCell>
                <TableCell><b>Ghi chú</b></TableCell>
                <TableCell><b>Ngày phân công</b></TableCell>
                <TableCell align="center"><b>Hành động</b></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data.length > 0 ? (
                data.map((row) => (
                  <TableRow key={row.id} hover>
                    <TableCell>{row.id}</TableCell>
                    <TableCell>{row.part_id}</TableCell>
                    <TableCell sx={{ color: 'primary.main', fontWeight: 'bold' }}>{row.vin}</TableCell>
                    <TableCell>{row.assigned_to}</TableCell>
                    <TableCell>{row.note}</TableCell>
                    <TableCell>{formatDate(row.assigned_date)}</TableCell>
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
                  <TableCell colSpan={7} align="center">Không có dữ liệu</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Form Dialog */}
      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
        <DialogTitle sx={{ bgcolor: '#f5f5f5', pb: 2 }}>
          {editId ? "Chỉnh Sửa Phân Công" : "Tạo Phân Công Mới"}
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          <Box component="form" sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            
            <TextField 
              label="Part ID" 
              name="part_id" 
              type="number" 
              fullWidth 
              value={formData.part_id} 
              onChange={handleChange} 
              required
              helperText="Nhập ID của linh kiện"
            />
            
            <TextField 
              label="VIN (Số khung xe)" 
              name="vin" 
              fullWidth 
              value={formData.vin} 
              onChange={handleChange} 
              required
              placeholder="Ví dụ: XEHA00000"
            />

            <TextField 
              label="Phân công cho (Assigned To)" 
              name="assigned_to" 
              fullWidth 
              value={formData.assigned_to} 
              onChange={handleChange} 
              required
              placeholder="Ví dụ: Sua xe, Nguyen Van A"
            />

            <TextField 
              label="Ghi chú (Note)" 
              name="note" 
              fullWidth 
              multiline 
              rows={3} 
              value={formData.note} 
              onChange={handleChange} 
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