import React, { useEffect, useState } from 'react';
import { getFaultData } from '../api/campaignsApi'; 
import './FaultDataPage.css';

const FaultDataPage = () => {
    const [faults, setFaults] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchFaults = async () => {
            try {
                // Lấy dữ liệu FaultData từ Backend
                const response = await getFaultData();
                setFaults(response);
                setError(null);
            } catch (err) {
                setError('Lỗi khi tải dữ liệu lỗi từ Backend.');
            } finally {
                setLoading(false);
            }
        };
        fetchFaults();
    }, []);

    if (loading) return <div className="loading-state">Đang tải dữ liệu lỗi...</div>;
    if (error) return <div className="error-message">❌ Lỗi: {error}</div>;

    return (
        <div className="fault-data-container">
            <h2>Quản lý Dữ liệu Lỗi (Fault Data)</h2>
            <p>Tổng số bản ghi lỗi hiện tại: {faults.length}</p>
            
            {/* Hiển thị bảng chi tiết các lỗi */}
            {faults.length > 0 && (
                <table className="fault-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>VIN</th>
                            <th>Mã Lỗi</th>
                            <th>Phụ tùng</th>
                            <th>Ngày xảy ra</th>
                        </tr>
                    </thead>
                    <tbody>
                        {faults.map(fault => (
                            <tr key={fault.id}>
                                <td>{fault.id}</td>
                                <td>{fault.vin}</td>
                                <td>{fault.faultCode}</td>
                                <td>{fault.partName}</td>
                                <td>{new Date(fault.dateOccurred).toLocaleDateString()}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
};

export default FaultDataPage;