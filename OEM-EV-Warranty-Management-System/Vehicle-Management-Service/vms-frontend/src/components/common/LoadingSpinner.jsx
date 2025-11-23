import React from 'react';

const LoadingSpinner = () => {
  return (
    <div className="flex justify-center items-center h-40">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      <p className="ml-4 text-blue-500 font-medium">Đang tải dữ liệu...</p>
    </div>
  );
};

export default LoadingSpinner;