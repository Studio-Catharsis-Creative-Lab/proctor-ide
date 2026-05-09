import shutil
from pathlib import Path
from typing import Any

from fastapi import APIRouter, Depends, HTTPException
from git import Repo
from pydantic import BaseModel

from app.utils.firebase_auth import get_current_user

router = APIRouter(tags=["workspace"])

REPO_ROOT = Path(__file__).resolve().parents[3]
ROOT = REPO_ROOT / "data" / "workspaces"
ROOT.mkdir(parents=True, exist_ok=True)
# Course notebooks shipped in-repo; copied into each user workspace once (live edits stay under data/workspaces).
COURSE_PYTHON_SEED = REPO_ROOT / "workspace" / "classes" / "python"


class FilePayload(BaseModel):
    content: str


def _workspace_path(workspace_id: str, uid: str) -> Path:
    path = ROOT / f"{uid}-{workspace_id}"
    path.mkdir(parents=True, exist_ok=True)
    return path


def _seed_classes_python(workspace: Path) -> None:
    """Copy bundled course notebooks into workspace/classes/python if not present yet."""
    if not COURSE_PYTHON_SEED.is_dir():
        return
    dest = workspace / "classes" / "python"
    if dest.exists() and any(dest.iterdir()):
        return
    if dest.exists():
        shutil.rmtree(dest)
    dest.parent.mkdir(parents=True, exist_ok=True)
    shutil.copytree(COURSE_PYTHON_SEED, dest)


def _ensure_repo(path: Path) -> Repo:
    if (path / ".git").exists():
        repo = Repo(path)
    else:
        repo = Repo.init(path)
        starter = path / "main.py"
        starter.write_text("print('hello from ProctorIDE')\n", encoding="utf-8")
        repo.git.add(A=True)
        repo.index.commit("Initial starter workspace")

    _seed_classes_python(path)
    if repo.is_dirty(untracked_files=True):
        repo.git.add(A=True)
        repo.index.commit("Seed classes/python course notebooks")
    return repo


def _resolve_workspace_target(workspace: Path, relative_path: str) -> Path:
    normalized = relative_path.replace("\\", "/")
    candidate = (workspace / normalized).resolve()
    workspace_root = workspace.resolve()
    if workspace_root == candidate:
        raise HTTPException(status_code=400, detail="Cannot write to workspace root")
    if workspace_root not in candidate.parents:
        raise HTTPException(status_code=400, detail="Invalid file path")
    return candidate


@router.get("/workspace/{workspace_id}/files")
async def list_files(
    workspace_id: str,
    user: dict[str, Any] = Depends(get_current_user),
) -> dict[str, Any]:
    path = _workspace_path(workspace_id, user["uid"])
    _ensure_repo(path)
    files: dict[str, str] = {}
    for file in path.rglob("*"):
        if file.is_file() and ".git" not in file.parts:
            # Always POSIX-style keys so the frontend can split on "/".
            rel = file.relative_to(path).as_posix()
            files[rel] = file.read_text(encoding="utf-8")
    return {"workspace_id": workspace_id, "files": files}


@router.put("/workspace/{workspace_id}/files/{path:path}")
async def update_file(
    workspace_id: str,
    path: str,
    payload: FilePayload,
    user: dict[str, Any] = Depends(get_current_user),
) -> dict[str, str]:
    workspace = _workspace_path(workspace_id, user["uid"])
    repo = _ensure_repo(workspace)
    target = _resolve_workspace_target(workspace, path)
    target.parent.mkdir(parents=True, exist_ok=True)
    target.write_text(payload.content, encoding="utf-8")
    repo.git.add(A=True)
    repo.index.commit(f"Update {path}")
    return {"workspace_id": workspace_id, "path": path, "status": "saved"}


@router.get("/workspace/{workspace_id}/log")
async def log(
    workspace_id: str,
    user: dict[str, Any] = Depends(get_current_user),
) -> dict[str, Any]:
    workspace = _workspace_path(workspace_id, user["uid"])
    repo = _ensure_repo(workspace)
    timeline = [
        {"id": commit.hexsha[:8], "summary": commit.message.strip(), "timestamp": commit.committed_datetime.isoformat()}
        for commit in repo.iter_commits("HEAD", max_count=25)
    ]
    return {"workspace_id": workspace_id, "timeline": timeline}


@router.post("/workspace/{workspace_id}/restore/{commit_id}")
async def restore(
    workspace_id: str,
    commit_id: str,
    user: dict[str, Any] = Depends(get_current_user),
) -> dict[str, str]:
    workspace = _workspace_path(workspace_id, user["uid"])
    repo = _ensure_repo(workspace)
    try:
        repo.git.checkout(commit_id, "--", ".")
        repo.git.add(A=True)
        repo.index.commit(f"Restore to {commit_id}")
    except Exception as exc:
        raise HTTPException(status_code=400, detail=f"Failed to restore commit: {exc}") from exc
    return {"workspace_id": workspace_id, "restored_to": commit_id}
