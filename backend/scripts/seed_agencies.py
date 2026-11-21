from datetime import UTC, date, datetime

from sqlalchemy import select

from app.core.config import get_settings
from app.db.session import SessionLocal
from app.modules.agencies.models.agencies import Agency
from app.modules.auth.repositories.users import UserRepository

settings = get_settings()

SOURCE_URL = "https://raims.bmet.gov.bd/"

AGENCIES = [
    {
        "name": "Demo Overseas Ltd.",
        "rl_number": "RL1234",
        "license_status": "Active",
        "license_expiry": date(2027, 12, 31),
        "last_verified_at": datetime(
            2026, 11, 18, 10, 30, tzinfo=UTC
        ),
    },
    {
        "name": "Demo Manpower Services",
        "rl_number": "RL5678",
        "license_status": "Active",
        "license_expiry": date(2027, 6, 30),
        "last_verified_at": datetime(
            2026, 11, 15, 9, 0, tzinfo=UTC
        ),
    },
    {
        "name": "Demo International Recruiting",
        "rl_number": "RL9012",
        "license_status": "Expired",
        "license_expiry": date(2025, 12, 31),
        "last_verified_at": datetime(
            2026, 10, 28, 11, 0, tzinfo=UTC
        ),
    },
    {
        "name": "Demo Global Employment",
        "rl_number": "RL2345",
        "license_status": "Suspended",
        "license_expiry": date(2027, 3, 31),
        "last_verified_at": datetime(
            2026, 11, 10, 14, 0, tzinfo=UTC
        ),
    },
    {
        "name": "Demo Human Resources",
        "rl_number": "RL3456",
        "license_status": "Active",
        "license_expiry": date(2028, 1, 31),
        "last_verified_at": datetime(
            2026, 11, 19, 8, 30, tzinfo=UTC
        ),
    },
    {
        "name": "Demo Export Manpower",
        "rl_number": "RL4567",
        "license_status": "Cancelled",
        "license_expiry": date(2025, 6, 30),
        "last_verified_at": datetime(
            2026, 10, 20, 12, 0, tzinfo=UTC
        ),
    },
    {
        "name": "Demo Overseas Employment",
        "rl_number": "RL6789",
        "license_status": "Active",
        "license_expiry": date(2027, 9, 30),
        "last_verified_at": datetime(
            2026, 11, 12, 15, 30, tzinfo=UTC
        ),
    },
    {
        "name": "Demo Migration Services",
        "rl_number": "RL7890",
        "license_status": "Expired",
        "license_expiry": date(2025, 3, 31),
        "last_verified_at": datetime(
            2026, 10, 25, 10, 0, tzinfo=UTC
        ),
    },
    {
        "name": "Demo International Manpower",
        "rl_number": "RL8901",
        "license_status": "Active",
        "license_expiry": date(2028, 5, 31),
        "last_verified_at": datetime(
            2026, 11, 17, 13, 0, tzinfo=UTC
        ),
    },
    {
        "name": "Demo Career Solutions",
        "rl_number": "RL0123",
        "license_status": "Suspended",
        "license_expiry": date(2026, 8, 31),
        "last_verified_at": datetime(
            2026, 11, 5, 9, 30, tzinfo=UTC
        ),
    },
]


async def seed_agencies() -> None:
    async with SessionLocal() as session:
        user_repository = UserRepository(session)

        admin = await user_repository.get_by_email(
            settings.SEED_ADMIN_EMAIL
        )

        if not admin:
            print(
                f"Admin not found: {settings.SEED_ADMIN_EMAIL}"
            )
            print("Run create_admin.py first.")
            return

        created_count = 0
        skipped_count = 0

        try:
            for agency_data in AGENCIES:
                result = await session.execute(
                    select(Agency).where(
                        Agency.rl_number == agency_data["rl_number"]
                    )
                )

                existing_agency = result.scalar_one_or_none()

                if existing_agency:
                    skipped_count += 1
                    continue

                agency = Agency(
                    **agency_data,
                    source_url=SOURCE_URL,
                    managed_by=admin.id,
                )

                session.add(agency)
                created_count += 1

            await session.commit()

        except Exception:
            await session.rollback()
            raise

        print("Agency seeding completed.")
        print(f"Created: {created_count}")
        print(f"Skipped: {skipped_count}")


if __name__ == "__main__":
    import asyncio

    asyncio.run(seed_agencies())