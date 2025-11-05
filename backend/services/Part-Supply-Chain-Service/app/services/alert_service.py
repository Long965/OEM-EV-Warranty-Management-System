# app/services/alert_service.py
from sqlalchemy.orm import Session
from app.models.inventory import Inventory
from typing import Any

class AlertService:
    """
    Lightweight AlertService — lazy-load repository to avoid circular imports
    (routers -> services -> repositories -> db -> routers).
    """

    def __init__(self) -> None:
        self._repo = None

    def _repo_instance(self):
        if self._repo is None:
            # lazy import to prevent circular import at module import time
            from app.repositories.alert_repo import AlertRepository
            self._repo = AlertRepository()
        return self._repo

    def list_alerts(self):
        return self._repo_instance().get_all()

    def get(self, alert_id: int):
        return self._repo_instance().get_by_id(alert_id)

    def create(self, alert_data: dict) -> Any:
        return self._repo_instance().create(alert_data)

    def delete(self, alert_id: int) -> bool:
        return self._repo_instance().delete(alert_id)

# explicit export
__all__ = ["AlertService"]
