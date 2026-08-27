from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Optional, List
from ..database import get_db
from ..models import Need, User
from ..schemas import NeedCreate, NeedOut
from ..auth import get_current_user, get_current_user_optional

router = APIRouter(prefix="/needs", tags=["needs"])

def to_out(n: Need) -> NeedOut:
    return NeedOut(
        id=n.id,
        requester_id=n.requester_id,
        title=n.title,
        description=n.description,
        category=n.category,
        latitude=n.latitude,
        longitude=n.longitude,
        location_text=n.location_text,
        needed_by=n.needed_by,
        purpose=n.purpose,
        urgency=n.urgency,
        budget=n.budget,
        collateral_offered=n.collateral_offered,
        contact_preference=n.contact_preference,
        requires_id_proof=n.requires_id_proof,
        agree_terms=n.agree_terms,
        status=n.status,
        created_at=n.created_at,
        requester_name=n.requester.name if n.requester else None,
    )

@router.post("", response_model=NeedOut)
def create_need(payload: NeedCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    need = Need(
        requester_id=current_user.id,
        title=payload.title,
        description=payload.description,
        category=payload.category,
        latitude=payload.latitude,
        longitude=payload.longitude,
        location_text=payload.location_text,
        needed_by=payload.needed_by,
        purpose=payload.purpose,
        urgency=payload.urgency or "medium",
        budget=payload.budget,
        collateral_offered=payload.collateral_offered,
        contact_preference=payload.contact_preference or "in_app",
        requires_id_proof=payload.requires_id_proof or "true",
        agree_terms=payload.agree_terms or "true",
        status="open"
    )
    db.add(need)
    db.commit()
    db.refresh(need)
    need.requester = current_user
    return to_out(need)

@router.get("", response_model=List[NeedOut])
def list_needs(
    category: Optional[str] = None,
    search: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user_optional)
):
    q = db.query(Need)
    if category:
        q = q.filter(Need.category == category)
    if search:
        like = f"%{search}%"
        q = q.filter((Need.title.ilike(like)) | (Need.description.ilike(like)))
    needs = q.order_by(Need.created_at.desc()).all()
    return [to_out(n) for n in needs]

@router.get("/{need_id}", response_model=NeedOut)
def get_need(need_id: int, db: Session = Depends(get_db)):
    n = db.query(Need).filter(Need.id == need_id).first()
    if not n:
        raise HTTPException(status_code=404, detail="Need not found")
    return to_out(n)

@router.put("/{need_id}", response_model=NeedOut)
def update_need(need_id: int, payload: NeedCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    n = db.query(Need).filter(Need.id == need_id).first()
    if not n:
        raise HTTPException(status_code=404, detail="Need not found")
    if n.requester_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not owner")
    for k, v in payload.dict(exclude_unset=True).items():
        setattr(n, k, v)
    db.commit()
    db.refresh(n)
    return to_out(n)

@router.delete("/{need_id}")
def delete_need(need_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    n = db.query(Need).filter(Need.id == need_id).first()
    if not n:
        raise HTTPException(status_code=404, detail="Need not found")
    if n.requester_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not owner")
    db.delete(n)
    db.commit()
    return {"detail": "deleted"}
