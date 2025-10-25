from .db import Base, engine, SessionLocal
from .models import Role, User
from .utils import hash_password

Base.metadata.create_all(bind=engine)
db = SessionLocal()

roles = ["Admin", "SC_Staff", "SC_Technician", "EVM_Staff"]
for name in roles:
    if not db.query(Role).filter_by(role_name=name).first():
        db.add(Role(role_name=name))
db.commit()

admin = db.query(User).filter_by(username="admin").first()
if not admin:
    admin_role = db.query(Role).filter_by(role_name="Admin").first()
    db.add(User(username="admin", password_hash=hash_password("123456"), role_id=admin_role.role_id))
    db.commit()

db.close()
print("✅ Roles and admin created.")