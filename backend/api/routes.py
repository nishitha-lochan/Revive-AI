import os
import json
import datetime
from typing import Dict, Any, List, Optional
from fastapi import APIRouter, Depends, HTTPException, Body
from sqlalchemy.orm import Session

from database.db import get_db
from database.models import User, Project, RepositoryAnalysis, Task, Documentation, Chat, Report, ActivityLog
from services.repo_service import RepoService
from services.ai_service import AIService
from agents.manager import ManagerAgent

router = APIRouter(prefix="/api")

@router.post("/analyze")
def analyze_repository(payload: Dict[str, Any] = Body(...), db: Session = Depends(get_db)):
    repo_url = payload.get("repo_url", "")
    if not repo_url:
        raise HTTPException(status_code=400, detail="repo_url is required")

    try:
        parsed = RepoService.parse_github_url(repo_url)
        owner = parsed["owner"]
        repo = parsed["repo"]

        # Fetch user tokens if present
        user = db.query(User).first()
        github_token = (user.github_token if user else None) or os.getenv("GITHUB_TOKEN")
        openai_key = (user.openai_key if user else None) or os.getenv("OPENAI_API_KEY")

        # Run LangGraph multi-agent workflow
        result = ManagerAgent.run_workflow(owner, repo, github_token, openai_key)
    except Exception as e:
        print(f"Analysis error for {repo_url}: {e}")
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")

    meta = result["metadata"]
    stack = result["stack"]

    # Save or update project in DB
    existing_project = db.query(Project).filter(Project.repo_url == repo_url).first()
    if existing_project:
        project = existing_project
        project.repo_name = repo
        project.owner = owner
        project.framework = stack["framework"]
        project.primary_language = meta.get("primary_language", "TypeScript")
        project.stars = meta.get("stars", 0)
        project.forks = meta.get("forks", 0)
        project.issues_count = meta.get("open_issues", 0)
        project.updated_at = datetime.datetime.utcnow()
    else:
        project = Project(
            repo_url=repo_url,
            repo_name=repo,
            owner=owner,
            framework=stack["framework"],
            primary_language=meta.get("primary_language", "TypeScript"),
            stars=meta.get("stars", 0),
            forks=meta.get("forks", 0),
            issues_count=meta.get("open_issues", 0),
            status="analyzed"
        )
        db.add(project)
        db.flush()

    # Clear old data for re-analysis
    db.query(RepositoryAnalysis).filter(RepositoryAnalysis.project_id == project.id).delete()
    db.query(Task).filter(Task.project_id == project.id).delete()
    db.query(Documentation).filter(Documentation.project_id == project.id).delete()

    # Save RepositoryAnalysis
    health = result["health"]
    stack_info = result["stack"]

    health_metrics_dict = dict(health.get("metrics", {}))
    health_metrics_dict["dead_code_files"] = health.get("dead_code_files", [])
    health_metrics_dict["broken_dependencies"] = health.get("broken_dependencies", [])

    analysis = RepositoryAnalysis(
        project_id=project.id,
        recovery_score=health["recovery_score"],
        summary=result["summary"],
        tech_stack_json=json.dumps(stack_info["tech_stack"]),
        health_metrics_json=json.dumps(health_metrics_dict),
        architecture_graph_json=json.dumps(result["architecture"]),
        complexity_score=5.5,
        maintainability_score=health_metrics_dict.get("maintainability", 70) / 10.0,
        technical_debt_score=health_metrics_dict.get("technical_debt", 30) / 10.0
    )
    db.add(analysis)

    # Save Tasks
    saved_tasks = []
    for t in result["tasks"]:
        task_obj = Task(
            project_id=project.id,
            week=t["week"],
            title=t["title"],
            description=t["description"],
            priority=t["priority"],
            estimated_hours=t["estimated_hours"],
            difficulty=t["difficulty"],
            target_files_json=json.dumps(t["target_files"]),
            dependencies_json=json.dumps(t["dependencies"]),
            is_completed=False
        )
        db.add(task_obj)
        saved_tasks.append(task_obj)

    # Save Documentations
    docs = result["docs"]
    doc_objs = [
        Documentation(project_id=project.id, doc_type="readme", title="README.md", content_markdown=docs["readme"]),
        Documentation(project_id=project.id, doc_type="install", title="Installation Guide", content_markdown=docs["install"]),
        Documentation(project_id=project.id, doc_type="architecture", title="Architecture Spec", content_markdown=docs["architecture"]),
        Documentation(project_id=project.id, doc_type="api", title="API Documentation", content_markdown=docs["api"]),
        Documentation(project_id=project.id, doc_type="deployment", title="Deployment Guide", content_markdown=docs["deployment"]),
    ]
    for d in doc_objs:
        db.add(d)

    # Activity Log
    log = ActivityLog(project_id=project.id, action="Repository Analyzed", details=f"Analyzed {owner}/{repo} with Recovery Score {health['recovery_score']}/100")
    db.add(log)

    db.commit()

    return {
        "status": "success",
        "project_id": project.id,
        "repo_url": repo_url,
        "repo_name": repo,
        "owner": owner,
        "recovery_score": health["recovery_score"],
        "summary": result["summary"],
        "framework": stack_info["framework"],
        "tech_stack": stack_info["tech_stack"],
        "health_metrics": health["metrics"],
        "architecture": result["architecture"]
    }

