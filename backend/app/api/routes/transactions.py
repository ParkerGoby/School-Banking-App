from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.api.deps import get_db, get_current_user, require_role
from app.db.models.account import Account
from app.db.models.transaction import Transaction, TransactionType
from app.db.models.user import User
from app.schemas.transaction import TransactionCreate, TransactionResponse

router = APIRouter(prefix="/transactions", tags=["transactions"])


@router.get("/me", response_model=list[TransactionResponse])
async def get_my_transactions(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=200),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    account = db.query(Account).filter(Account.owner_id == current_user.id).first()
    if not account:
        raise HTTPException(status_code=404, detail="Account not found")
    return (
        db.query(Transaction)
        .filter(Transaction.account_id == account.id)
        .order_by(Transaction.created_at.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )


@router.post("/deposit", response_model=TransactionResponse)
async def deposit(body: TransactionCreate, db: Session = Depends(get_db), current_user: User = Depends(require_role("finance", "admin"))):
    account = db.query(Account).filter(Account.id == body.account_id).first()
    if not account:
        raise HTTPException(status_code=404, detail="Account not found")
    account.balance += body.amount
    transaction = Transaction(
        account_id=account.id,
        type=TransactionType.deposit,
        amount=body.amount,
        note=body.note,
        created_by=current_user.id,
    )
    db.add(transaction)
    db.commit()
    db.refresh(transaction)
    return transaction


@router.post("/withdraw", response_model=TransactionResponse)
async def withdraw(body: TransactionCreate, db: Session = Depends(get_db), current_user: User = Depends(require_role("finance", "admin"))):
    account = db.query(Account).filter(Account.id == body.account_id).first()
    if not account:
        raise HTTPException(status_code=404, detail="Account not found")
    if account.balance < body.amount:
        raise HTTPException(status_code=400, detail="Insufficient funds")
    account.balance -= body.amount
    transaction = Transaction(
        account_id=account.id,
        type=TransactionType.withdrawal,
        amount=body.amount,
        note=body.note,
        created_by=current_user.id,
    )
    db.add(transaction)
    db.commit()
    db.refresh(transaction)
    return transaction


@router.get("/{account_id}", response_model=list[TransactionResponse])
async def get_account_transactions(
    account_id: UUID,
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=200),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("finance", "admin")),
):
    account = db.query(Account).filter(Account.id == account_id).first()
    if not account:
        raise HTTPException(status_code=404, detail="Account not found")
    return (
        db.query(Transaction)
        .filter(Transaction.account_id == account_id)
        .order_by(Transaction.created_at.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )
