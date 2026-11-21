from typing import Annotated

from fastapi import Depends

from app.db.session import SessionDep
from app.modules.jobs.repositories.jobs import JobRepository
from app.modules.jobs.services.jobs import JobService


def get_job_service(session: SessionDep) -> JobService:
    repository = JobRepository(session)
    return JobService(repository)


JobServiceDep = Annotated[
    JobService,
    Depends(get_job_service),
]