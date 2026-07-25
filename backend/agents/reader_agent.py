from typing import Dict, Any, List
from services.repo_service import RepoService

class ReaderAgent:
    """Agent responsible for understanding file structures, packages, and frameworks."""

    @staticmethod
    def run(owner: str, repo: str, intel: Dict[str, Any]) -> Dict[str, Any]:
        is_empty = intel.get("is_empty", False)
        framework = intel.get("framework", "Unknown")
        primary_lang = intel.get("primary_language", "Unknown")
        file_count = intel.get("file_count", 0)
        database = intel.get("database", "None detected")
        auth = intel.get("auth", "None detected")
        top_dirs = intel.get("top_dirs", [])
        top_dirs_str = ", ".join(top_dirs[:4]) if top_dirs else "root directory"

        purpose = intel.get("purpose") or f"A {primary_lang} project built with {framework}."
        implemented = intel.get("implemented_features") or []
        missing = intel.get("missing_features") or []

        impl_str = "\n• " + "\n• ".join(implemented) if implemented else "\n• Core application architecture"
        miss_str = "\n• " + "\n• ".join(missing) if missing else "\n• Production documentation & automated test coverage"

        if is_empty:
            summary = (
                f"**Project Purpose**: {purpose}\n\n"
                f"Repository `{owner}/{repo}` has no active source code detected. Contains {file_count} files.\n\n"
                f"**Implemented Features**:{impl_str}\n\n"
                f"**Missing / Abandoned Features**:{miss_str}\n\n"
                f"**Revival Blueprint**: Follow Week 1 of the Recovery Roadmap to initialize baseline directory layout and build scripts."
            )
        else:
            summary = (
                f"**Project Purpose**: {purpose}\n\n"
                f"Repository `{owner}/{repo}` is a {primary_lang} + {framework} codebase containing {file_count} files across {top_dirs_str}. "
                f"Data persistence: {database} | Auth: {auth}.\n\n"
                f"**Implemented Features**:{impl_str}\n\n"
                f"**Missing / Abandoned Features**:{miss_str}\n\n"
                f"**Revival Blueprint**: Address missing environment config, resolve stubbed TODOs in core handlers, and execute the 4-week Recovery Roadmap."
            )

        stack_info = {
            "framework": framework,
            "tech_stack": intel.get("tech_stack", [primary_lang, framework]),
            "database": database,
            "auth": auth
        }

        return {
            "metadata": intel,
            "stack": stack_info,
            "file_count": file_count,
            "summary": summary,
            "purpose": purpose,
            "implemented_features": implemented,
            "missing_features": missing
        }


