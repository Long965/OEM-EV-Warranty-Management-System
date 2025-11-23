from rest_framework import serializers
from .models import Customer, Vehicle, VehiclePart, ServiceHistory

# ===============================================
# 1. Serializer cho Phụ tùng và Lịch sử (Nested)
# ===============================================

class VehiclePartSerializer(serializers.ModelSerializer):
    class Meta:
        model = VehiclePart
        fields = '__all__' # Bao gồm tất cả các trường
        read_only_fields = ['part_serial_number'] # Serial là Primary Key, không cho chỉnh sửa

class ServiceHistorySerializer(serializers.ModelSerializer):
    class Meta:
        model = ServiceHistory
        fields = '__all__'
        read_only_fields = ['history_id']

# ===============================================
# 2. Serializer cho Xe (Có thể Nested các phụ tùng)
# ===============================================

class VehicleSerializer(serializers.ModelSerializer):
    # Sử dụng Serializer ở trên để nhúng thông tin các phụ tùng vào khi gọi API của xe
    installed_parts = VehiclePartSerializer(many=True, read_only=True)
    service_records = ServiceHistorySerializer(many=True, read_only=True)
    
    # Chỉ hiển thị tên khách hàng thay vì customer_id (để dễ đọc)
    customer_name = serializers.CharField(source='customer.full_name', read_only=True)
    
    class Meta:
        model = Vehicle
        # Sử dụng các trường đã định nghĩa trong Models
        fields = [
            'vin', 
            'model_code', 
            'manufacturing_date', 
            'registration_date', 
            'customer', # ID của khách hàng
            'customer_name', # Tên khách hàng (chỉ đọc)
            'is_active', 
            'installed_parts', 
            'service_records'
        ]
        read_only_fields = [] # VIN là Primary Key, không cho chỉnh sửa

# ===============================================
# 3. Serializer cho Khách hàng
# ===============================================

class CustomerSerializer(serializers.ModelSerializer):
    # Nhúng danh sách các xe mà khách hàng này sở hữu
    vehicles = VehicleSerializer(many=True, read_only=True)
    
    class Meta:
        model = Customer
        fields = [
            'customer_id', 
            'full_name', 
            'phone_number', 
            'email', 
            'address', 
            'created_at', 
            'vehicles'
        ]
        read_only_fields = ['customer_id', 'created_at']