@router.get("/projects")
def get_projects(db: Session = Depends(get_db)):
    projects = db.query(Project).order_by(Project.updated_at.desc()).all()
    res = []
    for p in projects:
        analysis = db.query(RepositoryAnalysis).filter(RepositoryAnalysis.project_id == p.id).first()
        res.append({
            "id": p.id,
            "repo_url": p.repo_url,
            "repo_name": p.repo_name,
            "owner": p.owner,
            "framework": p.framework,
            "primary_language": p.primary_language,
            "stars": p.stars,
            "forks": p.forks,
            "issues_count": p.issues_count,
            "recovery_score": analysis.recovery_score if analysis else 70,
            "status": p.status,
            "updated_at": p.updated_at.isoformat() if p.updated_at else None
        })
    return res

@router.get("/projects/{project_id}")
def get_project_details(project_id: int, db: Session = Depends(get_db)):
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    analysis = db.query(RepositoryAnalysis).filter(RepositoryAnalysis.project_id == project.id).first()
    tasks = db.query(Task).filter(Task.project_id == project.id).order_by(Task.week, Task.id).all()
    docs = db.query(Documentation).filter(Documentation.project_id == project.id).all()
    chats = db.query(Chat).filter(Chat.project_id == project.id).order_by(Chat.timestamp.asc()).all()

    formatted_tasks = []
    for t in tasks:
        formatted_tasks.append({
            "id": t.id,
            "week": t.week,
            "title": t.title,
            "description": t.description,
            "priority": t.priority,
            "estimated_hours": t.estimated_hours,
            "difficulty": t.difficulty,
            "target_files": json.loads(t.target_files_json) if t.target_files_json else [],
            "dependencies": json.loads(t.dependencies_json) if t.dependencies_json else [],
            "is_completed": t.is_completed
        })

    formatted_docs = {}
    for d in docs:
        formatted_docs[d.doc_type] = {
            "id": d.id,
            "title": d.title,
            "content": d.content_markdown
        }

    formatted_chats = []
    for c in chats:
        formatted_chats.append({
            "id": c.id,
            "sender": c.sender,
            "message": c.message,
            "references": json.loads(c.references_json) if c.references_json else [],
            "timestamp": c.timestamp.isoformat()
        })

    return {
        "id": project.id,
        "repo_url": project.repo_url,
        "repo_name": project.repo_name,
        "owner": project.owner,
        "framework": project.framework,
        "primary_language": project.primary_language,
        "stars": project.stars,
        "forks": project.forks,
        "issues_count": project.issues_count,
        "summary": analysis.summary if analysis else "",
        "recovery_score": analysis.recovery_score if analysis else 70,
        "tech_stack": json.loads(analysis.tech_stack_json) if analysis and analysis.tech_stack_json else [],
        "health_metrics": json.loads(analysis.health_metrics_json) if analysis and analysis.health_metrics_json else {},
        "architecture": json.loads(analysis.architecture_graph_json) if analysis and analysis.architecture_graph_json else {"nodes": [], "links": []},
        "tasks": formatted_tasks,
        "docs": formatted_docs,
        "chats": formatted_chats
    }

