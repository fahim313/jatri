from fastapi import HTTPException, status

from app.core.security import (
    create_access_token,
    hash_password,
    verify_password,
)
from app.modules.auth.repositories.users import UserRepository
from app.modules.auth.schemas.users import (
    TokenResponse,
    UserLogin,
    UserRegister,
)


class AuthService:
    def __init__(self, repository: UserRepository):
        self.repository = repository

    async def register_user(self, user_data: UserRegister):
        existing_user = await self.repository.get_by_email(
            user_data.email
        )

        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Email already registered",
            )

        user = await self.repository.create(
            {
                "name": user_data.name,
                "email": user_data.email,
                "password_hash": hash_password(user_data.password),
            }
        )

        await self.repository.session.commit()

        return user

    async def login_user(self, credentials: UserLogin) -> TokenResponse:
        user = await self.repository.get_by_email(credentials.email)

        if not user or not verify_password(
            credentials.password,
            user.password_hash,
        ):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect email or password",
                headers={"WWW-Authenticate": "Bearer"},
            )

        access_token = create_access_token(user.id)

        return TokenResponse(access_token=access_token)