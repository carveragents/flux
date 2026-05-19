#!/usr/bin/env python3
"""
Flux AgentSkills installer.
Generates and installs agent-specific skill files directly to agent install locations.

Usage:
    python skills/install.py --agent cursor
    python skills/install.py --agent all
    python skills/install.py --list
    python skills/install.py --agent cursor --dry-run
    python skills/install.py --agent cursor --diff
    python skills/install.py --agent cursor --force

Adding a new agent:
    1. Create skills/agents/<name>/agent.toml with [install] section
    2. Run: python skills/install.py --agent <name> --force
    3. Add install instructions to skills/README.md
"""

import argparse
import hashlib
import json
import os
import platform
import sys
import tempfile
from datetime import datetime, timezone
from pathlib import Path

# Python 3.11+ has tomllib in stdlib. Fall back to tomli for older versions.
try:
    import tomllib
except ImportError:
    try:
        import tomli as tomllib
    except ImportError:
        print("Error: Python 3.11+ required, or install tomli: pip install tomli")
        sys.exit(1)

REPO_ROOT = Path(__file__).parent.parent.resolve()
CORE_DIR = REPO_ROOT / "skills" / "core"
CORE_CLAUDE_DIR = REPO_ROOT / "skills" / "core-claude"
AGENTS_DIR = REPO_ROOT / "skills" / "agents"

OPERATIONS = [
    "repo-init",
    "session-start",
    "session-update",
    "session-end",
    "session-current",
    "session-list",
    "session-help",
    "git-commit",
    "git-merge-cleanup",
    "git-merge-retain",
]

GENERATED_MARKER = "<!-- GENERATED FILE - edit skills/core/{op}.md and run skills/install.py -->\n"


def is_windows():
    return platform.system() == "Windows"


def expand_path(path_str: str) -> Path:
    """Expand environment variables and ~ in path strings."""
    if is_windows():
        # Windows: expand %VAR% style variables
        expanded = os.path.expandvars(path_str)
    else:
        # Unix: expand $VAR and ~ style
        expanded = os.path.expandvars(os.path.expanduser(path_str))
    return Path(expanded).expanduser()


def load_agent_config(agent_name: str) -> dict:
    config_path = AGENTS_DIR / agent_name / "agent.toml"
    if not config_path.exists():
        print(f"Error: No agent config found at {config_path}")
        sys.exit(1)
    with open(config_path, "rb") as f:
        return tomllib.load(f)


def get_install_path(config: dict) -> Path:
    """Get the install path for the agent based on platform."""
    install_config = config.get("install", {})
    if is_windows():
        path_str = install_config.get("path_windows")
    else:
        path_str = install_config.get("path_unix")
    
    if not path_str:
        # Fallback to old output_dir for backward compatibility during migration
        path_str = config.get("output_dir", "")
        if path_str:
            return REPO_ROOT / path_str
        print(f"Error: No install path configured for {config['name']}")
        sys.exit(1)
    
    return expand_path(path_str)


def get_detection_path(config: dict) -> Path:
    """Get the detection path to check if agent is installed."""
    install_config = config.get("install", {})
    if is_windows():
        path_str = install_config.get("detection_path_windows")
    else:
        path_str = install_config.get("detection_path_unix")
    
    if not path_str:
        # Fallback: use parent of install path
        return get_install_path(config).parent
    
    return expand_path(path_str)


def is_agent_installed(config: dict) -> bool:
    """Check if an agent is installed on this machine."""
    detection_path = get_detection_path(config)
    return detection_path.exists()


def derive_commands(cmd_prefix: str) -> dict:
    """Derive all {{CMD_*}} tokens from the prefix and operation slugs."""
    mapping = {}
    for op in OPERATIONS:
        # Convert op slug to token name: session-start -> CMD_SESSION_START
        token = "CMD_" + op.upper().replace("-", "_")
        mapping[token] = f"{cmd_prefix}{op}"
    return mapping


