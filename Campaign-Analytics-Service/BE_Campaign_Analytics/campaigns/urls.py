# campaigns/urls.py

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    RecallCampaignViewSet, 
    CampaignVehicleViewSet, 
    FaultDataViewSet, 
    ForecastModelViewSet
)

# Router tự động tạo các đường dẫn CRUD cho ViewSet
router = DefaultRouter()
router.register(r'campaigns', RecallCampaignViewSet)
router.register(r'campaign-vehicles', CampaignVehicleViewSet)
router.register(r'fault-data', FaultDataViewSet)
router.register(r'forecast-models', ForecastModelViewSet)

urlpatterns = [
    path('', include(router.urls)),
]