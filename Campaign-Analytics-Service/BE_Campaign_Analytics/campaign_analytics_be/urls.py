# campaign_analytics_be/urls.py

from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    # Endpoint chính cho API của MS 5
    path('api/v1/', include('campaigns.urls')), 
]