import asyncio
from getpass import getpass

from app.core.security import hash_password
from app.db.session import SessionLocal
from app.modules.auth.models.users import User
from app.modules.auth.repositories.users import UserRepository


async def create_admin():
    name = input("Admin name: ").strip()
    email = input("Admin email: ").strip().lower()
    password = getpass("Admin password: ")
    confirm_password = getpass("Confirm password: ")

    if not name or not email or not password:
        print("All fields are required.")
        return

    if password != confirm_password:
        print("Passwords do not match.")
        return

    async with SessionLocal() as session:
        repository = UserRepository(session)

        existing_user = await repository.get_by_email(email)

        if existing_user:
            print("An account with this email already exists.")
            return

        admin = User(
            name=name,
            email=email,
            password_hash=hash_password(password),
            role="admin",
        )

        session.add(admin)
        await session.commit()

        print(f"Admin account created successfully: {admin.email}")


if __name__ == "__main__":
    asyncio.run(create_admin())