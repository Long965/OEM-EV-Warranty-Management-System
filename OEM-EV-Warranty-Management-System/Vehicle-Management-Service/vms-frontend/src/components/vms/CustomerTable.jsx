import React from 'react';

const CustomerTable = ({ customers }) => {
    return (
        <div className="overflow-x-auto shadow-md rounded-lg">
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-100">
                    <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider rounded-tl-lg">ID Khách hàng</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Họ và Tên</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Điện thoại</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider rounded-tr-lg">Email</th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {customers.map((c) => (
                        <tr key={c.customer_id} className="hover:bg-blue-50 transition duration-150">
                            <td className="px-4 py-4 whitespace-nowrap text-xs font-mono text-gray-500">{c.customer_id ? c.customer_id.substring(0, 8) + '...' : 'N/A'}</td>
                            <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{c.full_name}</td>
                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700">{c.phone_number}</td>
                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">{c.email}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default CustomerTable;