def render(core_content: str, config: dict, op: str) -> str:
    op_meta = config["operations"][op]
    cmd_map = derive_commands(config["cmd_prefix"])

    # Build full substitution map
    subs = {
        "IDE_NAME": config["ide_name"],
        **cmd_map,
    }

    result = core_content
    for token, value in subs.items():
        result = result.replace("{{" + token + "}}", value)

    return result


def strip_existing_front_matter(content: str) -> str:
    """Remove existing front matter from content if present."""
    if content.startswith("---\n"):
        # Find the closing ---
        end_idx = content.find("\n---\n", 4)
        if end_idx != -1:
            return content[end_idx + 5:]  # Skip past closing ---\n
    return content


def assemble(rendered: str, config: dict, op: str) -> str:
    """Assemble the final file: front_matter + marker + trigger + body."""
    marker = GENERATED_MARKER.format(op=op)
    front_matter_template = config["front_matter"]["template"]
    trigger = config.get("execution_trigger", "")
    op_meta = config["operations"][op]

    if front_matter_template:
        # Build substitution dict for front matter
        front_matter_subs = {
            "op_slug": op_meta["op_slug"],
            "description_full": op_meta["description_full"],
            "description_short": op_meta["description_short"],
        }
        
        # Add Claude-specific fields if present
        if "allowed_tools" in op_meta:
            front_matter_subs["allowed_tools"] = op_meta["allowed_tools"]
        if "argument_hint" in op_meta:
            front_matter_subs["argument_hint"] = op_meta["argument_hint"]
        if "model" in op_meta:
            front_matter_subs["model"] = op_meta["model"]
        
        front_matter = front_matter_template.format(**front_matter_subs)
        # front matter → blank line → marker → body
        return front_matter + "\n\n" + marker + "\n" + rendered
    elif trigger:
        # Amazon Q: no front matter — marker first, then trigger, then body
        return marker + trigger + rendered
    else:
        return marker + "\n" + rendered


def output_path(config: dict, op: str, base_path: Path) -> Path:
    """Resolve the output file path for a given agent and operation."""
    ext = config["file_extension"]
    structure = config["install_structure"]
    name = config["name"]
    op_meta = config["operations"][op]
    op_slug = op_meta["op_slug"]

    if structure == "nested":
        # Claude: ~/.claude/commands/flux/repo/init.md
        return base_path / f"{op_slug}{ext}"
    elif structure == "directory":
        # Cursor: ~/.cursor/skills/flux-{op}/SKILL.md
        return base_path / f"flux-{op}" / "SKILL.md"
    else:
        # Flat file — filename depends on agent
        if name == "amazonq":
            # Amazon Q: no flux- prefix, just {op}.md
            return base_path / f"{op}{ext}"
        else:
            # Windsurf, Copilot: flux-{op}.md or flux-{op}.prompt.md
            return base_path / f"flux-{op}{ext}"


def compute_hash(content: str) -> str:
    """Compute SHA256 hash of content."""
    return hashlib.sha256(content.encode("utf-8")).hexdigest()


def read_manifest(install_path: Path) -> dict:
    """Read the .flux-manifest file if it exists."""
    manifest_path = install_path / ".flux-manifest"
    if not manifest_path.exists():
        return {}
    try:
        with open(manifest_path, "r", encoding="utf-8") as f:
            return json.load(f)
    except:
        return {}


def write_manifest(install_path: Path, operations: list, version: str):
    """Write the .flux-manifest file."""
    manifest = {
        "installed": datetime.now(timezone.utc).isoformat(),
        "version": version,
        "operations": operations,
    }
    manifest_path = install_path / ".flux-manifest"
    with open(manifest_path, "w", encoding="utf-8") as f:
        json.dump(manifest, f, indent=2)


def get_git_version() -> str:
    """Get current git commit hash, or 'unknown' if not in git repo."""
    try:
        import subprocess
        result = subprocess.run(
            ["git", "rev-parse", "--short", "HEAD"],
            cwd=REPO_ROOT,
            capture_output=True,
            text=True,
            timeout=5,
        )
        if result.returncode == 0:
            return f"flux@{result.stdout.strip()}"
    except:
        pass
    return "flux@unknown"


