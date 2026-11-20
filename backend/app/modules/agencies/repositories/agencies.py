from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.modules.agencies.models.agencies import Agency


class AgencyRepository:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def create(self, agency_data: dict) -> Agency:
        agency = Agency(**agency_data)

        self.session.add(agency)
        await self.session.flush()
        await self.session.refresh(agency)

        return agency

    async def get_by_id(self, agency_id: int) -> Agency | None:
        result = await self.session.execute(
            select(Agency).where(Agency.id == agency_id)
        )
        return result.scalar_one_or_none()

    async def get_all(
        self,
        search: str | None = None,
    ) -> list[Agency]:
        query = select(Agency)

        if search:
            query = query.where(
                Agency.name.ilike(f"%{search}%")
                | Agency.rl_number.ilike(f"%{search}%")
            )

        query = query.order_by(Agency.id.desc())

        result = await self.session.execute(query)
        return list(result.scalars().all())

    async def update(self, agency: Agency, agency_data: dict) -> Agency:
        for field, value in agency_data.items():
            setattr(agency, field, value)

        await self.session.flush()
        await self.session.refresh(agency)

        return agency

    async def delete(self, agency: Agency) -> None:
        await self.session.delete(agency)
        await self.session.flush()