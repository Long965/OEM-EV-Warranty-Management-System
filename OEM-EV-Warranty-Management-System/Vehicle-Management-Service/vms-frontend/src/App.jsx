import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Header from '@/components/layout/Header'; // SỬ DỤNG ALIAS @/
import VehicleList from '@/pages/VehicleList'; // SỬ DỤNG ALIAS @/
import VehicleRegistration from '@/pages/VehicleRegistration'; // SỬ DỤNG ALIAS @/
import CustomerList from '@/pages/CustomerList'; // SỬ DỤNG ALIAS @/

function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header /> 
      <main className="container mx-auto p-4 sm:p-8">
        <Routes>
          {/* Trang mặc định: Đăng ký xe */}
          <Route path="/" element={<VehicleRegistration />} /> 
          {/* Trang danh sách xe */}
          <Route path="/vehicles" element={<VehicleList />} /> 
          {/* Trang danh sách khách hàng */}
          <Route path="/customers" element={<CustomerList />} /> 
          {/* Thêm trang 404 nếu cần */}
          <Route path="*" element={<div className="text-center p-20 text-xl text-gray-500">404 - Không tìm thấy trang</div>} />
        </Routes>
      </main>
    </div>
  );
}

export default App;