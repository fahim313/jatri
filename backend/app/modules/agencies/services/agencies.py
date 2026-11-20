from fastapi import HTTPException, status

from app.modules.agencies.repositories.agencies import AgencyRepository
from app.modules.agencies.schemas.agencies import AgencyCreate, AgencyUpdate


class AgencyService:
    def __init__(self, repository: AgencyRepository):
        self.repository = repository

    async def create_agency(
        self,
        agency_data: AgencyCreate,
        managed_by: int,
    ):
        agency = await self.repository.create(
            {
                **agency_data.model_dump(),
                "managed_by": managed_by,
            }
        )
        await self.repository.session.commit()
        return agency

    async def get_agency(self, agency_id: int):
        agency = await self.repository.get_by_id(agency_id)

        if not agency:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Agency not found",
            )

        return agency

    async def get_agencies(self):
        return await self.repository.get_all()

    async def update_agency(
        self,
        agency_id: int,
        agency_data: AgencyUpdate,
    ):
        agency = await self.get_agency(agency_id)

        updated_agency = await self.repository.update(
            agency,
            agency_data.model_dump(exclude_unset=True),
        )

        await self.repository.session.commit()
        return updated_agency

    async def delete_agency(self, agency_id: int):
        agency = await self.get_agency(agency_id)

        await self.repository.delete(agency)
        await self.repository.session.commit()