import logging
from datetime import date, datetime

from langchain_core.tools import tool
from sqlalchemy.ext.asyncio import AsyncSession

from app.modules.jobs.repositories.jobs import JobRepository

logger = logging.getLogger(__name__)


def create_job_tools(session: AsyncSession):
    repository = JobRepository(session)

    @tool
    async def search_jobs(
        search: str | None = None,
        country: str | None = None,
    ) -> dict:
        """Search published job offers from the Jatri PostgreSQL database.

        Use search for a job title or general job keyword.
        Use country to filter jobs by destination country.

        Only published jobs are returned. Never show draft jobs.

        If no filters are provided, return all published jobs.

        Return one of these statuses:
        - found: matching published jobs were found.
        - not_found: no matching published jobs are available.
        - error: a database lookup failed.

        Never invent or assume job information that is not in the database.
        """

        search_term = (search or "").strip() or None
        country_name = (country or "").strip() or None

        try:
            jobs = await repository.get_all(
                search=search_term,
                country=country_name,
                status="Published",
            )
        except Exception:
            logger.exception(
                "Job search failed. Search: %s, Country: %s",
                search_term,
                country_name,
            )

            return {
                "status": "error",
                "message": (
                    "চাকরির তথ্য এই মুহূর্তে যাচাই করা যাচ্ছে না। "
                    "অনুগ্রহ করে কিছুক্ষণ পর আবার চেষ্টা করুন।"
                ),
                "count": 0,
                "jobs": [],
            }

        if not jobs:
            return {
                "status": "not_found",
                "message": (
                    "আপনার চাওয়া চাকরির তথ্য এই মুহূর্তে আমাদের কাছে নেই। "
                    "আপনি চাইলে অন্য কোনো দেশ বা চাকরির বিষয়ে জানতে পারেন।"
                ),
                "count": 0,
                "jobs": [],
            }

        job_records = []

        for job in jobs:
            deadline = job.application_deadline
            last_verified = job.last_verified_at

            job_records.append(
                {
                    "id": job.id,
                    "job_title": job.job_title,
                    "country": job.country,
                    "salary": job.salary,
                    "requirements": job.requirements,
                    "vacancies": job.vacancies,
                    "application_deadline": (
                        deadline.isoformat()
                        if isinstance(deadline, (date, datetime))
                        else None
                    ),
                    "source_url": job.source_url,
                    "status": job.status,
                    "last_verified_at": (
                        last_verified.isoformat()
                        if isinstance(last_verified, datetime)
                        else None
                    ),
                }
            )

        return {
            "status": "found",
            "message": "Published job offers retrieved successfully.",
            "count": len(job_records),
            "jobs": job_records,
        }

    return [search_jobs]
