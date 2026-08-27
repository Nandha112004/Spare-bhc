from sqlalchemy import Column, Integer, String, Text, Date, DateTime, Float, ForeignKey, func
from sqlalchemy.orm import relationship
from datetime import datetime
from .database import Base

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(120), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    name = Column(String(100))
    department = Column(String(50))
    phone = Column(String(20), nullable=True)
    student_id = Column(String(50), nullable=True)
    year = Column(String(20), nullable=True)  # e.g., 1st, 2nd, 3rd, 4th, PG
    # For hackathon, store lat/lng as floats instead of POINT type for SQLite compatibility
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    firebase_uid = Column(String(128), unique=True, nullable=True)  # optional for Firebase compat
    is_verified = Column(String(20), default="pending")  # pending, verified, rejected
    two_factor_enabled = Column(String(10), default="false")
    created_at = Column(DateTime, default=datetime.utcnow)

    resources = relationship("Resource", back_populates="owner", cascade="all, delete-orphan")
    needs = relationship("Need", back_populates="requester", cascade="all, delete-orphan")

class Resource(Base):
    __tablename__ = "resources"
    id = Column(Integer, primary_key=True, index=True)
    owner_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    title = Column(String(200), nullable=False)
    description = Column(Text)
    category = Column(String(50), index=True)  # textbook, electronics, equipment, labkit, etc
    image_url = Column(String(512), nullable=True)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    location_text = Column(String(200), nullable=True)  # human readable e.g., "ECE Block, Room 301"
    available_from = Column(Date, nullable=True)
    available_until = Column(Date, nullable=True)
    lend_type = Column(String(20), default="lend")  # lend, give, exchange
    status = Column(String(20), default="available")  # available, reserved, lent, returned
    estimated_value = Column(Integer, default=0)  # INR for sustainability metrics
    # Security / verification fields
    condition = Column(String(30), default="good")  # new, good, fair, needs_repair
    serial_number = Column(String(100), nullable=True)
    security_deposit = Column(Integer, default=0)  # INR 0 if no deposit
    verification_code = Column(String(10), nullable=True)  # 6-digit pickup code
    contact_preference = Column(String(30), default="in_app")  # in_app, email, phone
    requires_id_proof = Column(String(10), default="true")  # true/false
    pickup_instructions = Column(Text, nullable=True)
    max_borrow_days = Column(Integer, default=14)
    is_verified = Column(String(20), default="pending")  # pending, verified
    created_at = Column(DateTime, default=datetime.utcnow)

    owner = relationship("User", back_populates="resources")

class Need(Base):
    __tablename__ = "needs"
    id = Column(Integer, primary_key=True, index=True)
    requester_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    title = Column(String(200), nullable=False)
    description = Column(Text)
    category = Column(String(50), index=True)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    location_text = Column(String(200), nullable=True)
    needed_by = Column(Date, nullable=True)
    status = Column(String(20), default="open")  # open, fulfilled, expired
    # Security / detail fields
    purpose = Column(Text, nullable=True)  # why needed
    urgency = Column(String(20), default="medium")  # low, medium, high, urgent
    budget = Column(Integer, nullable=True)  # willing to pay/deposit
    collateral_offered = Column(String(200), nullable=True)
    contact_preference = Column(String(30), default="in_app")
    requires_id_proof = Column(String(10), default="true")
    agree_terms = Column(String(10), default="true")
    created_at = Column(DateTime, default=datetime.utcnow)

    requester = relationship("User", back_populates="needs")

class Exchange(Base):
    __tablename__ = "exchanges"
    id = Column(Integer, primary_key=True, index=True)
    resource_id = Column(Integer, ForeignKey("resources.id", ondelete="SET NULL"), nullable=True)
    need_id = Column(Integer, ForeignKey("needs.id", ondelete="SET NULL"), nullable=True)
    borrower_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    owner_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    status = Column(String(20), default="requested")  # requested, accepted, active, completed, cancelled, declined
    requested_at = Column(DateTime, default=datetime.utcnow)
    accepted_at = Column(DateTime, nullable=True)
    expected_return = Column(Date, nullable=True)
    returned_at = Column(DateTime, nullable=True)
    qr_code = Column(Text, nullable=True)  # store exchange_id string or base64

    resource = relationship("Resource")
    need = relationship("Need")
    borrower = relationship("User", foreign_keys=[borrower_id])
    owner = relationship("User", foreign_keys=[owner_id])
