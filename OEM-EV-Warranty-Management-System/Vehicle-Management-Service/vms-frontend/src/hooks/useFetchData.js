import { useState, useEffect } from 'react';
import { api } from '@/api/vmsApi'; // SỬ DỤNG ALIAS @/

/**
 * Custom Hook để fetch dữ liệu từ một endpoint API.
 * @param {string} endpoint - Ví dụ: '/vehicles/'
 * @param {Array} initialData - Dữ liệu ban đầu (thường là [])
 * @returns {object} { data, loading, error, refetch }
 */
const useFetchData = (endpoint, initialData = []) => {
  const [data, setData] = useState(initialData);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshIndex, setRefreshIndex] = useState(0); // Dùng để trigger refetch

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await api.get(endpoint);
        // Xử lý cả hai loại phản hồi: data.results (DRF Pagination) hoặc data (List)
        setData(response.data.results || response.data); 
      } catch (err) {
        console.error(`Error fetching data from ${endpoint}:`, err);
        setError(`Không thể tải dữ liệu từ ${endpoint}. Vui lòng kiểm tra Backend.`);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [endpoint, refreshIndex]);

  const refetch = () => setRefreshIndex(prev => prev + 1);

  return { data, loading, error, refetch, setData };
};

export default useFetchData;