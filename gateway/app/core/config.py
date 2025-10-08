import os
from dotenv import load_dotenv
load_dotenv()

AUTH_SERVICE_URL = os.getenv("AUTH_SERVICE_URL", "http://localhost:8001")
REPORT_SERVICE_URL = os.getenv("REPORT_SERVICE_URL", "http://localhost:8002")

JWT_SECRET = os.getenv("JWT_SECRET", "change-me")
JWT_ALGORITHM = os.getenv("JWT_ALGORITHM", "HS256")
VERIFY_JWT = os.getenv("VERIFY_JWT", "true").lower() in ("1","true","yes")
