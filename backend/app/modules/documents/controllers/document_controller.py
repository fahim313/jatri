from typing import Annotated

from fastapi import APIRouter, File, Form, Query, UploadFile, status

from app.modules.auth.dependencies import AdminUserDep
from app.modules.documents.dependencies import DocumentServiceDep
from app.modules.documents.schemas.document_schema import (
    DocumentCreate,
    DocumentResponse,
    DocumentReview,
)

router = APIRouter()


@router.post(
    "/",
    response_model=DocumentResponse,
    status_code=status.HTTP_201_CREATED,
)
async def upload_document(
    service: DocumentServiceDep,
    current_user: AdminUserDep,
    file: Annotated[UploadFile, File()],
    title: Annotated[str, Form(min_length=1, max_length=255)],
    source_type: Annotated[str, Form(min_length=1, max_length=100)],
    description: Annotated[str | None, Form()] = None,
    source_url: Annotated[str | None, Form(max_length=500)] = None,
):
    document_data = DocumentCreate(
        title=title,
        source_type=source_type,
        description=description,
        source_url=source_url,
    )

    return await service.upload_document(
        document_data=document_data,
        file=file,
        managed_by=current_user.id,
    )


@router.get(
    "/",
    response_model=list[DocumentResponse],
)
async def get_documents(
    service: DocumentServiceDep,
    current_user: AdminUserDep,
    search: str | None = Query(default=None),
    document_status: str | None = Query(default=None, alias="status"),
):
    return await service.get_documents(
        status=document_status,
        search=search,
    )


@router.get(
    "/{document_id}",
    response_model=DocumentResponse,
)
async def get_document(
    document_id: int,
    service: DocumentServiceDep,
    current_user: AdminUserDep,
):
    return await service.get_document(document_id)


@router.patch(
    "/{document_id}/review",
    response_model=DocumentResponse,
)
async def review_document(
    document_id: int,
    review_data: DocumentReview,
    service: DocumentServiceDep,
    current_user: AdminUserDep,
):
    return await service.review_document(
        document_id=document_id,
        review_data=review_data,
        reviewer_id=current_user.id,
    )


@router.delete(
    "/{document_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
async def delete_document(
    document_id: int,
    service: DocumentServiceDep,
    current_user: AdminUserDep,
):
    await service.delete_document(document_id)