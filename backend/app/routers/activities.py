from datetime import UTC, datetime
from pathlib import Path
from typing import Any

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database.crud import get_db
from app.models.assessment import Activity, Enrollment
from app.models.user import User
from app.utils.firebase_auth import get_current_user, require_roles

router = APIRouter(tags=["activities"])
TEMPLATE_ROOT = Path(__file__).resolve().parents[3] / "data" / "templates"
TEMPLATE_ROOT.mkdir(parents=True, exist_ok=True)


class ActivityCreate(BaseModel):
    title: str
    type: str
    description: str = ""
    tracking_level: str
    due_date: datetime | None = None


class ActivityStart(BaseModel):
    pass


class EnrollRequest(BaseModel):
    student_uids: list[str]


async def _get_or_create_user(db: AsyncSession, user: dict[str, Any]) -> User:
    result = await db.execute(select(User).where(User.firebase_uid == user["uid"]))
    existing = result.scalar_one_or_none()
    if existing:
        return existing

    created = User(firebase_uid=user["uid"], email=user.get("email", f"{user['uid']}@local"), role=user["role"])
    db.add(created)
    await db.commit()
    await db.refresh(created)
    return created


@router.post("/activities")
async def create_activity(
    payload: ActivityCreate,
    user: dict[str, Any] = Depends(require_roles("ta", "instructor")),
    db: AsyncSession = Depends(get_db),
) -> dict[str, Any]:
    creator = await _get_or_create_user(db, user)
    activity = Activity(
        title=payload.title,
        type=payload.type,
        description=payload.description,
        tracking_level=payload.tracking_level,
        due_date=payload.due_date,
        created_by=creator.id,
    )
    db.add(activity)
    await db.commit()
    await db.refresh(activity)
    return {"id": activity.id, "title": activity.title}


@router.get("/activities")
async def list_activities(
    user: dict[str, Any] = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> list[dict[str, Any]]:
    db_user = await _get_or_create_user(db, user)
    if db_user.role in {"ta", "instructor"}:
        result = await db.execute(select(Activity))
        activities = result.scalars().all()
        return [
            {
                "id": item.id,
                "title": item.title,
                "type": item.type,
                "tracking_level": item.tracking_level,
                "due_date": item.due_date.isoformat() if item.due_date else None,
            }
            for item in activities
        ]

    result = await db.execute(
        select(Activity, Enrollment).join(Enrollment, Enrollment.activity_id == Activity.id).where(Enrollment.student_id == db_user.id)
    )
    return [
        {
            "id": activity.id,
            "title": activity.title,
            "type": activity.type,
            "tracking_level": activity.tracking_level,
            "status": enrollment.status,
            "due_date": activity.due_date.isoformat() if activity.due_date else None,
        }
        for activity, enrollment in result.all()
    ]


@router.post("/activities/{activity_id}/start")
async def start_activity(
    activity_id: int,
    _: ActivityStart,
    user: dict[str, Any] = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> dict[str, Any]:
    db_user = await _get_or_create_user(db, user)
    result = await db.execute(
        select(Enrollment).where(Enrollment.activity_id == activity_id, Enrollment.student_id == db_user.id)
    )
    enrollment = result.scalar_one_or_none()
    if enrollment is None:
        enrollment = Enrollment(activity_id=activity_id, student_id=db_user.id)
        db.add(enrollment)
    enrollment.status = "in_progress"
    enrollment.started_at = datetime.now(UTC)
    await db.commit()
    return {"activity_id": activity_id, "student_id": db_user.id, "status": enrollment.status}


@router.post("/activities/{activity_id}/submit")
async def submit_activity(
    activity_id: int,
    _: ActivityStart,
    user: dict[str, Any] = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> dict[str, Any]:
    db_user = await _get_or_create_user(db, user)
    result = await db.execute(
        select(Enrollment).where(Enrollment.activity_id == activity_id, Enrollment.student_id == db_user.id)
    )
    enrollment = result.scalar_one_or_none()
    if enrollment is None:
        raise HTTPException(status_code=400, detail="Activity not started")
    enrollment.status = "submitted"
    enrollment.submitted_at = datetime.now(UTC)
    await db.commit()
    return {"activity_id": activity_id, "student_id": db_user.id, "status": enrollment.status}


@router.post("/activities/{activity_id}/template")
async def upload_template(
    activity_id: int,
    assignment_md: str = Form(...),
    _: dict[str, Any] = Depends(require_roles("ta", "instructor")),
) -> dict[str, Any]:
    activity_dir = TEMPLATE_ROOT / f"activity-{activity_id}"
    activity_dir.mkdir(parents=True, exist_ok=True)
    (activity_dir / "ASSIGNMENT.md").write_text(assignment_md, encoding="utf-8")
    return {"activity_id": activity_id, "template_path": str(activity_dir / "ASSIGNMENT.md")}


@router.post("/activities/{activity_id}/template-files")
async def upload_template_files(
    activity_id: int,
    files: list[UploadFile] = File(...),
    _: dict[str, Any] = Depends(require_roles("ta", "instructor")),
) -> dict[str, Any]:
    activity_dir = TEMPLATE_ROOT / f"activity-{activity_id}"
    activity_dir.mkdir(parents=True, exist_ok=True)
    saved = []
    for upload in files:
        target = activity_dir / upload.filename
        contents = await upload.read()
        target.parent.mkdir(parents=True, exist_ok=True)
        target.write_bytes(contents)
        saved.append(upload.filename)
    return {"activity_id": activity_id, "saved_files": saved}


@router.post("/activities/{activity_id}/enroll")
async def enroll_students(
    activity_id: int,
    payload: EnrollRequest,
    _: dict[str, Any] = Depends(require_roles("ta", "instructor")),
    db: AsyncSession = Depends(get_db),
) -> dict[str, Any]:
    enrolled = 0
    for uid in payload.student_uids:
        result = await db.execute(select(User).where(User.firebase_uid == uid))
        user = result.scalar_one_or_none()
        if not user:
            user = User(firebase_uid=uid, email=f"{uid}@local", role="student")
            db.add(user)
            await db.flush()

        existing = await db.execute(
            select(Enrollment).where(Enrollment.activity_id == activity_id, Enrollment.student_id == user.id)
        )
        if existing.scalar_one_or_none():
            continue

        db.add(Enrollment(activity_id=activity_id, student_id=user.id))
        enrolled += 1

    await db.commit()
    return {"activity_id": activity_id, "enrolled_count": enrolled}


@router.get("/activities/{activity_id}/submissions")
async def list_submissions(
    activity_id: int,
    _: dict[str, Any] = Depends(require_roles("ta", "instructor")),
    db: AsyncSession = Depends(get_db),
) -> list[dict[str, Any]]:
    result = await db.execute(
        select(Enrollment, User)
        .join(User, User.id == Enrollment.student_id)
        .where(Enrollment.activity_id == activity_id)
    )
    return [
        {
            "student_uid": user.firebase_uid,
            "student_email": user.email,
            "status": enrollment.status,
            "started_at": enrollment.started_at.isoformat() if enrollment.started_at else None,
            "submitted_at": enrollment.submitted_at.isoformat() if enrollment.submitted_at else None,
        }
        for enrollment, user in result.all()
    ]