def install_agent(agent_name: str, dry_run: bool = False, show_diff: bool = False, force: bool = False) -> bool:
    """Install skills for a single agent. Returns True if successful."""
    config = load_agent_config(agent_name)
    
    # Check if agent is installed
    if not force and not is_agent_installed(config):
        detection_path = get_detection_path(config)
        print(f"Skipped {agent_name} — {detection_path} not found ({config['ide_name']} not installed)")
        return False
    
    install_path = get_install_path(config)
    
    if dry_run:
        print(f"\nDry run for {agent_name} -> {install_path}")
    elif show_diff:
        print(f"\nDiff for {agent_name} -> {install_path}")
    else:
        print(f"\nInstalling {agent_name} -> {install_path}")
    
    # Read existing manifest
    manifest = read_manifest(install_path)
    
    changes = []
    unchanged = []
    
    for op in OPERATIONS:
        # Check if this is Claude agent - use core-claude directory
        if agent_name == "claude":
            op_meta = config["operations"][op]
            op_slug = op_meta["op_slug"]
            core_path = CORE_CLAUDE_DIR / f"{op_slug}.md"
        else:
            core_path = CORE_DIR / f"{op}.md"
        
        if not core_path.exists():
            print(f"Warning: Core file not found: {core_path}")
            continue

        with open(core_path, "r", encoding="utf-8") as f:
            core_content = f.read()
        
        # For Claude, strip existing front matter before rendering
        if agent_name == "claude":
            core_content = strip_existing_front_matter(core_content)

        rendered = render(core_content, config, op)
        final = assemble(rendered, config, op)
        
        dest = output_path(config, op, install_path)
        
        # Check if content changed
        content_hash = compute_hash(final)
        existing_content = None
        if dest.exists():
            with open(dest, "r", encoding="utf-8") as f:
                existing_content = f.read()
            existing_hash = compute_hash(existing_content)
        else:
            existing_hash = None
        
        if show_diff:
            if existing_hash != content_hash:
                print(f"\n{'='*60}")
                print(f"File: {dest}")
                print(f"{'='*60}")
                if existing_content:
                    # Simple diff: show that it changed
                    print("Content changed (use --dry-run to see new content)")
                else:
                    print("New file")
            continue
        
        if dry_run:
            if existing_hash != content_hash:
                print(f"\nWould write: {dest}")
                if not dest.exists():
                    print("  (new file)")
                else:
                    print("  (modified)")
                print(f"\nContent preview:\n{'-'*60}")
                print(final[:500] + ("..." if len(final) > 500 else ""))
                print(f"{'-'*60}")
            else:
                print(f"Unchanged: {dest}")
            continue
        
        # Actual install
        if existing_hash == content_hash:
            unchanged.append(dest.name)
            continue
        
        # Create directory if needed
        dest.parent.mkdir(parents=True, exist_ok=True)
        
        # Atomic write: write to temp file, then rename
        with tempfile.NamedTemporaryFile(
            mode="w",
            encoding="utf-8",
            newline="\n",
            dir=dest.parent,
            delete=False,
        ) as tmp:
            tmp.write(final)
            tmp_path = tmp.name
        
        try:
            os.replace(tmp_path, dest)
            changes.append((dest.name, "new" if existing_hash is None else "updated"))
        except Exception as e:
            os.unlink(tmp_path)
            print(f"Error writing {dest}: {e}")
            return False
    
    if not dry_run and not show_diff:
        # Handle copilot instructions.md special case
        if agent_name == "copilot":
            instructions_src = REPO_ROOT / "skills" / "copilot" / "instructions.md"
            if instructions_src.exists():
                instructions_dest = install_path / "flux.instructions.md"
                with open(instructions_src, "r", encoding="utf-8") as f:
                    instructions_content = f.read()
                
                instructions_hash = compute_hash(instructions_content)
                existing_instructions_hash = None
                if instructions_dest.exists():
                    with open(instructions_dest, "r", encoding="utf-8") as f:
                        existing_instructions_hash = compute_hash(f.read())
                
                if instructions_hash != existing_instructions_hash:
                    instructions_dest.parent.mkdir(parents=True, exist_ok=True)
                    with open(instructions_dest, "w", encoding="utf-8") as f:
                        f.write(instructions_content)
                    changes.append((instructions_dest.name, "new" if existing_instructions_hash is None else "updated"))
                else:
                    unchanged.append(instructions_dest.name)
        
        # Write manifest
        write_manifest(install_path, OPERATIONS, get_git_version())
        
        # Report
        if changes:
            print(f"\nInstalled {len(changes)} file(s):")
            for name, status in changes:
                print(f"  {status.capitalize()}: {name}")
        if unchanged:
            print(f"\nUnchanged: {len(unchanged)} file(s)")
    
    return True


