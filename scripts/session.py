#!/usr/bin/env python3
"""Manage Flux session files without modifying Git or project source files."""

from __future__ import annotations

import argparse
import json
import os
import re
import subprocess
import sys
from contextlib import contextmanager
from datetime import datetime
from pathlib import Path
from typing import Iterator

SESSION_NAME_PATTERN = re.compile(r"^[a-z0-9]+(?:-[a-z0-9]+)*$")


class SessionError(Exception):
    """A recoverable session-state error."""


def get_paths(root: Path) -> tuple[Path, Path]:
    root = root.resolve()
    if not root.is_dir():
        raise SessionError(f"project root is not a directory: {root}")
    sessions_dir = root / ".flux" / "sessions"
    return sessions_dir, sessions_dir / ".current-session"


def initialize(root: Path) -> Path:
    sessions_dir, pointer_path = get_paths(root)
    sessions_dir.mkdir(parents=True, exist_ok=True)
    pointer_path.touch(exist_ok=True)
    return sessions_dir


def write_atomic(path: Path, content: str) -> None:
    temporary_path = path.with_name(f".{path.name}.{os.getpid()}.tmp")
    try:
        temporary_path.write_text(content, encoding="utf-8")
        temporary_path.replace(path)
    finally:
        temporary_path.unlink(missing_ok=True)


@contextmanager
def session_lock(root: Path) -> Iterator[None]:
    sessions_dir = initialize(root)
    lock_path = sessions_dir / ".lock"
    try:
        lock_path.mkdir()
    except FileExistsError as error:
        raise SessionError("session state is locked by another process") from error
    try:
        yield
    finally:
        lock_path.rmdir()


def read_git_metadata(root: Path) -> tuple[str, str]:
    def run_git(*arguments: str) -> str:
        result = subprocess.run(
            ["git", "-C", str(root.resolve()), *arguments],
            check=True,
            capture_output=True,
            text=True,
        )
        return result.stdout.strip()

    try:
        return run_git("branch", "--show-current") or "detached", run_git("rev-parse", "HEAD")
    except (FileNotFoundError, subprocess.CalledProcessError):
        return "unavailable", "unavailable"


def read_active_path(root: Path) -> Path | None:
    sessions_dir, pointer_path = get_paths(root)
    if not pointer_path.exists():
        return None

    filename = pointer_path.read_text(encoding="utf-8").strip()
    if not filename:
        return None
    if Path(filename).name != filename or not filename.endswith(".md"):
        raise SessionError("active session pointer contains an invalid filename")

    session_path = sessions_dir / filename
    if not session_path.is_file():
        raise SessionError(f"active session file does not exist: {session_path}")
    return session_path


def handle_init(args: argparse.Namespace) -> None:
    print(initialize(args.root))


def handle_start(args: argparse.Namespace) -> None:
    if not SESSION_NAME_PATTERN.fullmatch(args.name):
        raise SessionError("name must contain lowercase letters, digits, and single hyphens")
    if not args.goal.strip():
        raise SessionError("goal must not be empty")

    with session_lock(args.root):
        if read_active_path(args.root):
            raise SessionError("a session is already active; end it before starting another")

        sessions_dir, pointer_path = get_paths(args.root)
        now = datetime.now().astimezone()
        filename = f"{now:%Y-%m-%d-%H%M%S}-{args.name}.md"
        session_path = sessions_dir / filename
        branch, baseline_head = read_git_metadata(args.root)
        content = (
            f"# {args.name}\n\n"
            "## Overview\n\n"
            f"- Started: {now.isoformat(timespec='seconds')}\n"
            f"- Worktree: {args.root.resolve()}\n"
            f"- Branch: {branch}\n"
            f"- Baseline HEAD: {baseline_head}\n\n"
            "## Goal\n\n"
            f"{args.goal.strip()}\n\n"
            "## Progress\n"
        )
        try:
            with session_path.open("x", encoding="utf-8") as session_file:
                session_file.write(content)
        except FileExistsError as error:
            raise SessionError(f"session file already exists: {session_path}") from error
        write_atomic(pointer_path, f"{filename}\n")
    print(session_path)


def handle_active(args: argparse.Namespace) -> None:
    active_path = read_active_path(args.root)
    if not active_path:
        raise SessionError("no active session")
    print(active_path)


def handle_current(args: argparse.Namespace) -> None:
    active_path = read_active_path(args.root)
    if not active_path:
        print(json.dumps({"active": False}))
        return
    print(json.dumps({"active": True, "path": str(active_path), "name": active_path.name}))


def handle_list(args: argparse.Namespace) -> None:
    sessions_dir, _ = get_paths(args.root)
    active_path = read_active_path(args.root)
    sessions = [] if not sessions_dir.exists() else sorted(sessions_dir.glob("*.md"), reverse=True)
    result = [
        {"path": str(path), "name": path.name, "active": path == active_path}
        for path in sessions
    ]
    print(json.dumps(result))


def handle_end(args: argparse.Namespace) -> None:
    with session_lock(args.root):
        active_path = read_active_path(args.root)
        if not active_path:
            raise SessionError("no active session")
        _, pointer_path = get_paths(args.root)
        write_atomic(pointer_path, "")
    print(active_path)


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--root", type=Path, default=Path.cwd(), help="project worktree root")
    subparsers = parser.add_subparsers(dest="command", required=True)

    subparsers.add_parser("init", help="create the session state directory").set_defaults(
        handler=handle_init
    )

    start_parser = subparsers.add_parser("start", help="create and activate a session")
    start_parser.add_argument("--name", required=True, help="lowercase hyphenated session name")
    start_parser.add_argument("--goal", required=True, help="session goal")
    start_parser.set_defaults(handler=handle_start)

    subparsers.add_parser("active", help="print the active session path").set_defaults(
        handler=handle_active
    )
    subparsers.add_parser("current", help="print active session metadata as JSON").set_defaults(
        handler=handle_current
    )
    subparsers.add_parser("list", help="list sessions as JSON").set_defaults(handler=handle_list)
    subparsers.add_parser("end", help="clear the active session pointer").set_defaults(
        handler=handle_end
    )
    return parser


def main() -> int:
    args = build_parser().parse_args()
    try:
        args.handler(args)
    except (OSError, SessionError) as error:
        print(f"flux-session: {error}", file=sys.stderr)
        return 1
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
