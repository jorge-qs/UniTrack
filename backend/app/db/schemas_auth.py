"""
Authentication Schemas
"""
from pydantic import BaseModel, EmailStr, Field


class UserRegister(BaseModel):
    """Schema for user registration"""
    email: EmailStr
    password: str = Field(..., min_length=6, description="Password (min 6 characters)")
    full_name: str | None = Field(None, description="Full name")


class UserLogin(BaseModel):
    """Schema for user login"""
    email: EmailStr
    password: str


class Token(BaseModel):
    """Schema for JWT token response"""
    access_token: str
    token_type: str = "bearer"


class UserResponse(BaseModel):
    """Schema for user information in responses"""
    id: str
    email: str
    full_name: str | None
    created_at: str

    model_config = {"from_attributes": True}


class RegisterResponse(BaseModel):
    """Schema for registration response"""
    user: UserResponse
    access_token: str
    token_type: str = "bearer"
