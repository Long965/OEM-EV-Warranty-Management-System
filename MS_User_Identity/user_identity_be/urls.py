from django.contrib import admin
from django.urls import path, include
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

urlpatterns = [
    path('admin/', admin.site.urls),
    
    # 1. API ĐĂNG NHẬP (Lấy Access Token & Refresh Token)
    path('api/v1/auth/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    
    # 2. API LÀM MỚI TOKEN (Lấy Access Token mới)
    path('api/v1/auth/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    
    # 3. Tuyến cho logic Accounts/User (sẽ xây dựng sau)
    path('api/v1/accounts/', include('accounts.urls')), 
]