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

        if is_empty:
            summary = (
                f"Repository '{owner}/{repo}' has no active source code or files detected. "
                f"Uses {database} for data persistence and {auth} for authentication. "
                f"Contains {file_count} files. Setup and baseline architecture initialization recommended."
            )
        else:
            summary = (
                f"{primary_lang} + {framework} application repository '{owner}/{repo}'. "
                f"Uses {database} for data persistence and {auth} for authentication. "
                f"Contains {file_count} files across {top_dirs_str}."
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
            "summary": summary
        }

