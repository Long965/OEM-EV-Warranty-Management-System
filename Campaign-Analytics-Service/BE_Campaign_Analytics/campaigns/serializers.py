# campaigns/serializers.py

from rest_framework import serializers
from .models import RecallCampaign, CampaignVehicle, FaultData, ForecastModel

# 1. Serializer cho Recall Campaign
class RecallCampaignSerializer(serializers.ModelSerializer):
    class Meta:
        model = RecallCampaign
        # Cung cấp tất cả các trường để Frontend có thể xem/thêm/sửa
        fields = '__all__' 

# 2. Serializer cho Campaign Vehicle
class CampaignVehicleSerializer(serializers.ModelSerializer):
    class Meta:
        model = CampaignVehicle
        fields = '__all__'

# 3. Serializer cho Fault Data
class FaultDataSerializer(serializers.ModelSerializer):
    class Meta:
        model = FaultData
        fields = '__all__'

# 4. Serializer cho Forecast Model
class ForecastModelSerializer(serializers.ModelSerializer):
    class Meta:
        model = ForecastModel
        fields = '__all__'