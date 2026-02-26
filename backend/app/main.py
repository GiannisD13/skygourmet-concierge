from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.v1 import auth, menu, orders, users

app = FastAPI(title="SkyGourmet Concierge API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:8080"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router,   prefix="/api/v1/auth",   tags=["auth"])
app.include_router(menu.router,   prefix="/api/v1/menu",   tags=["menu"])
app.include_router(orders.router, prefix="/api/v1/orders", tags=["orders"])
app.include_router(users.router,  prefix="/api/v1/users",  tags=["users"])
