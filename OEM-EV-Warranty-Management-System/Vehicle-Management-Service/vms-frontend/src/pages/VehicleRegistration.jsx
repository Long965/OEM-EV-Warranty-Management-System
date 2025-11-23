import React, { useState } from 'react';
import { registerVehicle } from '@/api/vmsApi';
import useFetchData from '@/hooks/useFetchData';
import RegistrationForm from '@/components/vms/RegistrationForm';
import LoadingSpinner from '@/components/common/LoadingSpinner';

const VehicleRegistration = () => {
  // Sử dụng hook để fetch danh sách khách hàng
  const { data: customers, loading: loadingCustomers, error: errorCustomers, refetch: refetchCustomers } = useFetchData('/customers/');

  const [formData, setFormData] = useState({
    vin: '',
    model_code: '',
    manufacturing_date: '',
    registration_date: '',
    customer: '', 
    is_active: true,
  });
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus('Đang xử lý đăng ký...');
    
    // Thêm validation cơ bản
    if (formData.vin.length !== 17) {
        setStatus('Đăng ký thất bại: VIN phải có đúng 17 ký tự.');
        setLoading(false);
        return;
    }
    
    try {
      // GỌI API POST (Kích hoạt Signal/RabbitMQ ở Backend)
      const newVehicle = await registerVehicle(formData);
      setStatus(`✅ Đăng ký xe thành công! VIN: ${newVehicle.vin}. Sự kiện đã được gửi đi.`);
      setFormData({ // Reset form
        vin: '',
        model_code: '',
        manufacturing_date: '',
        registration_date: '',
        customer: '',
        is_active: true,
      });
    } catch (error) {
      console.error('Registration failed:', error.response ? error.response.data : error.message);
      
      let errorMsg = 'Đăng ký thất bại. ';
      if (error.response && error.response.data) {
        // Cố gắng hiển thị lỗi chi tiết từ Backend
        errorMsg += 'Lỗi từ Backend: ' + JSON.stringify(error.response.data);
      } else {
        errorMsg += error.message;
      }

      setStatus(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  if (loadingCustomers) return <LoadingSpinner />;
  if (errorCustomers) return <p className="text-center text-red-600 mt-10">Lỗi tải khách hàng: {errorCustomers} <button onClick={refetchCustomers} className="ml-2 text-blue-500 underline">Tải lại</button></p>;


  return (
    <RegistrationForm
        formData={formData}
        customers={customers}
        handleChange={handleChange}
        handleSubmit={handleSubmit}
        loading={loading}
        status={status}
    />
  );
};

export default VehicleRegistration;