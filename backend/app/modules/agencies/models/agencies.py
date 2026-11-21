from datetime import date, datetime

from sqlalchemy import Date, DateTime, ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class Agency(Base):
    __tablename__ = "agencies"

    id: Mapped[int] = mapped_column(primary_key=True)

    name: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
    )

    rl_number: Mapped[str] = mapped_column(
        String(50),
        unique=True,
        nullable=False,
    )

    license_status: Mapped[str] = mapped_column(
        String(50),
        nullable=False,
    )

    license_expiry: Mapped[date | None] = mapped_column(
        Date,
        nullable=True,
    )

    source_url: Mapped[str | None] = mapped_column(
        String(500),
        nullable=True,
    )

    last_verified_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
    )

    managed_by: Mapped[int] = mapped_column(
        ForeignKey("users.id"),
        nullable=False,
    )