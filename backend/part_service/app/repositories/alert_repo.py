# app/repositories/alert_repo.py
from app.models.alert import Alert
from app.db import SessionLocal

class AlertRepository:
    def __init__(self):
        self.db = SessionLocal()

    def get_all(self):
        return self.db.query(Alert).all()

    def get_by_id(self, alert_id: int):
        return self.db.query(Alert).filter(Alert.id == alert_id).first()

    def create(self, alert_data):
        alert = Alert(**alert_data)
        self.db.add(alert)
        self.db.commit()
        self.db.refresh(alert)
        return alert

    def delete(self, alert_id: int):
        alert = self.get_by_id(alert_id)
        if alert:
            self.db.delete(alert)
            self.db.commit()
            return True
        return False
