# main.py
from fastapi import FastAPI, Depends
from sqlalchemy.orm import Session
from typing import List
from .db import get_db, Base, engine
from .crud import *
from .schemas import *

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Part & Supply Chain SUPER Service", version="1.0")

def get_services(db: Session = Depends(get_db)):
    return {
        "part": PartService(db),
        "vin": VehiclePartService(db),
        "inv": InventoryService(db),
        "dist": DistributionService(db),
        "alert": AlertService(db)
    }

# === 1. QUẢN LÝ PHỤ TÙNG ===
@app.post("/parts/", response_model=dict)
def create_part(part: SparePartCreate, services=Depends(get_services)):
    return {"part": services["part"].create_part(part)}

@app.get("/parts/{part_id}/full", response_model=PartWithInventory)
def get_part_full(part_id: int, services=Depends(get_services)):
    part = services["part"].db.query(models.SparePart).filter(
        models.SparePart.id == part_id
    ).first()
    return {
        "part": part,
        "inventory": services["inv"].get_inventory_report(),
        "vehicle_parts": services["vin"].db.query(models.VehiclePart).filter(
            models.VehiclePart.part_id == part_id
        ).all(),
        "distributions": services["dist"].db.query(models.Distribution).filter(
            models.Distribution.part_id == part_id
        ).all(),
        "alerts": services["alert"].db.query(models.Alert).filter(
            models.Alert.part_id == part_id
        ).all()
    }

# === 2. GẮN SERI VIN ===
@app.post("/parts/{part_id}/vin", response_model=dict)
def link_vin(part_id: int, link: VinLink, services=Depends(get_services)):
    result = services["vin"].link_part_to_vin(link)
    return {"message": f"Linked {link.serial_number} to VIN {link.vehicle_vin}"}

# === 3. TỒN KHO ===
@app.post("/inventory/transaction/")
def process_transaction(tx: InventoryTransaction, services=Depends(get_services)):
    result = services["inv"].receive_stock(tx)
    return {"updated_inventory": result}

@app.get("/inventory/report/")
def get_report(services=Depends(get_services)):
    return services["inv"].get_inventory_report()

# === 4. PHÂN BỔ ===
@app.post("/distributions/")
def create_dist(dist: DistributionCreate, services=Depends(get_services)):
    result = services["dist"].create_distribution(dist)
    return {"distribution": result}

@app.put("/distributions/{dist_id}/deliver")
def confirm_deliver(dist_id: int, services=Depends(get_services)):
    result = services["dist"].confirm_delivery(dist_id)
    return {"delivered": result}

# === 5. CẢNH BÁO ===
@app.get("/alerts/")
def get_alerts(services=Depends(get_services)):
    return services["alert"].db.query(models.Alert).all()

@app.get("/alerts/check")
def check_alerts(services=Depends(get_services)):
    low_stock = services["inv"].db.query(models.Inventory).filter(
        models.Inventory.quantity <= models.Inventory.min_stock
    ).all()
    alerts = [services["alert"].create_alert(inv) for inv in low_stock]
    return {"new_alerts": len(alerts)}

@app.get("/health")
def health(): return {"status": "SUPER SERVICE READY"}