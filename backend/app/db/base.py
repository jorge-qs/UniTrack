from __future__ import annotations

from contextlib import contextmanager
from typing import Iterator

from sqlalchemy import Engine, create_engine, event
from sqlalchemy.orm import DeclarativeBase, Session, sessionmaker

from app.core.config import get_settings


class Base(DeclarativeBase):
    pass


def _create_engine() -> Engine:
    settings = get_settings()
    connect_args = {}
    if settings.database_url.startswith("sqlite"):
        connect_args["check_same_thread"] = False  # type: ignore[dict-item]
        # Add timeout for database locks (30 seconds)
        connect_args["timeout"] = 30  # type: ignore[dict-item]
    return create_engine(
        settings.database_url,
        pool_pre_ping=True,
        connect_args=connect_args,
        # Use NullPool for SQLite to avoid connection pooling issues
        poolclass=None if settings.database_url.startswith("sqlite") else None,
    )


engine = _create_engine()

# Enable SQLite Write-Ahead Logging (WAL) mode for better concurrency
if get_settings().database_url.startswith("sqlite"):
    @event.listens_for(engine, "connect")
    def set_sqlite_pragma(dbapi_conn, connection_record):
        cursor = dbapi_conn.cursor()
        cursor.execute("PRAGMA journal_mode=WAL")
        cursor.execute("PRAGMA synchronous=NORMAL")
        cursor.execute("PRAGMA busy_timeout=30000")  # 30 seconds
        cursor.close()

SessionLocal = sessionmaker(bind=engine, expire_on_commit=False, class_=Session)


@contextmanager
def session_scope() -> Iterator[Session]:
    session = SessionLocal()
    try:
        yield session
        session.commit()
    except Exception:
        session.rollback()
        raise
    finally:
        session.close()
