from .parts_router import router as parts_router
from .inventory_router import router as inventory_router
from .suppliers_router import router as suppliers_router
from .assignments_router import router as assignments_router

__all__ = ["parts_router", "inventory_router", "suppliers_router", "assignments_router"]