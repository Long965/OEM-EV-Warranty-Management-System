# gateway/app/main.py

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Import các middleware
from app.middleware.logging_middleware import LoggingMiddleware
from app.middleware.auth_middleware import AuthMiddleware

# Import các router
from app.routes import parts_router, inventory_router, suppliers_router, alerts_router, assignments_router
# (Bạn cũng nên có 1 router cho việc đăng nhập, ví dụ: auth_router)
# from app.routes import auth_router 

app = FastAPI(title="Microservice API Gateway")

# --- 1. ĐĂNG KÝ MIDDLEWARE (THỨ TỰ QUAN TRỌNG) ---

# Lớp ngoài cùng: Logging (để đo tổng thời gian)
app.add_middleware(LoggingMiddleware)

# Lớp thứ 2: CORS
origins = ["http://localhost", "http://localhost:3000"]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Lớp trong cùng: Xác thực (Auth)
# Các đường dẫn này KHÔNG yêu cầu token
exempt_paths = [
    "/",
    "/docs", 
    "/openapi.json", 
    # BẮT BUỘC thêm đường dẫn đăng nhập/đăng ký của bạn vào đây
    # Ví dụ: "/auth/login", 
    # Ví dụ: "/auth/register"
]
app.add_middleware(AuthMiddleware, exempt_paths=exempt_paths)


# --- 2. ĐĂNG KÝ ROUTER ---
# AuthMiddleware sẽ chạy trước.
# Việc phân quyền "admin" sẽ được xử lý BÊN TRONG mỗi file router.

# (Giả sử bạn có router Đăng nhập/Đăng ký KHÔNG cần bảo vệ)
# app.include_router(auth_router.router, prefix="/auth", tags=["Authentication"])

# Các router Quản trị (Admin)
app.include_router(parts_router.router, prefix="/parts", tags=["Parts (Admin Only)"])
app.include_router(suppliers_router.router, prefix="/suppliers", tags=["Suppliers (Admin Only)"])
app.include_router(inventory_router.router, prefix="/inventory", tags=["Inventory (Admin Only)"])
app.include_router(assignments_router.router, prefix="/assignments", tags=["Assignments (Admin Only)"])
app.include_router(alerts_router.router, prefix="/alerts", tags=["Alerts (Admin Only)"])

@app.get("/")
def root():
    return {"status": "API Gateway running"}