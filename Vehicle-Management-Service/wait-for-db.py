import time
import sqlalchemy
from config import settings

# Lấy DATABASE_URL từ file config
DATABASE_URL = settings.DATABASE_URL
# Đảm bảo chúng ta dùng psycopg2 (vì Dockerfile cài 'psycopg2-binary')
if DATABASE_URL.startswith("postgresql://"):
    DATABASE_URL = DATABASE_URL.replace("postgresql://", "postgresql+psycopg2://", 1)

print("Đang chờ database (con voi) tỉnh ngủ...")
connected = False
for _ in range(30): # Thử kết nối trong 30 giây
    try:
        engine = sqlalchemy.create_engine(DATABASE_URL)
        connection = engine.connect()
        connection.close()
        print("✅ Database đã sẵn sàng!")
        connected = True
        break # Thoát vòng lặp
    except sqlalchemy.exc.OperationalError:
        print("... Database chưa sẵn sàng, đang ngủ. Đợi 1 giây...")
        time.sleep(1)

if not connected:
    print("❌ Không thể kết nối database sau 30 giây. Server dừng.")
    exit(1) # Báo lỗi và dừng