def list_agents() -> list:
    """List all available agents."""
    return [
        d.name for d in AGENTS_DIR.iterdir()
        if d.is_dir() and (d / "agent.toml").exists()
    ]


def list_agent_status():
    """List all agents and their installation status."""
    print("Flux AgentSkills status:\n")
    
    agents = list_agents()
    detected = []
    not_detected = []
    
    for agent_name in sorted(agents):
        config = load_agent_config(agent_name)
        install_path = get_install_path(config)
        detection_path = get_detection_path(config)
        installed = is_agent_installed(config)
        
        if installed:
            manifest = read_manifest(install_path)
            if manifest:
                installed_date = manifest.get("installed", "unknown")
                if installed_date != "unknown":
                    try:
                        dt = datetime.fromisoformat(installed_date)
                        installed_date = dt.strftime("%Y-%m-%d")
                    except:
                        pass
                version = manifest.get("version", "unknown")
                detected.append(f"{agent_name:12} installed {installed_date:12} ({version})")
            else:
                detected.append(f"{agent_name:12} installed (no manifest)")
        else:
            not_detected.append(f"{agent_name:12} not detected - {detection_path}")
    
    if detected:
        print("Detected agents:")
        for line in detected:
            print(f"  {line}")
    
    if not_detected:
        print("\nNot detected:")
        for line in not_detected:
            print(f"  {line}")
    
    if detected:
        print(f"\nTo update: python skills/install.py --agent all")


def main():
    parser = argparse.ArgumentParser(description="Flux AgentSkills installer")
    parser.add_argument(
        "--agent",
        help="Agent to install (cursor, windsurf, copilot, amazonq, all)",
    )
    parser.add_argument(
        "--list",
        action="store_true",
        help="List all agents and their installation status",
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Preview what would be installed without writing files",
    )
    parser.add_argument(
        "--diff",
        action="store_true",
        help="Show which files would change",
    )
    parser.add_argument(
        "--force",
        action="store_true",
        help="Install even if agent is not detected",
    )
    args = parser.parse_args()

    if args.list:
        list_agent_status()
        return

    if not args.agent:
        parser.print_help()
        print("\nTip: Use --list to see which agents are installed")
        sys.exit(1)

    agents = list_agents() if args.agent == "all" else [args.agent]

    if args.agent == "all":
        # Filter to only detected agents unless --force
        if not args.force:
            detected_agents = []
            skipped_agents = []
            for agent in agents:
                config = load_agent_config(agent)
                if is_agent_installed(config):
                    detected_agents.append(agent)
                else:
                    skipped_agents.append(agent)
            
            if detected_agents:
                print("Detected agents on this machine:")
                for agent in detected_agents:
                    config = load_agent_config(agent)
                    install_path = get_install_path(config)
                    print(f"  {agent:12} -> {install_path}")
            
            if skipped_agents:
                print("\nNot detected (skipped):")
                for agent in skipped_agents:
                    config = load_agent_config(agent)
                    detection_path = get_detection_path(config)
                    print(f"  {agent:12} - {detection_path} not found")
            
            agents = detected_agents
            
            if not agents:
                print("\nNo agents detected. Use --force to install anyway.")
                sys.exit(0)
            
            print()  # blank line before install output

    success_count = 0
    for agent in agents:
        if install_agent(agent, dry_run=args.dry_run, show_diff=args.diff, force=args.force):
            success_count += 1

    if not args.dry_run and not args.diff:
        print(f"\nOK Installed {success_count}/{len(agents)} agent(s)")


if __name__ == "__main__":
    main()
