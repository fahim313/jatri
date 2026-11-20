import asyncio
from datetime import date

from sqlalchemy import select

from app.db.session import SessionLocal
from app.modules.agencies.models.agencies import Agency
from app.modules.auth.repositories.users import UserRepository


async def seed_agencies():
    async with SessionLocal() as session:
        admin_repository = UserRepository(session)

        admin = await admin_repository.get_by_email(
            "admin@jatri.com"
        )

        if admin is None or admin.role != "admin":
            print("Admin account not found.")
            return

        agencies_data = [
            {
                "name": "ABC Recruiting Agency",
                "rl_number": "RL1234",
                "license_status": "Active",
                "license_expiry": date(2027, 12, 31),
                "managed_by": admin.id,
            },
            {
                "name": "Global Manpower Services",
                "rl_number": "RL5678",
                "license_status": "Active",
                "license_expiry": date(2028, 6, 30),
                "managed_by": admin.id,
            },
            {
                "name": "Bangladesh Overseas Employment",
                "rl_number": "RL9012",
                "license_status": "Expired",
                "license_expiry": date(2025, 12, 31),
                "managed_by": admin.id,
            },
        ]

        for agency_data in agencies_data:
            result = await session.execute(
                select(Agency).where(
                    Agency.rl_number == agency_data["rl_number"]
                )
            )

            existing_agency = result.scalar_one_or_none()

            if existing_agency:
                continue

            session.add(Agency(**agency_data))

        await session.commit()

        print("Agency seed completed.")


if __name__ == "__main__":
    asyncio.run(seed_agencies())