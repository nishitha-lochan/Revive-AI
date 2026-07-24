import json
from typing import Dict, Any, List
from services.repo_service import RepoService
from agents.reader_agent import ReaderAgent
from agents.code_health_agent import CodeHealthAgent
from agents.architecture_agent import ArchitectureAgent
from agents.roadmap_agent import RoadmapAgent
from agents.doc_agent import DocAgent

class ManagerAgent:
    """LangGraph Workflow Orchestrator coordinating all sub-agents."""

    @staticmethod
    def run_workflow(owner: str, repo: str, github_token: str = None, openai_key: str = None) -> Dict[str, Any]:
        # Fetch dynamic repository signals & tree structure
        intel = RepoService.fetch_full_repo_intelligence(owner, repo, github_token)

        # 1. Reader Agent
        reader_res = ReaderAgent.run(owner, repo, intel)
        stack = reader_res["stack"]
        meta = reader_res["metadata"]

        # 2. Code Health Agent
        health_res = CodeHealthAgent.run(intel)

        # 3. Architecture Agent
        arch_res = ArchitectureAgent.run(repo, intel)

        # 4. Roadmap Agent
        tasks_res = RoadmapAgent.run(intel, health_res)

        # 5. Documentation Agent
        docs_res = DocAgent.generate_all(repo, intel)

        return {
            "metadata": meta,
            "summary": reader_res["summary"],
            "stack": stack,
            "health": health_res,
            "architecture": arch_res,
            "tasks": tasks_res,
            "docs": docs_res
        }

