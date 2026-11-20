from fastapi import APIRouter, Query, status

from app.modules.agencies.dependencies import AgencyServiceDep
from app.modules.agencies.schemas.agencies import (
    AgencyCreate,
    AgencyResponse,
    AgencyUpdate,
)
from app.modules.auth.dependencies import AdminUserDep

router = APIRouter()


@router.post(
    "/",
    response_model=AgencyResponse,
    status_code=status.HTTP_201_CREATED,
)
async def create_agency(
    agency_data: AgencyCreate,
    service: AgencyServiceDep,
    current_user: AdminUserDep,
):
    return await service.create_agency(
        agency_data,
        managed_by=current_user.id,
    )


@router.get("/", response_model=list[AgencyResponse])
async def get_agencies(
    service: AgencyServiceDep,
    search: str | None = Query(default=None),
):
    return await service.get_agencies(search=search)


@router.get("/{agency_id}", response_model=AgencyResponse)
async def get_agency(
    agency_id: int,
    service: AgencyServiceDep,
):
    return await service.get_agency(agency_id)


@router.patch("/{agency_id}", response_model=AgencyResponse)
async def update_agency(
    agency_id: int,
    agency_data: AgencyUpdate,
    service: AgencyServiceDep,
    current_user: AdminUserDep,
):
    return await service.update_agency(agency_id, agency_data)


@router.delete(
    "/{agency_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
async def delete_agency(
    agency_id: int,
    service: AgencyServiceDep,
    current_user: AdminUserDep,
):
    await service.delete_agency(agency_id)