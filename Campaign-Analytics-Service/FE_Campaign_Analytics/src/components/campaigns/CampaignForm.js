import React, { useState, useEffect } from 'react';
import { createOrUpdateCampaign } from '../../api/campaignsApi'; 
import './CampaignForm.css';

// Hàm tiện ích định dạng ngày (Date) sang YYYY-MM-DD cho input
const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

// Component chính nhận initialData (dữ liệu sửa) và onFormSuccess
const CampaignForm = ({ initialData, onFormSuccess, onCancel }) => {
    
    // Xác định chế độ: True nếu có dữ liệu ban đầu
    const isEditing = initialData !== null && initialData !== undefined; 
    
    const [formData, setFormData] = useState({
        campaignName: '',
        campaignCode: '',
        startDate: '',
        description: '',
        isActive: true,
        id: null
    });
    
    const [status, setStatus] = useState('');
    const [loading, setLoading] = useState(false);

    // --- HIỆU ỨNG: Tải dữ liệu ban đầu nếu là chế độ SỬA ---
    useEffect(() => {
        if (initialData) {
            setFormData({
                campaignName: initialData.campaignName || '',
                campaignCode: initialData.campaignCode || '',
                startDate: formatDate(initialData.startDate), // Định dạng ngày
                description: initialData.description || '',
                isActive: initialData.isActive,
                id: initialData.id
            });
        } else {
             // Reset form về mặc định nếu chuyển sang Tạo mới
             setFormData({
                campaignName: '', campaignCode: '', startDate: '', description: '', isActive: true, id: null
            });
        }
    }, [initialData]);


    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatus('Đang gửi...');
        setLoading(true);
        
        try {
            // Lọc ra ID nếu đang ở chế độ tạo mới (vì API POST không nhận ID)
            const dataToSubmit = isEditing ? formData : { ...formData, id: undefined }; 
            
            // Gọi hàm API tổng hợp
            const result = await createOrUpdateCampaign(dataToSubmit, isEditing);
            
            setStatus(`✅ ${isEditing ? 'Sửa' : 'Tạo'} chiến dịch thành công!`);
            
            // Gọi hàm callback để Component cha (CampaignsPage) cập nhật danh sách
            if (onFormSuccess) onFormSuccess(result);
            
        } catch (error) {
            console.error('Lỗi form:', error.response ? error.response.data : error.message);
            
            // Xử lý lỗi cụ thể (ví dụ: Mã Code bị trùng - Lỗi 400 từ Django)
            const errorMessage = error.response?.data?.campaignCode ? 
                                `Mã Code: ${error.response.data.campaignCode}` : 
                                error.response?.data?.detail || 'Lỗi không xác định. Vui lòng kiểm tra Server Logs.';
                                
            setStatus(`❌ Lỗi: ${errorMessage}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="campaign-form-container">
            <h3>{isEditing ? 'Sửa Chiến dịch' : 'Tạo mới Chiến dịch'}</h3> 
            <form onSubmit={handleSubmit} className="campaign-form">
                
                {/* Tên chiến dịch */}
                <label>Tên chiến dịch:</label>
                <input type="text" name="campaignName" value={formData.campaignName} onChange={handleChange} required disabled={loading} />

                {/* Mã Code */}
                <label>Mã Code:</label>
                <input 
                    type="text" 
                    name="campaignCode" 
                    value={formData.campaignCode} 
                    onChange={handleChange} 
                    required 
                    // Tắt input Mã Code nếu đang sửa để tránh lỗi khóa duy nhất
                    disabled={isEditing || loading} 
                />

                {/* Ngày bắt đầu */}
                <label>Ngày bắt đầu:</label>
                <input type="date" name="startDate" value={formData.startDate} onChange={handleChange} required disabled={loading} />
                
                {/* Mô tả */}
                <label>Mô tả:</label>
                <textarea name="description" value={formData.description} onChange={handleChange} disabled={loading} />

                {/* Trạng thái */}
                <label className="checkbox-label">
                    <input type="checkbox" name="isActive" checked={formData.isActive} onChange={handleChange} disabled={loading} />
                    Đang hoạt động
                </label>

                {/* Nút gửi */}
                <div className="form-actions">
                    <button type="submit" className="primary-button" disabled={loading}>
                        {loading ? 'Đang xử lý...' : (isEditing ? 'Lưu Thay đổi' : 'Tạo Chiến dịch')}
                    </button>
                    <button type="button" onClick={onCancel} className="secondary-button" disabled={loading}>Hủy</button>
                </div>

                {status && <p className="form-status">{status}</p>}
            </form>
        </div>
    );
};

export default CampaignForm;