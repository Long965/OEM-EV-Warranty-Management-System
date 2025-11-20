import React, { useEffect, useState } from 'react';
import { getAnalyticsData } from '../api/campaignsApi';
import './ReportsPage.css'; 

const ReportsPage = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const result = await getAnalyticsData();
                setData(result);
                setError(null);
            } catch (err) {
                setError('Không thể tải dữ liệu báo cáo. Kiểm tra kết nối API.');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) return <div className="loading-state">Đang tải báo cáo...</div>;
    if (error) return <div className="error-message">❌ Lỗi: {error}</div>;

    // Định dạng tiền tệ
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
    };

    return (
        <div className="reports-container">
            <h2>📊 Dashboard Phân tích Bảo hành</h2>
            
            <div className="summary-cards">
                <div className="card">
                    <h3>Tổng số lỗi (Năm nay)</h3>
                    <p className="big-number">{data.totalFaults}</p>
                    <p>Đơn vị: lần</p>
                </div>
                <div className="card cost-card">
                    <h3>Tổng chi phí Bảo hành YTD</h3>
                    <p className="big-number">{formatCurrency(data.totalCostYTD)}</p>
                </div>
                <div className="card forecast-card">
                    <h3>Dự báo Chi phí Tháng tới</h3>
                    <p className="big-number">{formatCurrency(data.forecastNextMonth)}</p>
                </div>
            </div>

            <div className="chart-area">
                <h3>Phụ tùng lỗi nhiều nhất (Top 5)</h3>
                <ul className="top-faults-list">
                    {data.topFaultyParts.map((item, index) => (
                        <li key={index} className="fault-item">
                            <span>{item.partName}</span>
                            <span>{item.count} lần</span>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default ReportsPage;