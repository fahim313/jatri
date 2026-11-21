from app.core.exceptions.errors import ConflictError, UnauthorizedError
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
            raise ConflictError("User", user_data.email)

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
            raise UnauthorizedError("Incorrect email or password")

        access_token = create_access_token(user.id)

        return TokenResponse(access_token=access_token)