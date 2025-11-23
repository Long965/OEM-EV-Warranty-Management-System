from rest_framework import viewsets
from .models import Customer, Vehicle, VehiclePart, ServiceHistory
from .serializers import (
    CustomerSerializer, 
    VehicleSerializer, 
    VehiclePartSerializer, 
    ServiceHistorySerializer
)

# ViewSet cho Khách hàng
class CustomerViewSet(viewsets.ModelViewSet):
    # Truy vấn tất cả khách hàng
    queryset = Customer.objects.all()
    # Sử dụng CustomerSerializer
    serializer_class = CustomerSerializer
    # Cho phép tìm kiếm theo tên và số điện thoại
    search_fields = ['full_name', 'phone_number']

# ViewSet cho Xe
class VehicleViewSet(viewsets.ModelViewSet):
    # Truy vấn tất cả xe
    queryset = Vehicle.objects.all()
    # Sử dụng VehicleSerializer
    serializer_class = VehicleSerializer
    # Cho phép tìm kiếm theo VIN và mã Model
    search_fields = ['vin', 'model_code']

# ViewSet cho Phụ tùng
class VehiclePartViewSet(viewsets.ModelViewSet):
    # Truy vấn tất cả phụ tùng
    queryset = VehiclePart.objects.all()
    # Sử dụng VehiclePartSerializer
    serializer_class = VehiclePartSerializer
    # Cho phép tìm kiếm theo Serial và Mã phụ tùng
    search_fields = ['part_serial_number', 'part_code']

# ViewSet cho Lịch sử Dịch vụ
class ServiceHistoryViewSet(viewsets.ModelViewSet):
    # Truy vấn tất cả lịch sử dịch vụ, sắp xếp theo ngày gần nhất
    queryset = ServiceHistory.objects.all().order_by('-service_date')
    # Sử dụng ServiceHistorySerializer
    serializer_class = ServiceHistorySerializer
    # Cho phép tìm kiếm theo VIN của xe liên quan
    search_fields = ['vehicle__vin', 'service_type']