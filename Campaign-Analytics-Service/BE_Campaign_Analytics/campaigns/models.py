# MS_Campaign_Analytics/campaigns/models.py

from django.db import models

# Lớp 1: Chi tiết chiến dịch
class RecallCampaign(models.Model):
    campaignName = models.CharField(max_length=200)
    campaignCode = models.CharField(max_length=50, unique=True)
    description = models.TextField()
    startDate = models.DateField()
    endDate = models.DateField(blank=True, null=True)
    isActive = models.BooleanField(default=True)
    # Trường để lưu điều kiện áp dụng (Ví dụ: Model X, sản xuất từ 2023)
    filterCriteria = models.JSONField(default=dict) 

    def __str__(self):
        return self.campaignName

# Lớp 2: Danh sách xe thuộc chiến dịch
class CampaignVehicle(models.Model):
    # Khóa ngoại trỏ đến Campaign (Mối quan hệ N:1)
    campaign = models.ForeignKey(RecallCampaign, on_delete=models.CASCADE, related_name='vehicles_involved')
    # VIN là khóa ngoại (từ Vehicle Management Service), ta chỉ lưu ID
    vin = models.CharField(max_length=17, db_index=True) 
    
    # Trạng thái của xe trong chiến dịch
    status_choices = [
        ('NOTIFIED', 'Đã thông báo'),
        ('SCHEDULED', 'Đã đặt lịch'),
        ('IN_PROGRESS', 'Đang xử lý'),
        ('COMPLETED', 'Đã hoàn thành'),
    ]
    status = models.CharField(max_length=20, choices=status_choices, default='NOTIFIED')
    dateCompleted = models.DateTimeField(blank=True, null=True)

    def __str__(self):
        return f"{self.vin} - Status: {self.status}"

# Lớp 3: Dữ liệu lỗi (Nhận qua RabbitMQ từ Claim Service)
class FaultData(models.Model):
    # Dùng VIN để liên kết với xe
    vin = models.CharField(max_length=17, db_index=True) 
    faultCode = models.CharField(max_length=50)
    partName = models.CharField(max_length=100)
    dateOccurred = models.DateField()
    claimId = models.CharField(max_length=100, unique=True) # Liên kết với Claim Service
    
    def __str__(self):
        return f"Fault {self.faultCode} on {self.dateOccurred}"

# Lớp 4: Mô hình dự báo chi phí (Ví dụ đơn giản cho Regression)
class ForecastModel(models.Model):
    modelName = models.CharField(max_length=100, unique=True)
    # Lưu các hệ số (coefficients) của mô hình dưới dạng JSON
    modelParameters = models.JSONField(default=dict) 
    lastTrainedDate = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.modelName