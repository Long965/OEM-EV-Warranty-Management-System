// src/layouts/authentication/sign-in/index.js
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "context/AuthContext"; // <-- 1. Import useAuth

// (Import các component Material UI)
import Card from "@mui/material/Card";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDInput from "components/MDInput";
import MDButton from "components/MDButton";
import BasicLayout from "layouts/authentication/components/BasicLayout";

function Basic() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false); // Thêm state loading
  const { login } = useAuth(); // <-- 2. Lấy hàm login
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true); // Bắt đầu loading
    
    try {
      // 3. Gọi hàm login
      await login(username, password);
      
      // 4. Đăng nhập thành công, chuyển đến trang chủ
      navigate("/dashboard");
    } catch (err) {
      // 5. Bắt lỗi (sai pass, user không tồn tại)
      setError("Đăng nhập thất bại. Vui lòng kiểm tra lại Username hoặc Password.");
    } finally {
      setLoading(false); // Dừng loading
    }
  };

  return (
    <BasicLayout>
      <Card>
        <MDBox
          variant="gradient"
          bgColor="info"
          borderRadius="lg"
          coloredShadow="info"
          mx={2}
          mt={-3}
          p={2}
          mb={1}
          textAlign="center"
        >
          <MDTypography variant="h4" fontWeight="medium" color="white" mt={1}>
            Sign in
          </MDTypography>
        </MDBox>
        <MDBox pt={4} pb={3} px={3}>
          <MDBox component="form" role="form" onSubmit={handleLogin}>
            <MDBox mb={2}>
              <MDInput
                type="text"
                label="Username"
                fullWidth
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </MDBox>
            <MDBox mb={2}>
              <MDInput
                type="password"
                label="Password"
                fullWidth
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </MDBox>
            
            {error && (
              <MDTypography variant="caption" color="error" fontWeight="medium">
                {error}
              </MDTypography>
            )}

            <MDBox mt={4} mb={1}>
              <MDButton 
                variant="gradient" 
                color="info" 
                fullWidth 
                type="submit"
                disabled={loading} // Vô hiệu hóa nút khi đang loading
              >
                {loading ? "Đang xử lý..." : "Sign in"}
              </MDButton>
            </MDBox>
          </MDBox>
        </MDBox>
      </Card>
    </BasicLayout>
  );
}

export default Basic;