import asyncio
from datetime import UTC, date, datetime, timedelta

from sqlalchemy import select

from app.core.config import get_settings
from app.db.session import SessionLocal
from app.modules.auth.repositories.users import UserRepository
from app.modules.jobs.models.jobs import JobOffer

settings = get_settings()

DEMO_JOBS = [
    {
        "country": "Saudi Arabia",
        "job_title": "Construction Worker",
        "salary": "1200 SAR/month",
        "requirements": "Basic construction experience. Physically fit.",
        "vacancies": 50,
        "application_deadline": date.today() + timedelta(days=30),
        "status": "Published",
    },
    {
        "country": "Malaysia",
        "job_title": "Factory Worker",
        "salary": "1500 MYR/month",
        "requirements": "Basic education. Factory experience preferred.",
        "vacancies": 100,
        "application_deadline": date.today() + timedelta(days=45),
        "status": "Published",
    },
    {
        "country": "Qatar",
        "job_title": "Electrician",
        "salary": "1800 QAR/month",
        "requirements": "Diploma or relevant experience in electrical work.",
        "vacancies": 20,
        "application_deadline": date.today() + timedelta(days=20),
        "status": "Published",
    },
    {
        "country": "United Arab Emirates",
        "job_title": "Plumber",
        "salary": "1600 AED/month",
        "requirements": "At least 2 years of plumbing experience.",
        "vacancies": 15,
        "application_deadline": date.today() + timedelta(days=60),
        "status": "Draft",
    },
    {
        "country": "Singapore",
        "job_title": "Welding Worker",
        "salary": "1800 SGD/month",
        "requirements": "Welding experience and relevant technical skills.",
        "vacancies": 25,
        "application_deadline": date.today() + timedelta(days=40),
        "status": "Draft",
    },
    {
        "country": "Kuwait",
        "job_title": "General Labour",
        "salary": "100 KWD/month",
        "requirements": "Basic physical fitness and willingness to work.",
        "vacancies": 30,
        "application_deadline": date.today() - timedelta(days=10),
        "status": "Expired",
    },
]


async def seed_jobs():
    async with SessionLocal() as session:
        user_repository = UserRepository(session)
        admin = await user_repository.get_by_email(
            settings.SEED_ADMIN_EMAIL
        )

        if not admin:
            raise RuntimeError(
                "Seed admin not found. Check SEED_ADMIN_EMAIL in .env."
            )

        created = 0
        skipped = 0

        for job_data in DEMO_JOBS:
            result = await session.execute(
                select(JobOffer).where(
                    JobOffer.country == job_data["country"],
                    JobOffer.job_title == job_data["job_title"],
                )
            )
            existing_job = result.scalar_one_or_none()

            if existing_job:
                skipped += 1
                continue

            source_url = (
                f"https://example.com/demo-boesl-circular/"
                f"{job_data['country'].lower().replace(' ', '-')}"
            )

            last_verified_at = (
                datetime.now(UTC)
                if job_data["status"] == "Published"
                else None
            )

            job = JobOffer(
                **job_data,
                source_url=source_url,
                last_verified_at=last_verified_at,
                managed_by=admin.id,
            )

            session.add(job)
            created += 1

        await session.commit()

        print("Job seeding completed.")
        print(f"Created: {created}")
        print(f"Skipped: {skipped}")


if __name__ == "__main__":
    asyncio.run(seed_jobs())