from typing import Dict, Any, List

class ArchitectureAgent:
    """Agent responsible for mapping codebase dependency graph & architecture nodes."""

    @staticmethod
    def run(repo_name: str, intel: Dict[str, Any]) -> Dict[str, Any]:
        is_empty = intel.get("is_empty", False)
        framework = intel.get("framework", "Unknown")
        database = intel.get("database", "None detected")
        primary_lang = intel.get("primary_language", "Unknown")
        top_dirs = intel.get("top_dirs", [])
        file_paths = intel.get("file_paths", [])
        has_tests = intel.get("has_tests", False)
        has_docker = intel.get("has_dockerfile", False)

        if is_empty:
            nodes = [
                {"id": "root", "label": repo_name, "type": "folder", "category": "Root", "details": "Empty Repository Container"},
                {"id": "init_state", "label": "No Modules Detected", "type": "module", "category": "Empty", "details": "Repository contains no source files or active build config"}
            ]
            links = [{"source": "root", "target": "init_state", "label": "status"}]
            return {"nodes": nodes, "links": links}

        nodes = [
            {"id": "root", "label": repo_name, "type": "folder", "category": "Root", "details": f"Repository Root ({len(file_paths)} files)"}
        ]
        links = []

        # Add top directory nodes
        for idx, d in enumerate(top_dirs[:6]):
            node_id = f"dir_{d.replace('.', '_').replace('-', '_')}"
            nodes.append({
                "id": node_id,
                "label": f"/{d}",
                "type": "module",
                "category": "Directory",
                "details": f"Module container for {d}/ files"
            })
            links.append({"source": "root", "target": node_id, "label": "contains"})

        # Add main framework application node
        app_id = "main_app"
        nodes.append({
            "id": app_id,
            "label": f"{framework} Engine",
            "type": "service",
            "category": "Core",
            "details": f"Primary {primary_lang} application entry point"
        })
        links.append({"source": "root", "target": app_id, "label": "executes"})

        # Add database node if detected
        if database != "None detected":
            db_id = "db_node"
            nodes.append({
                "id": db_id,
                "label": database,
                "type": "database",
                "category": "Data",
                "details": f"Data persistence layer ({database})"
            })
            links.append({"source": app_id, "target": db_id, "label": "queries"})

        # Add testing node if tests exist
        if has_tests:
            test_id = "test_suite"
            nodes.append({
                "id": test_id,
                "label": "Test Suite",
                "type": "module",
                "category": "QA",
                "details": f"Automated test runner & spec assertions"
            })
            links.append({"source": app_id, "target": test_id, "label": "verifies"})

        # Add Docker infrastructure node if containerized
        if has_docker:
            docker_id = "docker_infra"
            nodes.append({
                "id": docker_id,
                "label": "Docker Container",
                "type": "service",
                "category": "Infra",
                "details": "Containerized build environment"
            })
            links.append({"source": "root", "target": docker_id, "label": "packages"})

        return {"nodes": nodes, "links": links}

