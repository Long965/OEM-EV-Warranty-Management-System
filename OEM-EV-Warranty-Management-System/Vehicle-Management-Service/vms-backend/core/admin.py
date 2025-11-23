# File: core/admin.py
from django.contrib import admin
from .models import Customer, Vehicle, VehiclePart, ServiceHistory

admin.site.register(Customer)
admin.site.register(Vehicle)
admin.site.register(VehiclePart)
admin.site.register(ServiceHistory)