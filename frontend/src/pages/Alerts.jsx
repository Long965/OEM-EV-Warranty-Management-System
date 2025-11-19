import React, { useEffect, useState } from "react";
import { getAlerts, deleteAlert } from "../api/alerts";
import {
  Container, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
  IconButton, Typography, Box, Alert, CircularProgress, Chip
} from "@mui/material";
import { Delete } from "@mui/icons-material";

export default function Alerts() {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await getAlerts();
      setAlerts(Array.isArray(res.data) ? res.data : []);
    } catch (err) { setError("Lỗi tải cảnh báo."); } 
    finally { setLoading(false); }
  };

  useEffect(() => { loadData(); }, []);

  const handleDelete = async (id) => {
    if (window.confirm("Xóa cảnh báo?")) {
      try { await deleteAlert(id); loadData(); } catch (err) { setError("Lỗi xóa."); }
    }
  };

  return (
    <>
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Box mb={3}>
          <Typography variant="h4" color="error">⚠️ Cảnh Báo Tồn Kho</Typography>
        </Box>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {loading ? <CircularProgress /> : (
          <TableContainer component={Paper}>
            <Table>
              <TableHead sx={{ bgcolor: '#ffebee' }}>
                <TableRow>
                  <TableCell>ID</TableCell><TableCell>Tên Phụ Tùng</TableCell><TableCell>Loại</TableCell>
                  <TableCell align="center">Số Lượng</TableCell><TableCell>Thông Báo</TableCell><TableCell align="right">Hành Động</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {alerts.length === 0 ? (
                    <TableRow><TableCell colSpan={6} align="center">Không có cảnh báo.</TableCell></TableRow>
                ) : alerts.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell>{row.id}</TableCell><TableCell>{row.part_name}</TableCell>
                    <TableCell><Chip label={row.type} color="warning" size="small" /></TableCell>
                    <TableCell align="center" sx={{ fontWeight: 'bold', color: 'red' }}>{row.quantity}</TableCell>
                    <TableCell>{row.message}</TableCell>
                    <TableCell align="right">
                      <IconButton color="error" onClick={() => handleDelete(row.id)}><Delete /></IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Container>
    </>
  );
}