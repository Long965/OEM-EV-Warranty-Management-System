from rest_framework.routers import DefaultRouter
from .views import (
    CustomerViewSet, 
    VehicleViewSet, 
    VehiclePartViewSet, 
    ServiceHistoryViewSet
)

# Sử dụng DefaultRouter của DRF để tự động tạo ra các URL CRUD
router = DefaultRouter()

# Đăng ký các ViewSet với đường dẫn API
router.register(r'customers', CustomerViewSet)
router.register(r'vehicles', VehicleViewSet)
router.register(r'parts', VehiclePartViewSet)
router.register(r'service-history', ServiceHistoryViewSet)

# Xuất router.urls để nhúng vào Project chính
urlpatterns = router.urls