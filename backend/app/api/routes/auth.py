from fastapi import APIRouter, Depends, HTTPException, Request, Response
from sqlalchemy.orm import Session

from app.api.deps import get_db
from app.api.deps import get_current_user
from app.core import security
from app.core.config import settings
from app.core.limiter import limiter
from app.db.models.user import User
from app.schemas.user import LoginRequest, Token, UserResponse

router = APIRouter(prefix="/auth", tags=["auth"])

_COOKIE_OPTS = dict(httponly=True, secure=True, samesite="strict")


@router.post("/login", response_model=Token)
@limiter.limit("10/minute")
async def login(request: Request, body: LoginRequest, response: Response, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.username == body.username).first()
    if not user or not user.is_active or not security.verify_password(body.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    token_data = {"sub": user.username, "role": user.role.value}
    access_token = security.create_access_token(token_data)
    refresh_token = security.create_refresh_token(token_data)

    response.set_cookie("access_token", access_token, max_age=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60, **_COOKIE_OPTS)
    response.set_cookie("refresh_token", refresh_token, max_age=settings.REFRESH_TOKEN_EXPIRE_DAYS * 86400, **_COOKIE_OPTS)

    return Token(access_token=access_token)


@router.post("/logout", status_code=204)
async def logout(response: Response):
    response.delete_cookie("access_token")
    response.delete_cookie("refresh_token")


@router.post("/refresh", response_model=Token)
async def refresh(request: Request, response: Response):
    token = request.cookies.get("refresh_token")
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    payload = security.decode_token(token)
    access_token = security.create_access_token({"sub": payload["sub"], "role": payload["role"]})
    response.set_cookie("access_token", access_token, max_age=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60, **_COOKIE_OPTS)
    return Token(access_token=access_token)


@router.get("/me", response_model=UserResponse)
async def get_me(current_user: User = Depends(get_current_user)):
    return current_user
