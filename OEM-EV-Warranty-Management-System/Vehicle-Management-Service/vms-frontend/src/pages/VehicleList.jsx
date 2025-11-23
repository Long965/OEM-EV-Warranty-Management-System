import React from 'react';
import useFetchData from '@/hooks/useFetchData';
import VehicleTable from '@/components/vms/VehicleTable';
import LoadingSpinner from '@/components/common/LoadingSpinner';

const VehicleList = () => {
  // Sử dụng hook để fetch danh sách xe
  const { data: vehicles, loading, error, refetch } = useFetchData('/vehicles/');

  if (loading) return <LoadingSpinner />;
  if (error) return <p className="text-center text-red-600 mt-10 p-4 border border-red-300 bg-red-50 rounded-lg">{error} <button onClick={refetch} className="ml-2 text-blue-500 underline">Tải lại</button></p>;
  
  if (vehicles.length === 0) return (
    <div className="bg-white p-6 rounded-xl shadow-2xl mt-10 max-w-4xl mx-auto">
        <h2 className="text-3xl font-extrabold text-gray-800 mb-6 border-b pb-2">Danh sách Xe đã đăng ký (0)</h2>
        <p className="text-center text-gray-500">Chưa có xe nào được đăng ký.</p>
        <button onClick={refetch} className="mt-4 bg-blue-500 text-white p-2 rounded-lg hover:bg-blue-600">Thử lại</button>
    </div>
  );

  return (
    <div className="bg-white p-6 rounded-xl shadow-2xl mt-10 max-w-4xl mx-auto">
      <h2 className="text-3xl font-extrabold text-gray-800 mb-6 border-b pb-2">
        Danh sách Xe đã đăng ký ({vehicles.length})
        <button onClick={refetch} className="ml-4 bg-gray-200 text-gray-700 p-1.5 text-sm rounded-lg hover:bg-gray-300 transition">Tải lại</button>
      </h2>
      <VehicleTable vehicles={vehicles} />
    </div>
  );
};

export default VehicleList;