# campaignsApi/urls.py

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    RecallCampaignViewSet, 
    CampaignVehicleViewSet,
    FaultDataViewSet,
    ForecastModelViewSet,
    analytics_dashboard
)

# 1. KHỐI ROUTER
router = DefaultRouter()
router.register(r'campaigns', RecallCampaignViewSet)
router.register(r'campaign-vehicles', CampaignVehicleViewSet)
router.register(r'fault-data', FaultDataViewSet)
router.register(r'forecast-models', ForecastModelViewSet)

# 2. KHỐI URLPATTERNS
urlpatterns = [
    # ĐĂNG KÝ ANALYTICS
    path('analytics/dashboard/', analytics_dashboard, name='analytics-dashboard'),
    # Bao gồm các URL do Router tạo (sẽ tạo ra /campaigns/, /fault-data/, v.v.)
    path('', include(router.urls)),  
]