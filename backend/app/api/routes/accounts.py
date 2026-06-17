from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.api.deps import get_db, get_current_user, require_role
from app.db.models.account import Account
from app.db.models.user import User
from app.schemas.account import AccountResponse

router = APIRouter(prefix="/accounts", tags=["accounts"])


@router.get("/me", response_model=AccountResponse)
async def get_my_account(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    account = db.query(Account).filter(Account.owner_id == current_user.id).first()
    if not account:
        raise HTTPException(status_code=404, detail="Account not found")
    return account


@router.get("", response_model=list[AccountResponse])
async def list_accounts(db: Session = Depends(get_db), current_user: User = Depends(require_role("finance", "admin"))):
    return db.query(Account).all()


@router.get("/{account_id}", response_model=AccountResponse)
async def get_account(account_id: UUID, db: Session = Depends(get_db), current_user: User = Depends(require_role("finance", "admin"))):
    account = db.query(Account).filter(Account.id == account_id).first()
    if not account:
        raise HTTPException(status_code=404, detail="Account not found")
    return account
