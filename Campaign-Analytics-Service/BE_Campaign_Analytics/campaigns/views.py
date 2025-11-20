from rest_framework import viewsets
from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.db import models
from django.db.models import Count
from rest_framework.permissions import IsAuthenticated

# --- IMPORT THƯ VIỆN AI ---
import pandas as pd
from sklearn.linear_model import LinearRegression
from datetime import date
# -------------------------

from .models import RecallCampaign, CampaignVehicle, FaultData, ForecastModel
from .serializers import RecallCampaignSerializer, CampaignVehicleSerializer, FaultDataSerializer, ForecastModelSerializer

# Hàm tính toán dự báo chi phí
def calculate_forecast(fault_data):
    """
    Huấn luyện mô hình Hồi quy Tuyến tính đơn giản
    để dự báo chi phí bảo hành tháng tiếp theo.
    """
    # 1. Kiểm tra dữ liệu trống
    if fault_data.empty:
        return 0 # Không dự báo được nếu không có dữ liệu
    
    # 2. Chuẩn bị dữ liệu (Feature Engineering)
    # Giả định chi phí: mỗi lỗi tốn 5,000,000 VNĐ
    fault_data['dateOccurred'] = pd.to_datetime(fault_data['dateOccurred'])
    
    # Tính toán chỉ số tháng (month_index)
    min_date = fault_data['dateOccurred'].min()
    fault_data['month_index'] = (fault_data['dateOccurred'].dt.to_period('M') - min_date.to_period('M')).apply(lambda x: x.n)
    
    # Gán chi phí ước tính
    fault_data['cost'] = 5000000 
    
    # Tổng chi phí theo tháng
    monthly_data = fault_data.groupby('month_index')['cost'].sum().reset_index()
    
    # 3. Huấn luyện Mô hình Hồi quy
    if len(monthly_data) < 2:
        # Tăng 10% nếu có quá ít điểm dữ liệu
        return monthly_data['cost'].sum() * 1.1 

    X = monthly_data[['month_index']]
    y = monthly_data['cost']
    
    model = LinearRegression()
    model.fit(X, y)
    
    # 4. Dự báo cho tháng tiếp theo
    last_month_index = monthly_data['month_index'].max()
    next_month_index = last_month_index + 1
    
    forecast_cost = model.predict([[next_month_index]])[0]
    
    # Đảm bảo chi phí không âm
    return max(0, int(forecast_cost))

@api_view(['GET'])
def analytics_dashboard(request):
    """
    Trả về các số liệu thống kê chính cho dashboard Analytics
    """
    try:
        # Lấy dữ liệu FaultData từ DB
        fault_records = FaultData.objects.all().values('id', 'dateOccurred', 'partName')
        
        # Chuyển đổi QuerySet thành Pandas DataFrame
        fault_df = pd.DataFrame.from_records(fault_records)

        # 1. Tính toán Thống kê CƠ BẢN
        total_faults = fault_df.shape[0] # Số lượng lỗi
        
        # 2. Thống kê Top 5 lỗi
        faults_by_part = (FaultData.objects
                          .values('partName')
                          .annotate(count=Count('partName'))
                          .order_by('-count'))[:5]
        
        # 3. Tính toán Dự báo Chi phí (AI Model)
        forecast_next_month = calculate_forecast(fault_df)
        
        # Dữ liệu mô phỏng còn lại (Giữ nguyên)
        total_cost_ytd = total_faults * 5000000 # Tổng chi phí YTD dựa trên lỗi thực tế

        return Response({
            'totalFaults': total_faults,
            'topFaultyParts': list(faults_by_part),
            'totalCostYTD': total_cost_ytd,
            'forecastNextMonth': forecast_next_month # <-- KẾT QUẢ DỰ BÁO TỪ AI
        })
    except Exception as e:
        return Response({'error': str(e), 'trace': 'Lỗi AI Model hoặc Data'}, status=500)

# ViewSet cho Recall Campaign (Giữ nguyên)
class RecallCampaignViewSet(viewsets.ModelViewSet):
    # Lấy tất cả các đối tượng Campaign
    queryset = RecallCampaign.objects.all()
    # Sử dụng Serializer đã tạo
    serializer_class = RecallCampaignSerializer
    permission_classes = [IsAuthenticated] 

# ViewSet cho Campaign Vehicle (Giữ nguyên)
class CampaignVehicleViewSet(viewsets.ModelViewSet):
    queryset = CampaignVehicle.objects.all()
    serializer_class = CampaignVehicleSerializer
    permission_classes = [IsAuthenticated] 

# ViewSet cho Fault Data (Giữ nguyên)
class FaultDataViewSet(viewsets.ModelViewSet):
    queryset = FaultData.objects.all()
    serializer_class = FaultDataSerializer
    permission_classes = [IsAuthenticated] 

# ViewSet cho Forecast Model (Giữ nguyên)
class ForecastModelViewSet(viewsets.ModelViewSet):
    queryset = ForecastModel.objects.all()
    serializer_class = ForecastModelSerializer
    permission_classes = [IsAuthenticated]