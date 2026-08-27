from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import Optional, List
from ..database import get_db
from ..models import Resource, User
from ..schemas import ResourceCreate, ResourceOut
from ..auth import get_current_user, get_current_user_optional

router = APIRouter(prefix="/resources", tags=["resources"])

def to_out(r: Resource) -> ResourceOut:
    # manually populate owner info
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
        condition=r.condition,
        serial_number=r.serial_number,
        security_deposit=r.security_deposit,
        verification_code=r.verification_code,
        contact_preference=r.contact_preference,
        requires_id_proof=r.requires_id_proof,
        pickup_instructions=r.pickup_instructions,
        max_borrow_days=r.max_borrow_days,
        status=r.status,
        is_verified=r.is_verified,
        created_at=r.created_at,
        owner_name=r.owner.name if r.owner else None,
        owner_email=r.owner.email if r.owner else None,
    )

@router.post("", response_model=ResourceOut)
def create_resource(payload: ResourceCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    import random, string
    vcode = payload.verification_code or ''.join(random.choices(string.digits, k=6))
    res = Resource(
        owner_id=current_user.id,
        title=payload.title,
        description=payload.description,
        category=payload.category,
        image_url=payload.image_url,
        latitude=payload.latitude,
        longitude=payload.longitude,
        location_text=payload.location_text,
        available_from=payload.available_from,
        available_until=payload.available_until,
        lend_type=payload.lend_type,
        estimated_value=payload.estimated_value or 500,
        condition=payload.condition or "good",
        serial_number=payload.serial_number,
        security_deposit=payload.security_deposit or 0,
        verification_code=vcode,
        contact_preference=payload.contact_preference or "in_app",
        requires_id_proof=payload.requires_id_proof or "true",
        pickup_instructions=payload.pickup_instructions,
        max_borrow_days=payload.max_borrow_days or 14,
        status="available",
        is_verified="pending"
    )
    db.add(res)
    db.commit()
    db.refresh(res)
    res.owner = current_user
    return to_out(res)

@router.get("", response_model=List[ResourceOut])
def list_resources(
    category: Optional[str] = None,
    search: Optional[str] = None,
    status: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user_optional)
):
    q = db.query(Resource)
    if category:
        q = q.filter(Resource.category == category)
    if status:
        q = q.filter(Resource.status == status)
    if search:
        like = f"%{search}%"
        q = q.filter((Resource.title.ilike(like)) | (Resource.description.ilike(like)))
    resources = q.order_by(Resource.created_at.desc()).all()
    return [to_out(r) for r in resources]

@router.get("/{resource_id}", response_model=ResourceOut)
def get_resource(resource_id: int, db: Session = Depends(get_db)):
    r = db.query(Resource).filter(Resource.id == resource_id).first()
    if not r:
        raise HTTPException(status_code=404, detail="Resource not found")
    return to_out(r)

@router.put("/{resource_id}", response_model=ResourceOut)
def update_resource(resource_id: int, payload: ResourceCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    r = db.query(Resource).filter(Resource.id == resource_id).first()
    if not r:
        raise HTTPException(status_code=404, detail="Resource not found")
    if r.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not owner")
    for k, v in payload.dict(exclude_unset=True).items():
        setattr(r, k, v)
    db.commit()
    db.refresh(r)
    return to_out(r)

@router.delete("/{resource_id}")
def delete_resource(resource_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    r = db.query(Resource).filter(Resource.id == resource_id).first()
    if not r:
        raise HTTPException(status_code=404, detail="Resource not found")
    if r.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not owner")
    db.delete(r)
    db.commit()
    return {"detail": "deleted"}
