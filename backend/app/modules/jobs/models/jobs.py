from datetime import date, datetime

from sqlalchemy import Date, DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class JobOffer(Base):
    __tablename__ = "job_offers"

    id: Mapped[int] = mapped_column(primary_key=True)

    country: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
    )

    job_title: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
    )

    salary: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
    )

    requirements: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )

    vacancies: Mapped[int | None] = mapped_column(
        Integer,
        nullable=True,
    )

    application_deadline: Mapped[date | None] = mapped_column(
        Date,
        nullable=True,
    )

    source_url: Mapped[str | None] = mapped_column(
        String(500),
        nullable=True,
    )

    status: Mapped[str] = mapped_column(
        String(50),
        default="Draft",
        nullable=False,
    )

    last_verified_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
    )

    managed_by: Mapped[int] = mapped_column(
        ForeignKey("users.id"),
        nullable=False,
    )