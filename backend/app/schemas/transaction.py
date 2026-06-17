from datetime import datetime
from decimal import Decimal
from uuid import UUID
from typing import Annotated

from pydantic import BaseModel, ConfigDict, Field

from app.db.models.transaction import TransactionType


class TransactionCreate(BaseModel):
    account_id: UUID
    type: TransactionType
    amount: Annotated[Decimal, Field(gt=0)]
    note: str | None = None


class TransactionResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    account_id: UUID
    type: TransactionType
    amount: Decimal
    note: str | None
    created_by: UUID
    created_at: datetime