@router.post("/chat")
def chat_with_repo(payload: Dict[str, Any] = Body(...), db: Session = Depends(get_db)):
    project_id = payload.get("project_id")
    prompt = payload.get("prompt", "")
    if not project_id or not prompt:
        raise HTTPException(status_code=400, detail="project_id and prompt are required")

    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    # Store user chat
    user_chat = Chat(project_id=project.id, sender="user", message=prompt)
    db.add(user_chat)
    db.commit()

    # Generate response using LLM
    user = db.query(User).first()
    openai_key = (user.openai_key if user and user.openai_key else None) or os.getenv("OPENAI_API_KEY")
    gemini_key = (user.gemini_key if user and getattr(user, "gemini_key", None) else None) or os.getenv("GEMINI_API_KEY")

    analysis = db.query(RepositoryAnalysis).filter(RepositoryAnalysis.project_id == project.id).first()
    summary_txt = analysis.summary if analysis else ""
    tech_stack = ""
    arch_info = ""
    if analysis:
        try:
            stack_list = json.loads(analysis.tech_stack_json or "[]")
            if stack_list:
                tech_stack = ", ".join(str(s) for s in stack_list)
        except Exception:
            pass
        try:
            arch_data = json.loads(analysis.architecture_graph_json or "{}")
            nodes = arch_data.get("nodes", [])
            if nodes:
                arch_info = ", ".join(n.get("id", "") for n in nodes[:25])
        except Exception:
            pass

    context = (
        f"Project: {project.owner}/{project.repo_name}\n"
        f"Language: {project.primary_language}\n"
        f"Framework: {project.framework}\n"
        f"Tech Stack: {tech_stack or 'N/A'}\n"
        f"Architecture Modules: {arch_info or 'N/A'}\n\n"
        f"--- EXECUTIVE SUMMARY & DIAGNOSIS ---\n"
        f"{summary_txt}\n"
    )
    ai_res = AIService.generate_chat_response(prompt, context, openai_key=openai_key, gemini_key=gemini_key)

    # Store assistant response
    assistant_chat = Chat(
        project_id=project.id,
        sender="assistant",
        message=ai_res["message"],
        references_json=json.dumps(ai_res["references"])
    )
    db.add(assistant_chat)
    db.commit()

    return {
        "reply": ai_res["message"],
        "references": ai_res["references"],
        "model": ai_res["model"]
    }

@router.post("/tasks/{task_id}/toggle")
def toggle_task(task_id: int, db: Session = Depends(get_db)):
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    task.is_completed = not task.is_completed
    db.commit()
    return {"id": task.id, "is_completed": task.is_completed}

@router.get("/history")
def get_history(db: Session = Depends(get_db)):
    logs = db.query(ActivityLog).order_by(ActivityLog.timestamp.desc()).limit(20).all()
    return [{
        "id": l.id,
        "project_id": l.project_id,
        "action": l.action,
        "details": l.details,
        "timestamp": l.timestamp.isoformat()
    } for l in logs]

@router.get("/user")
def get_user_profile(db: Session = Depends(get_db)):
    user = db.query(User).first()
    if not user:
        user = User(email="developer@revive.ai", name="Lead Developer")
        db.add(user)
        db.commit()
        db.refresh(user)
    return {
        "id": user.id,
        "email": user.email,
        "name": user.name,
        "has_openai_key": bool(user.openai_key or os.getenv("OPENAI_API_KEY")),
        "has_gemini_key": bool(getattr(user, "gemini_key", None) or os.getenv("GEMINI_API_KEY")),
        "has_github_token": bool(user.github_token or os.getenv("GITHUB_TOKEN"))
    }

@router.put("/user/settings")
def update_settings(payload: Dict[str, Any] = Body(...), db: Session = Depends(get_db)):
    user = db.query(User).first()
    if not user:
        user = User(email="developer@revive.ai", name="Lead Developer")
        db.add(user)

    if "openai_key" in payload:
        user.openai_key = payload["openai_key"]
    if "gemini_key" in payload and hasattr(user, "gemini_key"):
        user.gemini_key = payload["gemini_key"]
    if "github_token" in payload:
        user.github_token = payload["github_token"]
    if "name" in payload:
        user.name = payload["name"]

    db.commit()
    return {"status": "updated"}

