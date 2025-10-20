# crud.py
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime
from . import models, schemas
from fastapi import HTTPException
import smtplib
from email.mime.text import MIMEText

class PartService:
    def __init__(self, db: Session): self.db = db
    
    def create_part(self, part: schemas.SparePartCreate) -> models.SparePart:
        db_part = models.SparePart(**part.dict())
        self.db.add(db_part)
        self.db.commit()
        self.db.refresh(db_part)
        # Auto tạo inventory
        InventoryService(self.db).create_inventory(db_part.id)
        return db_part

class VehiclePartService:  # **GẮN SERI VIN**
    def __init__(self, db: Session): self.db = db
    
    def link_part_to_vin(self, link: schemas.VinLink) -> models.VehiclePart:
        # Validate part exists
        part = self.db.query(models.SparePart).filter(
            models.SparePart.id == link.part_id
        ).first()
        if not part: raise HTTPException(404, "Part not found")
        
        # Check serial unique
        if self.db.query(models.VehiclePart).filter(
            models.VehiclePart.serial_number == link.serial_number
        ).first():
            raise HTTPException(400, "Serial already used")
        
        db_link = models.VehiclePart(
            vehicle_vin=link.vehicle_vin,
            part_id=link.part_id,
            serial_number=link.serial_number
        )
        self.db.add(db_link)
        self.db.commit()
        return db_link

class InventoryService:  # **TỒN KHO**
    def __init__(self, db: Session): self.db = db
    
    def create_inventory(self, part_id: int):
        """Auto tạo khi tạo part"""
        inv = models.Inventory(part_id=part_id, warehouse_id=1)
        self.db.add(inv)
        self.db.commit()
    
    def receive_stock(self, tx: schemas.InventoryTransaction):
        inv = self.db.query(models.Inventory).filter(
            models.Inventory.part_id == tx.part_id,
            models.Inventory.warehouse_id == tx.warehouse_id
        ).first()
        if not inv: raise HTTPException(404, "Inventory not found")
        
        if tx.type == "receive":
            inv.quantity += tx.quantity
        elif tx.type == "issue" and inv.quantity >= tx.quantity:
            inv.quantity -= tx.quantity
            inv.reserved += tx.quantity
        else:
            raise HTTPException(400, "Insufficient stock")
        
        inv.last_updated = datetime.utcnow()
        self.db.commit()
        
        # Trigger alert if low
        if inv.quantity <= inv.min_stock:
            AlertService(self.db).create_alert(inv)
        return inv
    
    def get_inventory_report(self) -> List:
        return self.db.query(models.Inventory).all()

class DistributionService:  # **PHÂN BỔ**
    def __init__(self, db: Session): self.db = db
    
    def create_distribution(self, dist: schemas.DistributionCreate):
        # Check stock
        inv = self.db.query(models.Inventory).filter(
            models.Inventory.part_id == dist.part_id,
            models.Inventory.warehouse_id == 1
        ).first()
        if inv.quantity < dist.quantity:
            raise HTTPException(400, "Insufficient stock")
        
        db_dist = models.Distribution(**dist.dict(), from_warehouse=1)
        self.db.add(db_dist)
        # Reserve stock
        inv.reserved += dist.quantity
        self.db.commit()
        return db_dist
    
    def confirm_delivery(self, dist_id: int):
        dist = self.db.query(models.Distribution).filter(
            models.Distribution.id == dist_id
        ).first()
        if not dist: raise HTTPException(404)
        
        dist.status = "delivered"
        # Update inventory to_warehouse
        target_inv = self.db.query(models.Inventory).filter(
            models.Inventory.part_id == dist.part_id,
            models.Inventory.warehouse_id == dist.to_warehouse
        ).first()
        if not target_inv:
            target_inv = models.Inventory(
                part_id=dist.part_id, warehouse_id=dist.to_warehouse
            )
            self.db.add(target_inv)
        
        target_inv.quantity += dist.quantity
        # Release reserve from central
        central_inv = self.db.query(models.Inventory).filter(
            models.Inventory.part_id == dist.part_id,
            models.Inventory.warehouse_id == 1
        ).first()
        central_inv.reserved -= dist.quantity
        central_inv.quantity -= dist.quantity
        
        self.db.commit()
        return dist

class AlertService:  # **CẢNH BÁO**
    def __init__(self, db: Session): self.db = db
    
    def create_alert(self, inventory: models.Inventory):
        alert = models.Alert(
            inventory_id=inventory.id,
            part_id=inventory.part_id,
            current_stock=inventory.quantity,
            min_stock=inventory.min_stock,
            alert_type="low_stock" if inventory.quantity > 0 else "out_of_stock"
        )
        self.db.add(alert)
        self.db.commit()
        self.send_email_alert(alert)
        return alert
    
    def send_email_alert(self, alert: models.Alert):
        """Background task"""
        msg = MIMEText(f"ALERT: Part {alert.part_id} - Stock: {alert.current_stock}/{alert.min_stock}")
        msg['Subject'] = '⚠️ THIẾU HÀNG'
        msg['From'] = 'alert@oem.com'
        msg['To'] = 'manager@oem.com'
        # SMTP code here