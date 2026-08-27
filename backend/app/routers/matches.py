from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import Optional, List
from ..database import get_db
from ..models import Need, Resource
from ..schemas import MatchResult, ResourceOut
from ..auth import get_current_user_optional
from ..matching import rank_resources_for_need, compute_match
from ..models import User

router = APIRouter(prefix="/matches", tags=["matches"])

def resource_to_out(r: Resource) -> ResourceOut:
    return ResourceOut(
        id=r.id,
        owner_id=r.owner_id,
        title=r.title,
        description=r.description,
        category=r.category,
        image_url=r.image_url,
        latitude=r.latitude,
        longitude=r.longitude,
        location_text=r.location_text,
        available_from=r.available_from,
        available_until=r.available_until,
        lend_type=r.lend_type,
        estimated_value=r.estimated_value,
        status=r.status,
        created_at=r.created_at,
        owner_name=r.owner.name if r.owner else None,
        owner_email=r.owner.email if r.owner else None,
    )

@router.get("", response_model=List[MatchResult])
def get_matches(
    need_id: int = Query(..., description="Need ID to find matches for"),
    top_k: int = Query(10, ge=1, le=50),
    category_filter: Optional[str] = None,
    db: Session = Depends(get_db),
):
    need = db.query(Need).filter(Need.id == need_id).first()
    if not need:
        raise HTTPException(status_code=404, detail="Need not found")
    q = db.query(Resource).filter(Resource.status == "available")
    # Optional: filter by lend_type etc. For demo we return all available
    resources = q.all()
    ranked = rank_resources_for_need(need, resources)
    results = []
    for res, scores in ranked[:top_k]:
        # optional category filter
        if category_filter and res.category != category_filter:
            continue
        results.append(MatchResult(
            resource=resource_to_out(res),
            match_score=scores["match_score"],
            semantic_score=scores["semantic_score"],
            category_score=scores["category_score"],
            distance_km=scores["distance_km"],
            distance_score=scores["distance_score"],
            time_score=scores["time_score"],
            reasons=scores["reasons"]
        ))
    return results

@router.get("/resource", response_model=List[MatchResult])
def get_matches_for_resource(
    resource_id: int = Query(...),
    top_k: int = Query(10, ge=1, le=50),
    db: Session = Depends(get_db),
):
    resource = db.query(Resource).filter(Resource.id == resource_id).first()
    if not resource:
        raise HTTPException(status_code=404, detail="Resource not found")
    needs = db.query(Need).filter(Need.status == "open").all()
    # reverse: compute match for each need treating resource as the target
    scored = []
    for need in needs:
        scores = compute_match(need, resource)
        scored.append((need, scores))
    scored.sort(key=lambda x: x[1]["final"], reverse=True)
    # Return as MatchResult but resource is same; we still return resource with need info? For hackathon, return resource with scores
    results = []
    for need, scores in scored[:top_k]:
        results.append(MatchResult(
            resource=resource_to_out(resource),
            match_score=scores["match_score"],
            semantic_score=scores["semantic_score"],
            category_score=scores["category_score"],
            distance_km=scores["distance_km"],
            distance_score=scores["distance_score"],
            time_score=scores["time_score"],
            reasons=scores["reasons"] + [f"Need: {need.title}"]
        ))
    return results

@router.get("/search")
def search_before_buy(
    q: str = Query(..., description="Search query like 'Arduino'"),
    latitude: Optional[float] = None,
    longitude: Optional[float] = None,
    db: Session = Depends(get_db),
):
    """Don't Buy It Yet hook: search query -> count compatible resources nearby"""
    # Default to campus center (Bangalore) if no location provided
    if latitude is None:
        latitude = 12.9716
    if longitude is None:
        longitude = 77.5946
    # Use matching engine: create a fake need from query
    class FakeNeed:
        def __init__(self, title):
            self.title = title
            self.description = title
            self.category = ""
            self.latitude = latitude
            self.longitude = longitude
            self.needed_by = None
            self.available_from = None
            self.available_until = None

    fake = FakeNeed(q)
    resources = db.query(Resource).filter(Resource.status == "available").all()
    ranked = rank_resources_for_need(fake, resources)
    # count compat: match_score >= 35 (lowered for better demo with TF-IDF fallback)
    compatible = [ (r,s) for r,s in ranked if s["match_score"] >= 35 ]
    top = compatible[:5]
    return {
        "query": q,
        "total_compatible": len(compatible),
        "message": f"Don't buy it yet – {len(compatible)} compatible resources nearby!" if compatible else "No compatible resources found, but you can post a Need.",
        "top_matches": [
            {
                "resource": resource_to_out(r).dict(),
                "match_score": s["match_score"],
                "distance_km": s["distance_km"],
            } for r,s in top
        ]
    }
