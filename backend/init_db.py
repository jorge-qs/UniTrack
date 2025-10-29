#!/usr/bin/env python
"""
Initialize the database by creating all tables.
Run this script before starting the application for the first time.
"""

from app.db.base import Base, engine
from app.db.models import User, Course, Inference, StudentProfileModel  # noqa: F401

def init_db():
    """Create all database tables."""
    print("Creating database tables...")
    Base.metadata.create_all(bind=engine)
    print("✅ Database tables created successfully!")
    print(f"   Tables: {', '.join(Base.metadata.tables.keys())}")

if __name__ == "__main__":
    init_db()
