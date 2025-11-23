import React from 'react';

// Component này chỉ nhận props và hiển thị UI
const RegistrationForm = ({ formData, customers, handleChange, loading, handleSubmit, status }) => {
  return (
    <div className="max-w-xl mx-auto bg-white p-8 rounded-xl shadow-2xl border border-blue-100 mt-10">
      <h2 className="text-3xl font-extrabold text-gray-800 mb-6 border-b pb-2">
        Đăng ký Xe mới (VMS Service)
      </h2>
      
      <p className="mb-4 text-sm text-gray-500">
        Mô phỏng hành động POST API, kích hoạt RabbitMQ Event.
      </p>

      <form onSubmit={handleSubmit} className="space-y-5">
        
        {/* Trường VIN */}
        <div className="flex flex-col">
          <label htmlFor="vin" className="text-sm font-semibold text-gray-700 mb-1">1. VIN (17 ký tự):</label>
          <input 
            type="text" 
            id="vin" 
            name="vin" 
            value={formData.vin}
            onChange={handleChange} 
            required 
            className="p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500" 
            maxLength="17" 
            placeholder="EVN0001000000003"
          />
        </div>
        
        {/* Trường Model & Ngày SX */}
        <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col">
                <label htmlFor="model_code" className="text-sm font-semibold text-gray-700 mb-1">2. Mã Model Xe:</label>
                <input 
                    type="text" 
                    id="model_code" 
                    name="model_code" 
                    value={formData.model_code}
                    onChange={handleChange} 
                    required 
                    className="p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500" 
                    placeholder="VF8-Basic"
                />
            </div>
            <div className="flex flex-col">
                <label htmlFor="manufacturing_date" className="text-sm font-semibold text-gray-700 mb-1">3. Ngày Sản xuất (YYYY-MM-DD):</label>
                <input 
                    type="date" 
                    id="manufacturing_date" 
                    name="manufacturing_date" 
                    value={formData.manufacturing_date}
                    onChange={handleChange} 
                    required 
                    className="p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500" 
                />
            </div>
        </div>
        
        {/* Trường Ngày Đăng ký lần đầu */}
        <div className="flex flex-col">
          <label htmlFor="registration_date" className="text-sm font-semibold text-gray-700 mb-1">4. Ngày Đăng ký lần đầu (YYYY-MM-DD):</label>
          <input 
            type="date" 
            id="registration_date"
            name="registration_date" 
            value={formData.registration_date}
            onChange={handleChange} 
            className="p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500" 
          />
        </div>

        {/* Trường Chủ sở hữu (Dropdown) */}
        <div className="flex flex-col">
          <label htmlFor="customer" className="text-sm font-semibold text-gray-700 mb-1">5. Chủ sở hữu:</label>
          <select 
            id="customer" 
            name="customer" 
            value={formData.customer}
            onChange={handleChange} 
            required 
            className="p-3 border border-gray-300 rounded-lg bg-white focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">-- Chọn khách hàng --</option>
            {customers.map(c => (
              <option key={c.customer_id} value={c.customer_id}>
                {c.full_name} ({c.phone_number})
              </option>
            ))}
          </select>
        </div>
        
        <button 
          type="submit" 
          disabled={loading}
          className={`w-full py-3 px-4 rounded-lg font-bold text-lg transition duration-300 ${loading ? 'bg-gray-400' : 'bg-green-600 hover:bg-green-700 text-white shadow-lg'}`}
        >
          {loading ? 'Đang gửi...' : 'Đăng ký Xe (POST API)'}
        </button>
      </form>
      
      {/* Hiển thị trạng thái */}
      {status && (
        <div className={`mt-6 p-4 rounded-lg text-sm font-medium ${status.includes('thành công') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
          {status}
        </div>
      )}
    </div>
  );
};

export default RegistrationForm;