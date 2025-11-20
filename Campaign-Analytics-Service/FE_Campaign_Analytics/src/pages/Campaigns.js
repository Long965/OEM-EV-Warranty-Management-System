import React, { useEffect, useState } from 'react';
import { getCampaigns, deleteCampaign } from '../api/campaignsApi'; 
import CampaignForm from '../components/campaigns/CampaignForm'; 
import './Campaigns.css'; 

const CampaignsPage = () => {
    const [campaigns, setCampaigns] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    // Trạng thái hiển thị Form (Tạo mới hoặc Sửa)
    const [isFormVisible, setIsFormVisible] = useState(false);
    
    // Trạng thái lưu dữ liệu Campaign đang được sửa (null nếu là Tạo mới)
    const [editingCampaign, setEditingCampaign] = useState(null);

    // Hàm tải dữ liệu Campaigns
    const fetchCampaigns = async () => {
        try {
            const data = await getCampaigns();
            setCampaigns(data);
            setError(null);
        } catch (err) {
            console.error('Lỗi khi tải dữ liệu Campaign:', err);
            setError('Không thể tải dữ liệu Campaign. Vui lòng kiểm tra Docker Container MS 5.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCampaigns();
    }, []);

    // --- XỬ LÝ SỬA (UPDATE) ---
    const handleEdit = (campaign) => {
        setEditingCampaign(campaign); 
        setIsFormVisible(true);      
    };

    // --- XỬ LÝ XÓA (DELETE) ---
    const handleDelete = async (id) => {
        if (window.confirm('Bạn có chắc chắn muốn xóa chiến dịch này không? Thao tác không thể hoàn tác!')) {
            try {
                await deleteCampaign(id);
                // Cập nhật lại state: loại bỏ dòng đã xóa
                setCampaigns(prev => prev.filter(campaign => campaign.id !== id));
                alert('Đã xóa thành công!');
            } catch (err) {
                alert(`Lỗi khi xóa Campaign ID ${id}: ${err.message}. Vui lòng kiểm tra Server Logs.`);
            }
        }
    };

    // --- XỬ LÝ TẠO/SỬA THÀNH CÔNG ---
    const handleFormSuccess = (updatedCampaign) => {
        // Nếu đang sửa, thay thế Campaign cũ bằng Campaign mới
        if (editingCampaign) {
            setCampaigns(prev => prev.map(c => 
                c.id === updatedCampaign.id ? updatedCampaign : c
            ));
        } else {
            // Nếu là tạo mới, thêm Campaign vào cuối danh sách
            setCampaigns(prev => [...prev, updatedCampaign]);
        }
        
        // Đóng form và reset trạng thái
        setIsFormVisible(false);
        setEditingCampaign(null);
    }
    
    // --- XỬ LÝ HỦY FORM ---
    const handleCancel = () => {
        setIsFormVisible(false);
        setEditingCampaign(null);
    }

    if (loading) {
        return <div className="loading-state">Đang tải danh sách chiến dịch...</div>;
    }

    if (error) {
        return <div className="error-message">❌ Lỗi: {error}</div>;
    }

    return (
        <div className="campaigns-container">
            <h2>Chiến dịch Thu hồi & Dịch vụ</h2>
            
            {/* Thanh hành động */}
            <div className="action-bar">
                <button className="primary-button" onClick={() => { setEditingCampaign(null); setIsFormVisible(true); }}>
                    + Tạo Campaign Mới
                </button>
            </div>

            {/* Form Tạo/Sửa (Modal/Popup) */}
            {isFormVisible && (
                <CampaignForm 
                    // Truyền dữ liệu Campaign (null nếu là tạo mới)
                    initialData={editingCampaign} 
                    onFormSuccess={handleFormSuccess}
                    onCancel={handleCancel} 
                />
            )}
            
            {/* Bảng Hiển thị Dữ liệu Campaign */}
            <table className="campaigns-table">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Tên Chiến dịch</th>
                        <th>Mã Code</th>
                        <th>Ngày Bắt đầu</th>
                        <th>Trạng thái</th>
                        <th>Hành động</th>
                    </tr>
                </thead>
                <tbody>
                    {campaigns.length === 0 ? (
                        <tr><td colSpan="6" className="no-data">Chưa có Campaign nào trong Database.</td></tr>
                    ) : (
                        campaigns.map((campaign) => (
                            <tr key={campaign.id}>
                                <td>{campaign.id}</td>
                                <td>{campaign.campaignName}</td>
                                <td>{campaign.campaignCode}</td>
                                <td>{new Date(campaign.startDate).toLocaleDateString()}</td>
                                <td>{campaign.isActive ? 'Đang hoạt động' : 'Đã kết thúc'}</td>
                                <td className="action-cell">
                                    <button className="detail-button">Chi tiết</button>
                                    <span style={{margin: '0 5px'}}></span> 
                                    {/* Nút SỬA */}
                                    <button 
                                        className="edit-button" 
                                        onClick={() => handleEdit(campaign)} 
                                    >
                                        Sửa
                                    </button>
                                    <span style={{margin: '0 5px'}}></span> 
                                    {/* Nút XÓA */}
                                    <button 
                                        className="delete-button" 
                                        onClick={() => handleDelete(campaign.id)} 
                                    >
                                        Xóa
                                    </button>
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    );
};

export default CampaignsPage;