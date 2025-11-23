import React from 'react';

const VehicleTable = ({ vehicles }) => {
  return (
    <div className="overflow-x-auto shadow-md rounded-lg">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-100">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider rounded-tl-lg">VIN</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Model</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Chủ sở hữu</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Ngày SX</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider rounded-tr-lg">Trạng thái</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {vehicles.map((vehicle) => (
            <tr key={vehicle.vin} className="hover:bg-blue-50 transition duration-150">
              <td className="px-4 py-4 whitespace-nowrap text-sm font-mono text-gray-900">{vehicle.vin}</td>
              <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700">{vehicle.model_code}</td>
              <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-blue-600">{vehicle.customer_name}</td>
              <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">{vehicle.manufacturing_date}</td>
              <td className="px-4 py-4 whitespace-nowrap text-sm">
                <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${vehicle.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                  {vehicle.is_active ? 'Active' : 'Inactive'}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default VehicleTable;