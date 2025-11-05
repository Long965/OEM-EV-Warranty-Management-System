# app/models/__init__.py
# import models so Alembic / create_all sees them
from .part import Part
from .supplier import Supplier
from .service_center import ServiceCenter
from .inventory import Inventory
from .request import RequestModel
from .distribution import Distribution
from .assignment import Assignment
from .vehicle import Vehicle
