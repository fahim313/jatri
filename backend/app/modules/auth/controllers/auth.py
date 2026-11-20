from fastapi import APIRouter, status

from app.modules.auth.dependencies import (
    AuthServiceDep,
    CurrentUserDep,
)
from app.modules.auth.schemas.users import (
    TokenResponse,
    UserLogin,
    UserRegister,
    UserResponse,
)

router = APIRouter()


@router.post(
    "/register",
    response_model=UserResponse,
    status_code=status.HTTP_201_CREATED,
)
async def register(
    user_data: UserRegister,
    service: AuthServiceDep,
):
    return await service.register_user(user_data)


@router.post(
    "/login",
    response_model=TokenResponse,
)
async def login(
    credentials: UserLogin,
    service: AuthServiceDep,
):
    return await service.login_user(credentials)


@router.get(
    "/me",
    response_model=UserResponse,
)
async def get_me(
    current_user: CurrentUserDep,
):
    return current_user