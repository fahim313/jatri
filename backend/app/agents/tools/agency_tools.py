import logging
from datetime import date, datetime
from zoneinfo import ZoneInfo

from langchain_core.tools import tool
from sqlalchemy.ext.asyncio import AsyncSession

from app.modules.agencies.repositories.agencies import AgencyRepository

logger = logging.getLogger(__name__)

DHAKA = ZoneInfo("Asia/Dhaka")

MAX_RESULTS = 5
EXPIRING_SOON_DAYS = 30
STALE_AFTER_DAYS = 30


def _normalize_rl(value: str | None) -> str | None:
    value = (value or "").strip().upper()
    return value or None


def _normalize_name(value: str | None) -> str | None:
    value = (value or "").strip()
    return value or None


def _to_dhaka_datetime(value: datetime) -> datetime:
    if value.tzinfo is None:
        return value.replace(tzinfo=DHAKA)

    return value.astimezone(DHAKA)


def _expiry_info(expiry, today: date) -> dict:
    if isinstance(expiry, datetime):
        expiry = _to_dhaka_datetime(expiry).date()

    if not isinstance(expiry, date):
        return {
            "license_expiry": None,
            "expiry_state": "unknown",
            "days_remaining": None,
        }

    days_remaining = (expiry - today).days

    if days_remaining < 0:
        state = "expired"
    elif days_remaining <= EXPIRING_SOON_DAYS:
        state = "expiring_soon"
    else:
        state = "valid"

    return {
        "license_expiry": expiry.isoformat(),
        "expiry_state": state,
        "days_remaining": days_remaining,
    }


def _verification_info(verified_at, now: datetime) -> dict:
    if not isinstance(verified_at, datetime):
        return {
            "last_verified_at": None,
            "days_since_verified": None,
            "is_stale": True,
        }

    verified_at = _to_dhaka_datetime(verified_at)
    days = (now - verified_at).days

    return {
        "last_verified_at": verified_at.isoformat(),
        "days_since_verified": days,
        "is_stale": days > STALE_AFTER_DAYS,
    }


def _build_agency_record(agency, today: date, now: datetime) -> dict:
    expiry = _expiry_info(agency.license_expiry, today)
    verification = _verification_info(agency.last_verified_at, now)

    license_status = agency.license_status
    normalized_status = (license_status or "").strip().lower()

    data_conflict = (
        normalized_status == "active"
        and expiry["expiry_state"] == "expired"
    )

    return {
        "id": agency.id,
        "name": agency.name,
        "rl_number": agency.rl_number,
        "license_status": license_status,
        **expiry,
        "data_conflict": data_conflict,
        "source_url": agency.source_url,
        **verification,
    }


def create_agency_tools(session: AsyncSession):
    repository = AgencyRepository(session)

    @tool
    async def verify_agency(
        rl_number: str | None = None,
        name: str | None = None,
    ) -> dict:
        """Verify recruiting agency information using Jatri's agency records.

        Search by exact RL number first. If it does not match, search
        by agency name when a name is provided.

        Possible statuses:
        - found: a matching agency record was found.
        - rl_mismatch: the supplied RL number did not match, but
          one or more agencies matched the supplied name.
        - ambiguous: multiple agencies matched the supplied name.
        - not_found: no matching agency information is available.
        - invalid_input: neither an agency name nor RL number was provided.
        - error: a temporary lookup problem occurred.

        Never present a name match as a confirmed RL number match.
        Keep license_status separate from the calculated expiry_state.
        Report stale records and data conflicts accurately.
        Never claim an agency is legitimate based only on a database match.
        """

        rl = _normalize_rl(rl_number)
        agency_name = _normalize_name(name)

        if not rl and not agency_name:
            return {
                "status": "invalid_input",
                "message": "An agency name or RL number is required.",
                "agencies": [],
            }

        try:
            agencies = await repository.search_for_verification(
                rl_number=rl,
                name=agency_name,
            )
        except Exception:
            logger.exception(
                "Agency verification lookup failed. RL number: %s",
                rl,
            )

            return {
                "status": "error",
                "message": (
                    "Agency information could not be checked right now. "
                    "Please try again later."
                ),
                "agencies": [],
            }

        if not agencies:
            return {
                "status": "not_found",
                "message": (
                    "আপনার দেওয়া এজেন্সির তথ্য এই মুহূর্তে আমাদের কাছে নেই। "
                    "তাই এজেন্সিটি সম্পর্কে নিশ্চিত কোনো তথ্য দিতে পারছি না। "
                    "আপনি চাইলে অন্য কোনো এজেন্সির তথ্য জানতে পারেন।"
                ),
                "agencies": [],
            }

        rl_matches = [
            agency
            for agency in agencies
            if rl and _normalize_rl(agency.rl_number) == rl
        ]

        if rl_matches:
            status = "found"
            matched_by = "rl_number"
            matched_agencies = rl_matches

        elif rl:
            status = "rl_mismatch"
            matched_by = "name"
            matched_agencies = agencies

        else:
            matched_by = "name"
            matched_agencies = agencies
            status = "ambiguous" if len(agencies) > 1 else "found"

        total_count = len(matched_agencies)
        matched_agencies = matched_agencies[:MAX_RESULTS]

        now = datetime.now(DHAKA)
        today = now.date()

        agency_records = [
            _build_agency_record(agency, today, now)
            for agency in matched_agencies
        ]

        if status == "rl_mismatch":
            message = (
                "The provided RL number does not match the agency record. "
                "The name-matched agencies are not confirmed matches "
                "for the supplied RL number."
            )
        elif status == "ambiguous":
            message = (
                "Multiple agencies matched the provided name. "
                "Ask the user for the RL number or another identifier."
            )
        else:
            message = "Matching agency record found."

        return {
            "status": status,
            "message": message,
            "matched_by": matched_by,
            "count": len(agency_records),
            "total_count": total_count,
            "agencies": agency_records,
        }

    return [verify_agency]
