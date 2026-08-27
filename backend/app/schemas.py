from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import date, datetime

# ---- User ----
class UserCreate(BaseModel):
    email: EmailStr
    password: str = Field(min_length=6)
    name: str
    department: Optional[str] = None
    phone: Optional[str] = None
    student_id: Optional[str] = None
    year: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    two_factor_enabled: Optional[str] = "false"

class UserLogin(BaseModel):
    email: EmailStr
    password: str
    captcha_token: Optional[str] = None
    two_factor_code: Optional[str] = None
    remember_me: Optional[bool] = False

class UserOut(BaseModel):
    id: int
    email: EmailStr
    name: Optional[str]
    department: Optional[str]
    phone: Optional[str] = None
    student_id: Optional[str] = None
    year: Optional[str] = None
    latitude: Optional[float]
    longitude: Optional[float]
    is_verified: Optional[str] = None
    created_at: Optional[datetime]
    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut

# ---- Resource ----
class ResourceCreate(BaseModel):
    title: str
    description: Optional[str] = None
    category: str
    image_url: Optional[str] = None
    latitude: Optional[float] = 12.9716
    longitude: Optional[float] = 77.5946
    location_text: Optional[str] = "Main Campus"
    available_from: Optional[date] = None
    available_until: Optional[date] = None
    lend_type: str = "lend"
    estimated_value: Optional[int] = 500
    # Security fields
    condition: Optional[str] = "good"
    serial_number: Optional[str] = None
    security_deposit: Optional[int] = 0
    verification_code: Optional[str] = None
    contact_preference: Optional[str] = "in_app"
    requires_id_proof: Optional[str] = "true"
    pickup_instructions: Optional[str] = None
    max_borrow_days: Optional[int] = 14

class ResourceOut(ResourceCreate):
    id: int
    owner_id: int
    status: str
    is_verified: Optional[str] = None
    created_at: Optional[datetime]
    owner_name: Optional[str] = None
    owner_email: Optional[str] = None
    class Config:
        from_attributes = True

# ---- Need ----
class NeedCreate(BaseModel):
    title: str
    description: Optional[str] = None
    category: str
    latitude: Optional[float] = 12.9716
    longitude: Optional[float] = 77.5946
    location_text: Optional[str] = "Main Campus"
    needed_by: Optional[date] = None
    purpose: Optional[str] = None
    urgency: Optional[str] = "medium"
    budget: Optional[int] = None
    collateral_offered: Optional[str] = None
    contact_preference: Optional[str] = "in_app"
    requires_id_proof: Optional[str] = "true"
    agree_terms: Optional[str] = "true"

class NeedOut(NeedCreate):
    id: int
    requester_id: int
    status: str
    created_at: Optional[datetime]
    requester_name: Optional[str] = None
    class Config:
        from_attributes = True

# ---- Exchange ----
class ExchangeCreate(BaseModel):
    resource_id: int
    need_id: Optional[int] = None
    expected_return: Optional[date] = None

class ExchangeOut(BaseModel):
    id: int
    resource_id: Optional[int]
    need_id: Optional[int]
    borrower_id: int
    owner_id: int
    status: str
    requested_at: Optional[datetime]
    accepted_at: Optional[datetime]
    expected_return: Optional[date]
    returned_at: Optional[datetime]
    qr_code: Optional[str]
    resource_title: Optional[str] = None
    borrower_name: Optional[str] = None
    owner_name: Optional[str] = None
    class Config:
        from_attributes = True

class ExchangeStatusUpdate(BaseModel):
    action: str  # accept, decline, handover, return, complete, cancel

# ---- Matching ----
class MatchResult(BaseModel):
    resource: ResourceOut
    match_score: float  # 0-100
    semantic_score: float
    category_score: float
    distance_km: Optional[float]
    distance_score: float
    time_score: float
    reasons: list[str]

# ---- Analytics ----
class DashboardStats(BaseModel):
    total_resources: int
    total_needs: int
    total_exchanges: int
    active_loans: int
    money_saved: int
    items_reused: int
    my_resources: int
    my_needs: int
    my_active_exchanges: int

class HeatmapPoint(BaseModel):
    id: int
    type: str  # resource | need
    title: str
    category: str
    latitude: float
    longitude: float
    status: str
