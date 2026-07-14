#!/usr/bin/env python3

import json
import subprocess
import sys
import tempfile
import unittest
from pathlib import Path

SCRIPT_PATH = Path(__file__).with_name("session.py")


class SessionScriptTest(unittest.TestCase):
    def setUp(self) -> None:
        self.temporary_directory = tempfile.TemporaryDirectory()
        self.root = Path(self.temporary_directory.name)

    def tearDown(self) -> None:
        self.temporary_directory.cleanup()

    def run_script(self, *arguments: str, check: bool = True) -> subprocess.CompletedProcess[str]:
        return subprocess.run(
            [sys.executable, str(SCRIPT_PATH), "--root", str(self.root), *arguments],
            check=check,
            capture_output=True,
            text=True,
        )

    def test_session_lifecycle(self) -> None:
        self.run_script("init")
        start_result = self.run_script(
            "start", "--name", "feat-portable-skills", "--goal", "Create portable skills"
        )
        session_path = Path(start_result.stdout.strip())

        self.assertTrue(session_path.is_file())
        self.assertEqual(
            session_path.name,
            (self.root / ".flux/sessions/.current-session").read_text().strip(),
        )
        self.assertIn("Create portable skills", session_path.read_text())
        self.assertIn("Baseline HEAD:", session_path.read_text())

        current = json.loads(self.run_script("current").stdout)
        self.assertTrue(current["active"])
        self.assertEqual(current["path"], str(session_path))

        listed = json.loads(self.run_script("list").stdout)
        self.assertEqual([session_path.name], [item["name"] for item in listed])
        self.assertTrue(listed[0]["active"])

        self.run_script("end")
        self.assertEqual({"active": False}, json.loads(self.run_script("current").stdout))

    def test_start_refuses_an_active_session(self) -> None:
        self.run_script("start", "--name", "first", "--goal", "First goal")
        result = self.run_script(
            "start", "--name", "second", "--goal", "Second goal", check=False
        )

        self.assertEqual(1, result.returncode)
        self.assertIn("already active", result.stderr)

    def test_start_rejects_invalid_name(self) -> None:
        result = self.run_script(
            "start", "--name", "../invalid", "--goal", "Unsafe name", check=False
        )

        self.assertEqual(1, result.returncode)
        self.assertIn("lowercase letters", result.stderr)

    def test_start_rejects_empty_goal(self) -> None:
        result = self.run_script("start", "--name", "empty", "--goal", "  ", check=False)

        self.assertEqual(1, result.returncode)
        self.assertIn("must not be empty", result.stderr)

    def test_active_rejects_path_traversal(self) -> None:
        sessions_dir = self.root / ".flux/sessions"
        sessions_dir.mkdir(parents=True)
        (sessions_dir / ".current-session").write_text("../outside.md\n")

        result = self.run_script("active", check=False)

        self.assertEqual(1, result.returncode)
        self.assertIn("invalid filename", result.stderr)


if __name__ == "__main__":
    unittest.main()
