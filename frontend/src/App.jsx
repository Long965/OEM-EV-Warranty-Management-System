import React, { useState } from 'react';
import './App.css'; // Import file CSS tạo kiểu

function App() {
  // Dùng useState để lưu trữ dữ liệu của form
  const [formData, setFormData] = useState({
    vin: '',
    make: '',
    model: '',
    year: '',
    color: '',
    customer_name: '',
    customer_phone: '',
    customer_address: '',
  });

  // State để lưu thông báo thành công hoặc thất bại
  const [message, setMessage] = useState(null);

  // Hàm xử lý khi người dùng gõ vào ô input
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value,
    }));
  };

  // Hàm xử lý khi bấm nút "LƯU"
  const handleSubmit = (e) => {
    e.preventDefault(); // Ngăn form tải lại trang
    setMessage(null); // Xóa thông báo cũ

    // 1. Phân tách dữ liệu thành 2 phần (vehicle và customer)
    // y hệt như Schema "RegistrationForm" trong backend
    const registrationData = {
      vehicle: {
        vin: formData.vin,
        make: formData.make,
        model: formData.model,
        year: parseInt(formData.year), // Chuyển năm sang số
        color: formData.color,
      },
      customer: {
        full_name: formData.customer_name,
        phone_number: formData.customer_phone,
        address: formData.customer_address,
      }
    };

    console.log('Đang gửi dữ liệu:', registrationData);

    // 2. GỌI API (GẮN API)
    // Chúng ta gọi đến Backend FastAPI (đang chạy ở cổng 8000)
    fetch('http://127.0.0.1:8000/api/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(registrationData), // Gửi dữ liệu JSON
    })
    .then(response => {
      if (!response.ok) {
        // Nếu server trả về lỗi (ví dụ: VIN trùng)
        return response.json().then(err => { 
          throw new Error(err.detail || 'Lỗi không xác định'); 
        });
      }
      return response.json();
    })
    .then(data => {
      // Khi thành công
      console.log('Backend trả về:', data);
      setMessage({ type: 'success', text: `Đăng ký thành công xe VIN: ${data.vehicle.vin}!` });
      // Xóa sạch form
      setFormData({
        vin: '', make: '', model: '', year: '', color: '',
        customer_name: '', customer_phone: '', customer_address: '',
      });
    })
    .catch(error => {
      // Khi thất bại (VÍ DỤ: LỖI "CON VOI" CONNECTION REFUSED)
      console.error('Lỗi khi gọi API:', error);
      setMessage({ type: 'error', text: `Lỗi: ${error.message}` });
    });
  };

  return (
    <div className="App">
      <div className="form-container">
        <h1>Màn hình Đăng ký xe mới</h1>
        
        {/* Hiển thị thông báo (nếu có) */}
        {message && (
          <div className={`message ${message.type}`}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* PHẦN A: THÔNG TIN XE */}
          <div className="form-section">
            <h2>A. Thông tin xe</h2>
            <div className="grid-container">
              <div className="form-group full-width">
                <label htmlFor="vin">Số VIN:</label>
                <input
                  type="text"
                  id="vin"
                  name="vin"
                  value={formData.vin}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="make">Hãng xe:</label>
                <input
                  type="text"
                  id="make"
                  name="make"
                  value={formData.make}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group">
                <label htmlFor="model">Dòng xe:</label>
                <input
                  type="text"
                  id="model"
                  name="model"
                  value={formData.model}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group">
                <label htmlFor="year">Năm sản xuất:</label>
                <input
                  type="number"
                  id="year"
                  name="year"
                  value={formData.year}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group">
                <label htmlFor="color">Màu sắc:</label>
                <input
                  type="text"
                  id="color"
                  name="color"
                  value={formData.color}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>

          {/* PHẦN B: THÔNG TIN CHỦ SỞ HỮU */}
          <div className="form-section">
            <h2>B. Thông tin chủ sở hữu</h2>
            <div className="grid-container">
              <div className="form-group">
                <label htmlFor="customer_name">Họ tên chủ xe:</label>
                <input
                  type="text"
                  id="customer_name"
                  name="customer_name"
                  value={formData.customer_name}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="customer_phone">Số điện thoại:</label>
                <input
                  type="text"
                  id="customer_phone"
                  name="customer_phone"
                  value={formData.customer_phone}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group full-width">
                <label htmlFor="customer_address">Địa chỉ:</label>
                <input
                  type="text"
                  id="customer_address"
                  name="customer_address"
                  value={formData.customer_address}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>

          <button type="submit" className="submit-button">
            Lưu & Đăng Ký Xe
          </button>
        </form>
      </div>
    </div>
  );
}

export default App;