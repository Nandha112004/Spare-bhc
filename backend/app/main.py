from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from datetime import date, timedelta
import os

from .database import engine, Base, SessionLocal
from .models import User, Resource, Need
from .auth import get_password_hash
from .routers import auth_router, resources, needs, matches, exchanges, analytics

# Create tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="SPARE API",
    description="Smart Platform for Resource Exchange - Hackathon Prototype",
    version="1.0.0"
)

# CORS - allow all for hackathon
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth_router.router)
app.include_router(resources.router)
app.include_router(needs.router)
app.include_router(matches.router)
app.include_router(exchanges.router)
app.include_router(analytics.router)

@app.get("/")
def root():
    return {
        "message": "SPARE API is running",
        "docs": "/docs",
        "health": "/health",
        "version": "1.0.0"
    }

@app.get("/health")
def health():
    return {"status": "ok"}

# Seed data on startup
@app.on_event("startup")
def seed_data():
    db: Session = SessionLocal()
    try:
        # Only seed if no users
        if db.query(User).count() > 0:
            print("[seed] DB already has data, skipping seed")
            return
        print("[seed] Seeding demo data...")

        # Create demo users — BISHOP HEBER COLLEGE (Autonomous), Tiruchirappalli
        # Address: Post Box No. 615, Vayalur Road, Puthur, Trichy – 620017 | 10.8188 N, 78.6754 E
        # Departments: official 23 from https://bhc.edu.in/academics/departments/
        users_data = [
            {"email": "priya@bhc.edu.in", "name": "Priya Sharma", "department": "Commerce", "lat": 10.8192, "lon": 78.6758, "phone": "+919876543210", "sid": "COM2021-042", "year": "3rd"},  # P. Vishwanathan Block
            {"email": "arjun@bhc.edu.in", "name": "Arjun Mehta", "department": "Computer Science", "lat": 10.8185, "lon": 78.6749, "phone": "+919876543211", "sid": "CS2022-011", "year": "3rd"},  # Bishop Solomon Doraiswamy Block
            {"email": "neha@bhc.edu.in", "name": "Neha Gupta", "department": "Botany", "lat": 10.8186, "lon": 78.6765, "phone": "+919876543212", "sid": "BOT2021-089", "year": "4th"}, # Environmental Sciences Lab
            {"email": "rahul@bhc.edu.in", "name": "Rahul Verma", "department": "Physics", "lat": 10.8180, "lon": 78.6740, "phone": "+919876543213", "sid": "PHY2022-033", "year": "3rd"}, # HAIF Instrumentation
            {"email": "demo@bhc.edu.in", "name": "Demo User", "department": "Computer Application", "lat": 10.8188, "lon": 78.6754, "phone": "+919999999999", "sid": "BCA2023-001", "year": "3rd"}, # Main Gate Admin
            {"email": "demo@spare.edu", "name": "Demo User", "department": "Computer Application", "lat": 10.8188, "lon": 78.6754, "phone": "+919999999999", "sid": "BCA2023-001", "year": "3rd"}, # legacy alias
        ]
        users = []
        for u in users_data:
            user = User(
                email=u["email"],
                hashed_password=get_password_hash("password123"),
                name=u["name"],
                department=u["department"],
                phone=u["phone"],
                student_id=u["sid"],
                year=u["year"],
                latitude=u["lat"],
                longitude=u["lon"],
                is_verified="verified",
                two_factor_enabled="false"
            )
            db.add(user)
        db.commit()
        for u in db.query(User).all():
            users.append(u)

        # Map email to user
        email_map = {u.email: u for u in users}

        today = date.today()
        # BHC campus locations — Vayalur Road, Puthur, Trichy (10.8188, 78.6754)
        # Original resource-specific images — verified 200 OK (Wikimedia + Unsplash)
        resources_data = [
            {"title": "Arduino Uno Kit", "desc": "Complete Arduino Uno with breadboard, jumper wires, sensors. Used for BHC Data Science project.", "cat": "electronics", "loc": "Bishop Solomon Doraiswamy Block (Computer Science), BHC", "lat": 10.8185, "lon": 78.6749, "val": 2500, "owner": "arjun@bhc.edu.in", "img": "https://upload.wikimedia.org/wikipedia/commons/3/38/Arduino_Uno_-_R3.jpg"},
            {"title": "Microcontroller Development Board", "desc": "STM32 Nucleo board, Arduino-compatible, with BHC documentation", "cat": "electronics", "loc": "HAIF Instrumentation Facility, BHC", "lat": 10.8180, "lon": 78.6740, "val": 3200, "owner": "rahul@bhc.edu.in", "img": "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80"},
            {"title": "Botany Reference — Medicinal Plants", "desc": "Textbook for Botany dept, BHC, good condition, 2023 edition", "cat": "textbook", "loc": "BHC Central Library", "lat": 10.8190, "lon": 78.6752, "val": 800, "owner": "neha@bhc.edu.in", "img": "https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=800&q=80"},
            {"title": "Digital Oscilloscope", "desc": "DSO 100MHz, 2-channel, Physics lab BHC, calibrated", "cat": "equipment", "loc": "Physics Lab, P. Vishwanathan Block, BHC", "lat": 10.8192, "lon": 78.6758, "val": 15000, "owner": "rahul@bhc.edu.in", "img": "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=800&q=80"},
            {"title": "Raspberry Pi 4 Kit", "desc": "Raspberry Pi 4 4GB with case, power supply, 32GB SD — BHC Computer Application", "cat": "electronics", "loc": "Bishop Solomon Doraiswamy Block, BHC", "lat": 10.8185, "lon": 78.6749, "val": 4500, "owner": "arjun@bhc.edu.in", "img": "https://images.unsplash.com/photo-1498049794561-7780e7231661?auto=format&fit=crop&w=800&q=80"},
            {"title": "Chemistry Lab Kit", "desc": "Beakers, test tubes, titration set — BHC Chemistry Dept", "cat": "labkit", "loc": "Chemistry Lab, BHC", "lat": 10.8186, "lon": 78.6765, "val": 1200, "owner": "neha@bhc.edu.in", "img": "https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?auto=format&fit=crop&w=800&q=80"},
            {"title": "Projector - Mini (BHC)", "desc": "Portable mini projector, HDMI, 1080p, for BHC Management Studies presentations", "cat": "equipment", "loc": "BHC Auditorium", "lat": 10.8195, "lon": 78.6748, "val": 8000, "owner": "priya@bhc.edu.in", "img": "https://images.unsplash.com/photo-1532012197267-da84d127e765?auto=format&fit=crop&w=800&q=80"},
            {"title": "Data Structures Textbook (BHC)", "desc": "Cormen CLRS + BHC Computer Science notes, annotated", "cat": "textbook", "loc": "BHC Central Library", "lat": 10.8190, "lon": 78.6752, "val": 950, "owner": "demo@bhc.edu.in", "img": "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&w=800&q=80"},
            {"title": "3D Printer Filament - PLA", "desc": "1kg PLA white, 1.75mm, brand new — BHC Visual Communication Lab", "cat": "stationery", "loc": "Visual Communication Lab, BHC", "lat": 10.8182, "lon": 78.6762, "val": 1100, "owner": "demo@bhc.edu.in", "img": "https://images.unsplash.com/photo-1581092160562-40aa08e78837?auto=format&fit=crop&w=800&q=80"},
            {"title": "Badminton Racket - Yonex", "desc": "Yonex Gr 303, pair — BHC Sports Complex", "cat": "sports", "loc": "BHC Sports Complex", "lat": 10.8170, "lon": 78.6755, "val": 1800, "owner": "neha@bhc.edu.in", "img": "https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?auto=format&fit=crop&w=800&q=80"},
            {"title": "Scientific Calculator - Casio", "desc": "Casio fx-991EX, for BHC Actuarial Science exams", "cat": "stationery", "loc": "Men's Hostel, BHC", "lat": 10.8175, "lon": 78.6760, "val": 1500, "owner": "priya@bhc.edu.in", "img": "https://images.unsplash.com/photo-1516383740770-fbcc5ccbece0?auto=format&fit=crop&w=800&q=80"},
            {"title": "Arduino-compatible Sensor Pack", "desc": "20 sensors - ultrasonic, IR, DHT11, moisture — BHC Data Science", "cat": "electronics", "loc": "Bishop Solomon Doraiswamy Block, BHC", "lat": 10.8185, "lon": 78.6749, "val": 1800, "owner": "demo@bhc.edu.in", "img": "https://images.unsplash.com/photo-1507646227500-4d389b0012be?auto=format&fit=crop&w=800&q=80"},
        ]

        import random, string as _s
        for r in resources_data:
            owner = email_map.get(r["owner"])
            vcode = ''.join(random.choices(_s.digits, k=6))
            cond = random.choice(["good", "good", "good", "new", "fair"])
            deposit = 0 if r["val"] < 2000 else random.choice([0, 500, 1000])
            res = Resource(
                owner_id=owner.id,
                title=r["title"],
                description=r["desc"],
                category=r["cat"],
                image_url=r.get("img") or f"https://picsum.photos/seed/{r['title'].replace(' ', '')}/600/400",
                latitude=r["lat"],
                longitude=r["lon"],
                location_text=r["loc"],
                available_from=today,
                available_until=today + timedelta(days=30),
                lend_type="lend",
                estimated_value=r["val"],
                condition=cond,
                verification_code=vcode,
                security_deposit=deposit,
                contact_preference="in_app",
                requires_id_proof="true",
                pickup_instructions="Bring student ID • verify code at handover",
                max_borrow_days=14,
                status="available",
                is_verified="verified"
            )
            db.add(res)

        needs_data = [
            {"title": "Need Arduino for BHC Project", "desc": "Need Arduino Uno or compatible board for BHC Data Science IoT mini project, 2 weeks", "cat": "electronics", "loc": "Women's Hostel, BHC", "lat": 10.8178, "lon": 78.6745, "requester": "demo@bhc.edu.in"},
            {"title": "Looking for DSO for BHC Physics Lab", "desc": "Need oscilloscope for BHC Physics final year project testing", "cat": "equipment", "loc": "P. Vishwanathan Block, BHC", "lat": 10.8192, "lon": 78.6758, "requester": "rahul@bhc.edu.in"},
            {"title": "Textbook - Commerce (BHC)", "desc": "Business Management textbook for BHC Commerce semester", "cat": "textbook", "loc": "BHC Central Library", "lat": 10.8190, "lon": 78.6752, "requester": "priya@bhc.edu.in"},
            {"title": "Raspberry Pi for BHC Hackathon", "desc": "Need Raspberry Pi for BHC 24hr hackathon this weekend at Auditorium", "cat": "electronics", "loc": "BHC Auditorium", "lat": 10.8195, "lon": 78.6748, "requester": "arjun@bhc.edu.in"},
            {"title": "Lab Coat - Medium (BHC Chemistry)", "desc": "Need lab coat for BHC Chemistry practicals", "cat": "labkit", "loc": "Environmental Sciences Lab, BHC", "lat": 10.8186, "lon": 78.6765, "requester": "demo@bhc.edu.in"},
        ]

        for n in needs_data:
            req = email_map.get(n["requester"])
            need = Need(
                requester_id=req.id,
                title=n["title"],
                description=n["desc"],
                category=n["cat"],
                latitude=n["lat"],
                longitude=n["lon"],
                location_text=n["loc"],
                needed_by=today + timedelta(days=14),
                purpose=n["desc"],
                urgency=random.choice(["medium", "high", "medium", "low"]),
                budget=random.choice([0, 500, 1000]),
                collateral_offered="Student ID + lab access card",
                contact_preference="in_app",
                requires_id_proof="true",
                agree_terms="true",
                status="open"
            )
            db.add(need)

        db.commit()
        print(f"[seed] Seeded {len(resources_data)} resources, {len(needs_data)} needs, {len(users_data)} users")
        print("[seed] Demo login: demo@bhc.edu.in / password123  (also demo@spare.edu)")
        print("[seed] BHC: Post Box No. 615, Vayalur Road, Puthur, Trichy - 620017 | 10.8188, 78.6754")
    except Exception as e:
        print(f"[seed] Error seeding: {e}")
        db.rollback()
    finally:
        db.close()
