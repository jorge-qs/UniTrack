"""
Authentication endpoints for user registration and login
"""
import uuid
from datetime import datetime, timedelta

from fastapi import APIRouter, Depends, HTTPException, status
from jose import jwt
from sqlalchemy.orm import Session

from app.api.deps import get_app_settings, get_current_user, get_db
from app.core.config import Settings
from app.core.password import hash_password, verify_password
from app.core.security import AuthenticatedUser
from app.db import repository
from app.db.models import User
from app.db.schemas import UserRead
from app.db.schemas_auth import RegisterResponse, Token, UserLogin, UserRegister, UserResponse

router = APIRouter()


def create_access_token(user_id: str, email: str, settings: Settings) -> str:
    """Create JWT access token"""
    expire = datetime.utcnow() + timedelta(days=7)  # Token valid for 7 days

    payload = {
        "sub": user_id,
        "email": email,
        "exp": expire,
        "iat": datetime.utcnow(),
    }

    # Use a simple secret for development (in production, use a secure random key)
    secret_key = settings.jwt_secret if hasattr(settings, 'jwt_secret') else "dev-secret-key-change-in-production"
    token = jwt.encode(payload, secret_key, algorithm="HS256")
    return token


@router.post("/register", response_model=RegisterResponse, status_code=status.HTTP_201_CREATED)
async def register(
    user_data: UserRegister,
    db: Session = Depends(get_db),
    settings: Settings = Depends(get_app_settings),
) -> RegisterResponse:
    """
    Register a new user
    """
    # Check if user already exists
    existing_user = db.query(User).filter(User.email == user_data.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )

    # Create new user
    hashed_password = hash_password(user_data.password)
    new_user = User(
        id=uuid.uuid4(),
        email=user_data.email,
        password_hash=hashed_password,
        full_name=user_data.full_name,
        is_active=True,
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    # Create access token
    access_token = create_access_token(str(new_user.id), new_user.email, settings)

    return RegisterResponse(
        user=UserResponse(
            id=str(new_user.id),
            email=new_user.email,
            full_name=new_user.full_name,
            created_at=new_user.created_at.isoformat(),
        ),
        access_token=access_token,
        token_type="bearer",
    )


@router.post("/login", response_model=Token)
async def login(
    credentials: UserLogin,
    db: Session = Depends(get_db),
    settings: Settings = Depends(get_app_settings),
) -> Token:
    """
    Login with email and password
    """
    # Find user by email
    user = db.query(User).filter(User.email == credentials.email).first()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )

    # Verify password
    if not verify_password(credentials.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )

    # Check if user is active
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User account is inactive"
        )

    # Create access token
    access_token = create_access_token(str(user.id), user.email, settings)

    return Token(access_token=access_token, token_type="bearer")


# Support both "/me" and legacy "/auth/me" paths
@router.get("/me", response_model=UserResponse)
@router.get("/auth/me", response_model=UserResponse)
async def get_current_user_info(
    user: AuthenticatedUser = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> UserResponse:
    """
    Get current user information
    """
    db_user = db.query(User).filter(User.id == uuid.UUID(user.id)).first()
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")

    return UserResponse(
        id=str(db_user.id),
        email=db_user.email,
        full_name=db_user.full_name,
        created_at=db_user.created_at.isoformat(),
    )
