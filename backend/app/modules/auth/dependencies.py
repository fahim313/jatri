from typing import Annotated

import jwt
from fastapi import Depends
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from app.core.exceptions.errors import ForbiddenError, UnauthorizedError
from app.core.security import decode_access_token
from app.db.session import SessionDep
from app.modules.auth.models.users import User
from app.modules.auth.repositories.users import UserRepository
from app.modules.auth.services.auth import AuthService

bearer_scheme = HTTPBearer(auto_error=False)


async def get_current_user(
    credentials: Annotated[
        HTTPAuthorizationCredentials | None,
        Depends(bearer_scheme),
    ],
    session: SessionDep,
) -> User:
    if credentials is None:
        raise UnauthorizedError("Not authenticated")

    try:
        token = credentials.credentials
        payload = decode_access_token(token)
        user_id = int(payload["sub"])
    except (jwt.InvalidTokenError, KeyError, ValueError):
        raise UnauthorizedError("Could not validate credentials") from None

    repository = UserRepository(session)
    user = await repository.get_by_id(user_id)

    if user is None:
        raise UnauthorizedError("Could not validate credentials")

    return user


async def get_admin_user(
    current_user: Annotated[User, Depends(get_current_user)],
) -> User:
    if current_user.role != "admin":
        raise ForbiddenError("Admin access required")

    return current_user


CurrentUserDep = Annotated[
    User,
    Depends(get_current_user),
]


AdminUserDep = Annotated[
    User,
    Depends(get_admin_user),
]


def get_auth_service(
    session: SessionDep,
) -> AuthService:
    repository = UserRepository(session)
    return AuthService(repository)


AuthServiceDep = Annotated[
    AuthService,
    Depends(get_auth_service),
]