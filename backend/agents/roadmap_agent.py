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
        # Pick target files from real tree if available
        manifest_files = [fp for fp in file_paths if fp in ["package.json", "pom.xml", "build.gradle", "requirements.txt", "go.mod", "Cargo.toml", "pyproject.toml"]]

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
                    "title": "Setup Data Persistence Layer",
                    "description": "Configure connection pooling and schema models for persistent storage.",
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
                    "dependencies": ["Setup Data Persistence Layer"]
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

        # Dynamic, project-customized roadmap for active repos
        repo_name = intel.get("repo", "App")
        purpose = intel.get("purpose", "")
        missing_list = intel.get("missing_features", [])
        entrypoint_file = intel.get("entrypoint_name") or (core_files[0] if core_files else "src/index.ts")

        manifest_file = intel.get("manifest_name")
        if not manifest_file or manifest_file in [".env.example", "README.md"]:
            if manifest_files:
                manifest_file = manifest_files[0]
            else:
                lang_lower = primary_lang.lower()
                if "java" in lang_lower or "spring" in framework.lower():
                    manifest_file = "pom.xml"
                elif "python" in lang_lower:
                    manifest_file = "requirements.txt"
                elif "go" in lang_lower:
                    manifest_file = "go.mod"
                elif "rust" in lang_lower:
                    manifest_file = "Cargo.toml"
                else:
                    manifest_file = "package.json"

        tasks = []

        # Week 1: Environment & Foundational Fixes
        tasks.append({
            "week": 1,
            "title": f"Audit & Fix {framework} Dependencies in {manifest_file}",
            "description": f"Review dependency lockfile in {manifest_file}, update outdated/deprecated packages for {framework}, and add .env.example with secret keys.",
            "priority": "High",
            "estimated_hours": 4,
            "difficulty": "Easy",
            "target_files": [manifest_file, ".env.example"],
            "dependencies": []
        })

        tasks.append({
            "week": 1,
            "title": f"Revive Local Dev Startup & Entrypoint ({entrypoint_file})",
            "description": f"Ensure {entrypoint_file} runs cleanly without runtime crashes. Resolve missing imports and broken environment configurations.",
            "priority": "High",
            "estimated_hours": 5,
            "difficulty": "Medium",
            "target_files": [entrypoint_file, "docker-compose.yml" if intel.get("has_dockerfile") else manifest_file],
            "dependencies": [f"Audit & Fix {framework} Dependencies in {manifest_file}"]
        })

        # Week 2: Core Feature Implementation & Missing Components
        feat_title = f"Implement Missing: {missing_list[0]}" if missing_list else f"Refactor Core {primary_lang} Handlers"
        feat_desc = f"Address primary repository gap: {missing_list[0]}. Implement missing route handlers and clean up stubbed logic." if missing_list else f"Clean up state management and API routes in {primary_lang}."
        tasks.append({
            "week": 2,
            "title": feat_title,
            "description": feat_desc,
            "priority": "High",
            "estimated_hours": 8,
            "difficulty": "Hard",
            "target_files": core_files,
            "dependencies": [f"Revive Local Dev Startup & Entrypoint ({entrypoint_file})"]
        })

        db_label = database if database != "None detected" else "Persistent Database"
        auth_label = auth if auth != "None detected" else "Auth Middleware"
        data_auth_title = f"Harden Data Layer ({db_label}) & {auth_label}"
        data_auth_desc = f"Configure connection pooling for {db_label}, sanitize query inputs, and implement {auth_label} protection."

        tasks.append({
            "week": 2,
            "title": data_auth_title,
            "description": data_auth_desc,
            "priority": "Medium",
            "estimated_hours": 6,
            "difficulty": "Medium",
            "target_files": core_files[:2] if len(core_files) >= 2 else core_files,
            "dependencies": [feat_title]
        })

        # Week 3: Testing & Code Health Recovery
        tasks.append({
            "week": 3,
            "title": f"Build Automated Test Suite for {primary_lang} Components",
            "description": f"Add automated unit and integration tests for {entrypoint_file} and core API handlers to prevent regression errors.",
            "priority": "High" if not has_tests else "Medium",
            "estimated_hours": 7,
            "difficulty": "Medium",
            "target_files": test_targets,
            "dependencies": [data_auth_title]
        })

        tasks.append({
            "week": 3,
            "title": f"Purge Dead Code & Resolve Technical Debt",
            "description": f"Clean up dead files ({', '.join(dead_files[:2]) if dead_files else 'unused modules'}), fix lint warnings, and standardize error handling.",
            "priority": "Low",
            "estimated_hours": 4,
            "difficulty": "Easy",
            "target_files": [f for f in dead_files if "/" in f][:2] or core_files[:1],
            "dependencies": [f"Build Automated Test Suite for {primary_lang} Components"]
        })

        # Week 4: Production Documentation & Deployment
        tasks.append({
            "week": 4,
            "title": f"Publish Custom README & Architecture Spec for {repo_name}",
            "description": f"Document project purpose ({purpose[:60]}...), installation setup, API endpoints, and production deployment guide.",
            "priority": "Medium",
            "estimated_hours": 4,
            "difficulty": "Easy",
            "target_files": ["README.md", "docs/ARCHITECTURE.md"],
            "dependencies": []
        })

        tasks.append({
            "week": 4,
            "title": "Configure GitHub Actions CI/CD Pipeline",
            "description": f"Setup automated build and test runner on pull requests using GitHub Actions for {primary_lang}.",
            "priority": "Medium",
            "estimated_hours": 5,
            "difficulty": "Medium",
            "target_files": [".github/workflows/ci.yml"],
            "dependencies": [f"Publish Custom README & Architecture Spec for {repo_name}"]
        })

        return tasks

