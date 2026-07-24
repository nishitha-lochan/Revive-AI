from typing import List, Dict, Any

class RoadmapAgent:
    """Agent responsible for creating multi-week prioritized recovery roadmap tasks."""

    @staticmethod
    def run(intel: Dict[str, Any], health: Dict[str, Any]) -> List[Dict[str, Any]]:
        is_empty = intel.get("is_empty", False)
        framework = intel.get("framework", "Application")
        primary_lang = intel.get("primary_language", "Codebase")
        database = intel.get("database", "Database")
        auth = intel.get("auth", "Auth")
        file_paths = intel.get("file_paths", [])
        has_tests = intel.get("has_tests", False)
        has_ci = intel.get("has_ci", False)
        dead_files = health.get("dead_code_files", [])

        # Pick target files from real tree if available
        manifest_files = [fp for fp in file_paths if fp in ["package.json", "requirements.txt", "go.mod", "Cargo.toml", "pyproject.toml"]]
        if not manifest_files:
            manifest_files = [".env.example", "README.md"] if not is_empty else ["README.md"]

        core_files = [fp for fp in file_paths if any(term in fp for term in ["src/", "app/", "main.", "index.", "cmd/", "lib/"])][:3]
        if not core_files:
            core_files = file_paths[:3] if file_paths else ["src/main.ts"]

        test_targets = intel.get("test_files", [])[:2]
        if not test_targets:
            test_targets = [f"tests/test_{primary_lang.lower()}.py" if primary_lang == "Python" else "tests/app.test.ts"]

        if is_empty:
            return [
                {
                    "week": 1,
                    "title": f"Initialize {primary_lang} Repository Structure",
                    "description": f"Create standard directory layout, core entry points, and base {framework} framework configuration.",
                    "priority": "High",
                    "estimated_hours": 4,
                    "difficulty": "Easy",
                    "target_files": ["README.md", "src/index.ts"],
                    "dependencies": []
                },
                {
                    "week": 1,
                    "title": "Configure Dependency Lockfile & Build Scripts",
                    "description": "Initialize package manager lockfile, build settings, and environment template.",
                    "priority": "High",
                    "estimated_hours": 3,
                    "difficulty": "Easy",
                    "target_files": [".env.example"],
                    "dependencies": [f"Initialize {primary_lang} Repository Structure"]
                },
                {
                    "week": 2,
                    "title": "Implement Core API / Business Handlers",
                    "description": f"Write primary service functions and data handling routines in {primary_lang}.",
                    "priority": "High",
                    "estimated_hours": 8,
                    "difficulty": "Medium",
                    "target_files": ["src/app.ts"],
                    "dependencies": ["Configure Dependency Lockfile & Build Scripts"]
                },
                {
                    "week": 2,
                    "title": f"Setup {database} Persistence Layer",
                    "description": f"Configure connection pooling and schema models for {database}.",
                    "priority": "Medium",
                    "estimated_hours": 6,
                    "difficulty": "Medium",
                    "target_files": ["src/db.ts"],
                    "dependencies": ["Implement Core API / Business Handlers"]
                },
                {
                    "week": 3,
                    "title": "Setup Test Suite & Spec Coverage",
                    "description": f"Configure automated unit test runner for {primary_lang} and add initial regression assertions.",
                    "priority": "High",
                    "estimated_hours": 6,
                    "difficulty": "Medium",
                    "target_files": ["tests/app.test.ts"],
                    "dependencies": [f"Setup {database} Persistence Layer"]
                },
                {
                    "week": 3,
                    "title": "Setup Containerization (Dockerfile)",
                    "description": "Create Docker container configuration for single-command startup and reproducible builds.",
                    "priority": "Low",
                    "estimated_hours": 4,
                    "difficulty": "Easy",
                    "target_files": ["Dockerfile"],
                    "dependencies": ["Setup Test Suite & Spec Coverage"]
                },
                {
                    "week": 4,
                    "title": "Write Onboarding & Architecture Spec",
                    "description": "Publish complete README.md with setup commands and architecture Overview.",
                    "priority": "Medium",
                    "estimated_hours": 3,
                    "difficulty": "Easy",
                    "target_files": ["README.md", "docs/ARCHITECTURE.md"],
                    "dependencies": []
                },
                {
                    "week": 4,
                    "title": "Automate GitHub Actions CI Workflow",
                    "description": "Configure GitHub Actions runner to test and lint pull requests automatically.",
                    "priority": "Medium",
                    "estimated_hours": 5,
                    "difficulty": "Medium",
                    "target_files": [".github/workflows/ci.yml"],
                    "dependencies": ["Write Onboarding & Architecture Spec"]
                }
            ]

        # Dynamic roadmap for active repos
        return [
            {
                "week": 1,
                "title": f"Audit {framework} Configuration & Manifests",
                "description": f"Review dependency versions in {', '.join(manifest_files)}, fix deprecated flags, and add missing .env.example template.",
                "priority": "High",
                "estimated_hours": 4,
                "difficulty": "Easy",
                "target_files": manifest_files,
                "dependencies": []
            },
            {
                "week": 1,
                "title": f"Optimize Local Dev & Environment Startup",
                "description": f"Verify local server startup for {framework} and update container/scripts.",
                "priority": "High",
                "estimated_hours": 5,
                "difficulty": "Medium",
                "target_files": ["Dockerfile", "docker-compose.yml"] if intel.get("has_dockerfile") else manifest_files[:2],
                "dependencies": [f"Audit {framework} Configuration & Manifests"]
            },
            {
                "week": 2,
                "title": f"Refactor Core Handlers in {primary_lang}",
                "description": f"Clean up error handling and state flow in primary codebase modules.",
                "priority": "High",
                "estimated_hours": 8,
                "difficulty": "Medium",
                "target_files": core_files,
                "dependencies": ["Optimize Local Dev & Environment Startup"]
            },
            {
                "week": 2,
                "title": f"Harden Data Layer & {auth}",
                "description": f"Verify {database} queries, parameter sanitization, and authentication token validation.",
                "priority": "Medium",
                "estimated_hours": 6,
                "difficulty": "Hard",
                "target_files": core_files[:2],
                "dependencies": [f"Refactor Core Handlers in {primary_lang}"]
            },
            {
                "week": 3,
                "title": f"Expand Automated Test Suite for {primary_lang}",
                "description": f"Increase regression testing coverage for core handlers and key features.",
                "priority": "High" if not has_tests else "Medium",
                "estimated_hours": 8,
                "difficulty": "Medium",
                "target_files": test_targets,
                "dependencies": [f"Harden Data Layer & {auth}"]
            },
            {
                "week": 3,
                "title": "Clean Deprecated Code & Technical Debt",
                "description": "Refactor or purge legacy functions and fix linter/compiler warnings.",
                "priority": "Low",
                "estimated_hours": 4,
                "difficulty": "Easy",
                "target_files": [f for f in dead_files if "/" in f][:2] or core_files[:1],
                "dependencies": [f"Expand Automated Test Suite for {primary_lang}"]
            },
            {
                "week": 4,
                "title": "Publish Production Documentation & API Guide",
                "description": f"Update README.md, document public interfaces, and write deployment instructions.",
                "priority": "Medium",
                "estimated_hours": 4,
                "difficulty": "Easy",
                "target_files": ["README.md", "docs/ARCHITECTURE.md"],
                "dependencies": []
            },
            {
                "week": 4,
                "title": "Configure CI/CD Automation Pipeline",
                "description": f"Setup automated build and test runner on pull requests using GitHub Actions.",
                "priority": "Medium",
                "estimated_hours": 5,
                "difficulty": "Medium",
                "target_files": [".github/workflows/ci.yml"] if has_ci else [".github/workflows/ci.yml"],
                "dependencies": ["Publish Production Documentation & API Guide"]
            }
        ]

