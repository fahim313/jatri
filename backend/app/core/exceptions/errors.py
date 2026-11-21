class AppError(Exception):
    """Base exception for all application errors."""

    def __init__(self, message: str = "An application error occurred"):
        self.message = message
        super().__init__(self.message)


class NotFoundError(AppError):
    """Raised when a resource is not found."""

    def __init__(self, resource: str, key: str):
        super().__init__(f"'{resource}' not found with key '{key}'")


class ConflictError(AppError):
    """Raised when a resource conflict occurs."""

    def __init__(self, resource: str, key: str):
        super().__init__(f"Conflict with '{resource}' and key '{key}'")


class UnauthorizedError(AppError):
    """Raised when authentication is missing or invalid."""

    def __init__(self, message: str = "Authentication required"):
        super().__init__(message)


class ForbiddenError(AppError):
    """Raised when a user does not have permission."""

    def __init__(self, message: str = "Permission denied"):
        super().__init__(message)


class LLMUnavailableError(AppError):
    """Raised when the LLM provider is unavailable."""

    def __init__(self, message: str = "LLM provider is unavailable"):
        super().__init__(message)