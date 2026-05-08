from pathlib import Path

from git import Repo


def init_repo(path: Path) -> Repo:
    path.mkdir(parents=True, exist_ok=True)
    return Repo.init(path)
