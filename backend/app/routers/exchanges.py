from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime
from ..database import get_db
from ..models import Exchange, Resource, Need, User
from ..schemas import ExchangeCreate, ExchangeOut, ExchangeStatusUpdate
from ..auth import get_current_user
from ..qr import generate_exchange_qr

router = APIRouter(prefix="/exchanges", tags=["exchanges"])

def to_out(e: Exchange) -> ExchangeOut:
    return ExchangeOut(
        id=e.id,
        resource_id=e.resource_id,
        need_id=e.need_id,
        borrower_id=e.borrower_id,
        owner_id=e.owner_id,
        status=e.status,
        requested_at=e.requested_at,
        accepted_at=e.accepted_at,
        expected_return=e.expected_return,
        returned_at=e.returned_at,
        qr_code=e.qr_code,
        resource_title=e.resource.title if e.resource else None,
        borrower_name=e.borrower.name if e.borrower else None,
        owner_name=e.owner.name if e.owner else None,
    )

@router.post("", response_model=ExchangeOut)
def create_exchange(payload: ExchangeCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    resource = db.query(Resource).filter(Resource.id == payload.resource_id).first()
    if not resource:
        raise HTTPException(status_code=404, detail="Resource not found")
    if resource.owner_id == current_user.id:
        raise HTTPException(status_code=400, detail="Cannot request your own resource")
    if resource.status != "available":
        raise HTTPException(status_code=400, detail="Resource not available")
    # optional need check
    if payload.need_id:
        need = db.query(Need).filter(Need.id == payload.need_id).first()
        if not need:
            raise HTTPException(status_code=404, detail="Need not found")
        if need.requester_id != current_user.id:
            raise HTTPException(status_code=403, detail="Need does not belong to you")

    exchange = Exchange(
        resource_id=resource.id,
        need_id=payload.need_id,
        borrower_id=current_user.id,
        owner_id=resource.owner_id,
        status="requested",
        expected_return=payload.expected_return,
        qr_code=None
    )
    # mark resource as reserved
    resource.status = "reserved"
    db.add(exchange)
    db.commit()
    db.refresh(exchange)
    return to_out(exchange)

@router.get("", response_model=List[ExchangeOut])
def list_exchanges(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    exchanges = db.query(Exchange).filter(
        (Exchange.borrower_id == current_user.id) | (Exchange.owner_id == current_user.id)
    ).order_by(Exchange.requested_at.desc()).all()
    return [to_out(e) for e in exchanges]

@router.get("/{exchange_id}", response_model=ExchangeOut)
def get_exchange(exchange_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    e = db.query(Exchange).filter(Exchange.id == exchange_id).first()
    if not e:
        raise HTTPException(status_code=404, detail="Exchange not found")
    if e.borrower_id != current_user.id and e.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not participant")
    return to_out(e)

@router.put("/{exchange_id}/status", response_model=ExchangeOut)
def update_status(exchange_id: int, payload: ExchangeStatusUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    e = db.query(Exchange).filter(Exchange.id == exchange_id).first()
    if not e:
        raise HTTPException(status_code=404, detail="Exchange not found")
    action = payload.action.lower()
    resource = db.query(Resource).filter(Resource.id == e.resource_id).first()

    # Accept: only owner can accept
    if action == "accept":
        if e.owner_id != current_user.id:
            raise HTTPException(status_code=403, detail="Only owner can accept")
        if e.status != "requested":
            raise HTTPException(status_code=400, detail=f"Cannot accept from status {e.status}")
        e.status = "accepted"
        e.accepted_at = datetime.utcnow()
        e.qr_code = generate_exchange_qr(e.id)
        if resource:
            resource.status = "reserved"

    elif action == "decline":
        if e.owner_id != current_user.id:
            raise HTTPException(status_code=403, detail="Only owner can decline")
        if e.status != "requested":
            raise HTTPException(status_code=400, detail=f"Cannot decline from {e.status}")
        e.status = "declined"
        if resource:
            resource.status = "available"

    elif action in ("handover", "scan", "activate"):
        # owner scans QR to confirm handover -> active
        if e.owner_id != current_user.id and e.borrower_id != current_user.id:
            raise HTTPException(status_code=403, detail="Not participant")
        if e.status not in ("accepted", "requested"):
            raise HTTPException(status_code=400, detail=f"Cannot handover from {e.status}")
        e.status = "active"
        if resource:
            resource.status = "lent"

    elif action in ("return", "returned"):
        if e.borrower_id != current_user.id:
            raise HTTPException(status_code=403, detail="Only borrower can mark returned")
        if e.status != "active":
            raise HTTPException(status_code=400, detail="Only active exchanges can be returned")
        e.status = "return_pending"
        # borrower indicates returned, awaiting owner confirmation

    elif action in ("complete", "confirm_return"):
        if e.owner_id != current_user.id:
            raise HTTPException(status_code=403, detail="Only owner can confirm return")
        if e.status not in ("active", "return_pending"):
            raise HTTPException(status_code=400, detail="Not in returnable state")
        e.status = "completed"
        e.returned_at = datetime.utcnow()
        if resource:
            resource.status = "available"
        # mark need as fulfilled if linked
        if e.need_id:
            need = db.query(Need).filter(Need.id == e.need_id).first()
            if need:
                need.status = "fulfilled"

    elif action == "cancel":
        if e.borrower_id != current_user.id and e.owner_id != current_user.id:
            raise HTTPException(status_code=403, detail="Not participant")
        if e.status in ("completed", "cancelled"):
            raise HTTPException(status_code=400, detail="Already finished")
        e.status = "cancelled"
        if resource:
            resource.status = "available"

    else:
        raise HTTPException(status_code=400, detail=f"Unknown action {action}")

    db.commit()
    db.refresh(e)
    return to_out(e)

@router.get("/{exchange_id}/qr")
def get_qr(exchange_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    e = db.query(Exchange).filter(Exchange.id == exchange_id).first()
    if not e:
        raise HTTPException(status_code=404, detail="Exchange not found")
    if e.borrower_id != current_user.id and e.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not participant")
    if not e.qr_code:
        # generate on demand if accepted/active
        if e.status in ("accepted", "active", "completed", "return_pending"):
            e.qr_code = generate_exchange_qr(e.id)
            db.commit()
            db.refresh(e)
        else:
            raise HTTPException(status_code=400, detail="QR not available until accepted")
    return {"qr_code": e.qr_code, "exchange_id": e.id, "payload": f"SPARE-EXCHANGE-{e.id}"}

@router.post("/{exchange_id}/scan")
def scan_qr(exchange_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    # Simulate scanning: same as handover
    e = db.query(Exchange).filter(Exchange.id == exchange_id).first()
    if not e:
        raise HTTPException(status_code=404, detail="Exchange not found")
    if e.status == "accepted":
        e.status = "active"
        resource = db.query(Resource).filter(Resource.id == e.resource_id).first()
        if resource:
            resource.status = "lent"
        db.commit()
        return {"detail": "Handover confirmed, exchange is now active", "status": e.status}
    else:
        raise HTTPException(status_code=400, detail=f"Cannot scan in status {e.status}")
