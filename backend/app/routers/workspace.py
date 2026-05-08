from pathlib import Path
from typing import Any

from fastapi import APIRouter, Depends, HTTPException
from git import Repo
from pydantic import BaseModel

from app.utils.firebase_auth import get_current_user

router = APIRouter(tags=["workspace"])

ROOT = Path(__file__).resolve().parents[3] / "data" / "workspaces"
ROOT.mkdir(parents=True, exist_ok=True)


class FilePayload(BaseModel):
    content: str


def _workspace_path(workspace_id: str, uid: str) -> Path:
    path = ROOT / f"{uid}-{workspace_id}"
    path.mkdir(parents=True, exist_ok=True)
    return path


def _ensure_repo(path: Path) -> Repo:
    if (path / ".git").exists():
        return Repo(path)
    repo = Repo.init(path)
    starter = path / "main.py"
    starter.write_text("print('hello from ProctorIDE')\n", encoding="utf-8")
    repo.git.add(A=True)
    repo.index.commit("Initial starter workspace")
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
) -> dict[str, dict[str, str]]:
    path = _workspace_path(workspace_id, user["uid"])
    _ensure_repo(path)
    files: dict[str, str] = {}
    for file in path.rglob("*"):
        if file.is_file() and ".git" not in file.parts:
            files[str(file.relative_to(path))] = file.read_text(encoding="utf-8")
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
) -> dict[str, list[dict[str, str]]]:
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
