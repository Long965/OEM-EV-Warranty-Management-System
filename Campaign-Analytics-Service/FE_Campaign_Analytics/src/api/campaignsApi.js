import axiosInstance from './axiosConfig'; 

// Create và Update Campaign
export const createOrUpdateCampaign = async (data, isEditing) => {
    
    // 1. Xác định URL và Phương thức (POST cho Create, PUT cho Update)
    const url = isEditing ? `campaigns/${data.id}/` : 'campaigns/'; 
    const method = isEditing ? 'put' : 'post';
    
    // 2. Gửi request bằng axiosInstance (đã có Token)
    const response = await axiosInstance({ method, url, data });
    return response.data;
};


// Đọc dữ liệu
export const getCampaigns = async () => {
    try {
        // GET /api/v1/campaigns/
        const response = await axiosInstance.get('campaigns/'); 
        return response.data;
    } catch (error) {
        // Xử lý lỗi (ví dụ: 401, 404)
        console.error("Lỗi khi fetch campaigns:", error);
        throw error; 
    }
};

export const getFaultData = async () => {
    try {
        // GET /api/v1/fault-data/
        const response = await axiosInstance.get('fault-data/');
        return response.data;
    } catch (error) {
        console.error("Lỗi khi fetch Fault Data:", error);
        throw error;
    }
};

export const getAnalyticsData = async () => {
    try {
        // GET /api/v1/analytics/dashboard/
        const response = await axiosInstance.get('analytics/dashboard/');
        return response.data;
    } catch (error) {
        // Xử lý lỗi 
        throw error;
    }
};


// Xóa dữ liệu
export const deleteCampaign = async (id) => {
    try {
        // DELETE /api/v1/campaigns/{id}/
        await axiosInstance.delete(`campaigns/${id}/`);
        return id; 
    } catch (error) {
        throw error;
    }
};
