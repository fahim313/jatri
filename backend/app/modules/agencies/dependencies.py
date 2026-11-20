from typing import Annotated

from fastapi import Depends

from app.db.session import SessionDep
from app.modules.agencies.repositories.agencies import AgencyRepository
from app.modules.agencies.services.agencies import AgencyService


def get_agency_service(
    session: SessionDep,
) -> AgencyService:
    repository = AgencyRepository(session)
    return AgencyService(repository)


AgencyServiceDep = Annotated[
    AgencyService,
    Depends(get_agency_service),
]