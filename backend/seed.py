"""
Seed the database with initial users and accounts.
Idempotent — skips any user that already exists.

Run inside the backend container:
  docker compose exec backend python seed.py
"""

from decimal import Decimal
from app.core.security import hash_password
from app.db.models.user import User, UserRole
from app.db.models.account import Account
from app.db.session import SessionLocal

USERS = [
    {
        "username": "emma.w",
        "email": "emma.w@school.local",
        "password": "1234",
        "role": UserRole.student,
        "balance": Decimal("245.50"),
    },
    {
        "username": "noah.j",
        "email": "noah.j@school.local",
        "password": "1234",
        "role": UserRole.student,
        "balance": Decimal("180.75"),
    },
    {
        "username": "sophia.m",
        "email": "sophia.m@school.local",
        "password": "1234",
        "role": UserRole.student,
        "balance": Decimal("310.25"),
    },
    {
        "username": "finance",
        "email": "finance@school.local",
        "password": "5678",
        "role": UserRole.finance,
        "balance": None,
    },
    {
        "username": "admin",
        "email": "admin@school.local",
        "password": "9999",
        "role": UserRole.admin,
        "balance": None,
    },
]


def seed():
    db = SessionLocal()
    try:
        for data in USERS:
            existing = db.query(User).filter(User.username == data["username"]).first()
            if existing:
                print(f"  skip  {data['username']} (already exists)")
                continue

            user = User(
                username=data["username"],
                email=data["email"],
                hashed_password=hash_password(data["password"]),
                role=data["role"],
            )
            db.add(user)
            db.flush()

            if data["balance"] is not None:
                account = Account(owner_id=user.id, balance=data["balance"])
                db.add(account)

            print(f"  created {data['username']} ({data['role'].value})")

        db.commit()
        print("Done.")
    except Exception as e:
        db.rollback()
        raise e
    finally:
        db.close()


if __name__ == "__main__":
    seed()
