# campaigns/views.py

from rest_framework import viewsets
from .models import RecallCampaign, CampaignVehicle, FaultData, ForecastModel
from .serializers import RecallCampaignSerializer, CampaignVehicleSerializer, FaultDataSerializer, ForecastModelSerializer
from rest_framework.permissions import IsAuthenticated # Sẽ dùng cho xác thực sau

# ViewSet cho Recall Campaign
class RecallCampaignViewSet(viewsets.ModelViewSet):
    # Lấy tất cả các đối tượng Campaign
    queryset = RecallCampaign.objects.all()
    # Sử dụng Serializer đã tạo
    serializer_class = RecallCampaignSerializer
    # permission_classes = [IsAuthenticated] # Bỏ comment sau khi tích hợp User & Auth Service

# ViewSet cho Campaign Vehicle
class CampaignVehicleViewSet(viewsets.ModelViewSet):
    queryset = CampaignVehicle.objects.all()
    serializer_class = CampaignVehicleSerializer

# ViewSet cho Fault Data
class FaultDataViewSet(viewsets.ModelViewSet):
    queryset = FaultData.objects.all()
    serializer_class = FaultDataSerializer

# ViewSet cho Forecast Model
class ForecastModelViewSet(viewsets.ModelViewSet):
    queryset = ForecastModel.objects.all()
    serializer_class = ForecastModelSerializer