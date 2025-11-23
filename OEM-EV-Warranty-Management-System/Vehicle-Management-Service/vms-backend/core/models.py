from django.db import models

# Sử dụng thư viện uuid để tạo ID duy nhất cho các đối tượng (thực hành tốt trong Microservices)
import uuid 

# ===============================================
# 1. Class: Customer (Khách hàng)
# ===============================================
class Customer(models.Model):
    # ID duy nhất cho mỗi khách hàng
    customer_id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    
    full_name = models.CharField(max_length=150, verbose_name="Họ và Tên")
    phone_number = models.CharField(max_length=15, unique=True, verbose_name="Số điện thoại")
    email = models.EmailField(max_length=100, blank=True, null=True)
    address = models.TextField(blank=True, null=True, verbose_name="Địa chỉ liên hệ")
    
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "Khách hàng"
        verbose_name_plural = "Khách hàng"
        # Index cho các trường thường xuyên tìm kiếm
        indexes = [
            models.Index(fields=['phone_number']),
            models.Index(fields=['full_name']),
        ]

    def __str__(self):
        return self.full_name


# ===============================================
# 2. Class: Vehicle (Xe)
# ===============================================
class Vehicle(models.Model):
    # VIN là Primary Key và là định danh duy nhất của xe
    vin = models.CharField(primary_key=True, max_length=17, unique=True, verbose_name="VIN (Số khung)")
    
    model_code = models.CharField(max_length=50, verbose_name="Mã Model Xe")
    manufacturing_date = models.DateField(verbose_name="Ngày Sản xuất")
    registration_date = models.DateField(blank=True, null=True, verbose_name="Ngày Đăng ký lần đầu")
    
    # Mối quan hệ 1-n: 1 Khách hàng có thể sở hữu nhiều Xe
    # on_delete=models.RESTRICT: Không cho phép xóa Khách hàng nếu họ đang sở hữu Xe
    customer = models.ForeignKey(Customer, on_delete=models.RESTRICT, related_name='vehicles', verbose_name="Chủ sở hữu")
    
    is_active = models.BooleanField(default=True, verbose_name="Đang hoạt động")
    
    class Meta:
        verbose_name = "Xe"
        verbose_name_plural = "Xe"

    def __str__(self):
        return f"{self.vin} ({self.model_code})"


# ===============================================
# 3. Class: VehiclePart (Phụ tùng gắn trên Xe)
# ===============================================
class VehiclePart(models.Model):
    # Số Serial duy nhất cho từng phụ tùng (Pin, Motor, v.v.)
    part_serial_number = models.CharField(primary_key=True, max_length=100, verbose_name="Serial Phụ tùng")
    
    # Tên hoặc mã loại phụ tùng (Ví dụ: 'EV_BATTERY_01', 'DRIVE_MOTOR_V2')
    part_code = models.CharField(max_length=50, verbose_name="Mã loại Phụ tùng")
    
    # Mối quan hệ n-1: Nhiều Phụ tùng gắn trên 1 Xe
    vehicle = models.ForeignKey(Vehicle, on_delete=models.CASCADE, related_name='installed_parts', verbose_name="Xe gắn phụ tùng")
    
    install_date = models.DateTimeField(verbose_name="Ngày lắp đặt lên xe")
    is_warranty_eligible = models.BooleanField(default=True, verbose_name="Đủ điều kiện bảo hành")
    
    # Trường để lưu lại serial của phụ tùng cũ nếu đây là phụ tùng thay thế
    replaced_old_serial = models.CharField(max_length=100, blank=True, null=True, verbose_name="Serial cũ bị thay thế")
    
    class Meta:
        verbose_name = "Phụ tùng Xe"
        verbose_name_plural = "Phụ tùng Xe"
        # Đảm bảo một xe không gắn 2 phụ tùng cùng một serial
        constraints = [
            models.UniqueConstraint(fields=['part_serial_number'], name='unique_part_serial')
        ]
        
    def __str__(self):
        return f"{self.part_code} - {self.part_serial_number} on {self.vehicle.vin}"


# ===============================================
# 4. Class: ServiceHistory (Lịch sử Dịch vụ)
# ===============================================
class ServiceHistory(models.Model):
    history_id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    
    # Mối quan hệ n-1: Nhiều lần dịch vụ cho 1 Xe
    vehicle = models.ForeignKey(Vehicle, on_delete=models.CASCADE, related_name='service_records', verbose_name="Xe được dịch vụ")
    
    service_date = models.DateTimeField(verbose_name="Ngày thực hiện dịch vụ")
    mileage_km = models.IntegerField(verbose_name="Số kilomet lúc dịch vụ")
    
    service_type = models.CharField(max_length=50, choices=[
        ('MAINTENANCE', 'Bảo dưỡng định kỳ'),
        ('WARRANTY_CLAIM', 'Sửa chữa Bảo hành'),
        ('RECALL', 'Chiến dịch triệu hồi'),
        ('REPAIR', 'Sửa chữa thông thường'),
    ], default='MAINTENANCE', verbose_name="Loại dịch vụ")
    
    description = models.TextField(verbose_name="Mô tả công việc")
    
    # Kết nối với Service Claim (Sẽ được dùng khi kết nối Microservices)
    # claim_id = models.CharField(max_length=100, blank=True, null=True)
    
    class Meta:
        verbose_name = "Lịch sử dịch vụ"
        verbose_name_plural = "Lịch sử dịch vụ"
        ordering = ['-service_date'] # Sắp xếp theo ngày gần nhất

    def __str__(self):
        return f"{self.vehicle.vin} - {self.service_date.strftime('%Y-%m-%d')} ({self.service_type})"