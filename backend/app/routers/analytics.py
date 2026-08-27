from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from ..database import get_db
from ..models import Resource, Need, Exchange, User
from ..schemas import DashboardStats, HeatmapPoint
from ..auth import get_current_user, get_current_user_optional
from typing import Optional, List

router = APIRouter(tags=["analytics"])

@router.get("/dashboard/stats", response_model=DashboardStats)
def dashboard_stats(db: Session = Depends(get_db), current_user: Optional[User] = Depends(get_current_user_optional)):
    total_resources = db.query(func.count(Resource.id)).scalar() or 0
    total_needs = db.query(func.count(Need.id)).scalar() or 0
    total_exchanges = db.query(func.count(Exchange.id)).scalar() or 0
    active_loans = db.query(func.count(Exchange.id)).filter(Exchange.status == "active").scalar() or 0
    completed = db.query(Exchange).filter(Exchange.status == "completed").all()
    money_saved = sum((db.query(Resource).filter(Resource.id == e.resource_id).first().estimated_value if db.query(Resource).filter(Resource.id == e.resource_id).first() else 500) for e in completed)
    # fallback pricing if not found
    if not completed:
        money_saved = 0
    # If money_saved computed but many completed without resource, use avg 800
    items_reused = len(completed)

    my_resources = 0
    my_needs = 0
    my_active = 0
    if current_user:
        my_resources = db.query(func.count(Resource.id)).filter(Resource.owner_id == current_user.id).scalar() or 0
        my_needs = db.query(func.count(Need.id)).filter(Need.requester_id == current_user.id).scalar() or 0
        my_active = db.query(func.count(Exchange.id)).filter(
            ((Exchange.borrower_id == current_user.id) | (Exchange.owner_id == current_user.id)) &
            (Exchange.status.in_(["requested","accepted","active","return_pending"]))
        ).scalar() or 0

    # Campus-wide sustainability: avg 30% of new price
    # money_saved already sum estimated_value; display as INR
    return DashboardStats(
        total_resources=total_resources,
        total_needs=total_needs,
        total_exchanges=total_exchanges,
        active_loans=active_loans,
        money_saved=money_saved,
        items_reused=items_reused,
        my_resources=my_resources,
        my_needs=my_needs,
        my_active_exchanges=my_active
    )

@router.get("/heatmap", response_model=List[HeatmapPoint])
def heatmap(db: Session = Depends(get_db)):
    resources = db.query(Resource).all()
    needs = db.query(Need).all()
    points: List[HeatmapPoint] = []
    for r in resources:
        if r.latitude is None or r.longitude is None:
            continue
        points.append(HeatmapPoint(
            id=r.id,
            type="resource",
            title=r.title,
            category=r.category or "general",
            latitude=r.latitude,
            longitude=r.longitude,
            status=r.status
        ))
    for n in needs:
        if n.latitude is None or n.longitude is None:
            continue
        points.append(HeatmapPoint(
            id=n.id,
            type="need",
            title=n.title,
            category=n.category or "general",
            latitude=n.latitude,
            longitude=n.longitude,
            status=n.status
        ))
    return points
