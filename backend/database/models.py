import datetime
import json
from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime, ForeignKey, Float
from sqlalchemy.orm import relationship
from database.db import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=True)
    name = Column(String(255), nullable=True)
    openai_key = Column(String(500), nullable=True)
    github_token = Column(String(500), nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class Project(Base):
    __tablename__ = "projects"

    id = Column(Integer, primary_key=True, index=True)
    repo_url = Column(String(500), index=True, nullable=False)
    repo_name = Column(String(255), nullable=False)
    owner = Column(String(255), nullable=False)
    default_branch = Column(String(100), default="main")
    framework = Column(String(100), nullable=True)
    primary_language = Column(String(100), nullable=True)
    stars = Column(Integer, default=0)
    forks = Column(Integer, default=0)
    issues_count = Column(Integer, default=0)
    status = Column(String(50), default="analyzed") # analyzing, analyzed, failed
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    analyses = relationship("RepositoryAnalysis", back_populates="project", cascade="all, delete-orphan")
    tasks = relationship("Task", back_populates="project", cascade="all, delete-orphan")
    documentations = relationship("Documentation", back_populates="project", cascade="all, delete-orphan")
    chats = relationship("Chat", back_populates="project", cascade="all, delete-orphan")
    reports = relationship("Report", back_populates="project", cascade="all, delete-orphan")

class RepositoryAnalysis(Base):
    __tablename__ = "repository_analyses"

    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=False)
    recovery_score = Column(Integer, default=70) # 0 to 100
    summary = Column(Text, nullable=True)
    tech_stack_json = Column(Text, nullable=True) # JSON array of stack tags
    health_metrics_json = Column(Text, nullable=True) # JSON dict of breakdown metrics
    architecture_graph_json = Column(Text, nullable=True) # JSON of nodes and links
    complexity_score = Column(Float, default=5.0)
    maintainability_score = Column(Float, default=7.5)
    technical_debt_score = Column(Float, default=4.0)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    project = relationship("Project", back_populates="analyses")

class Task(Base):
    __tablename__ = "tasks"

    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=False)
    week = Column(Integer, default=1) # 1, 2, 3, 4
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    priority = Column(String(50), default="High") # High, Medium, Low
    estimated_hours = Column(Integer, default=4)
    difficulty = Column(String(50), default="Medium") # Easy, Medium, Hard
    target_files_json = Column(Text, nullable=True) # JSON list
    dependencies_json = Column(Text, nullable=True) # JSON list
    is_completed = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    project = relationship("Project", back_populates="tasks")

class Documentation(Base):
    __tablename__ = "documentations"

    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=False)
    doc_type = Column(String(100), nullable=False) # readme, install, architecture, api, deployment
    title = Column(String(255), nullable=False)
    content_markdown = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    project = relationship("Project", back_populates="documentations")

class Chat(Base):
    __tablename__ = "chats"

    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=False)
    sender = Column(String(50), default="user") # user or assistant
    message = Column(Text, nullable=False)
    references_json = Column(Text, nullable=True) # JSON references
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)

    project = relationship("Project", back_populates="chats")

class Report(Base):
    __tablename__ = "reports"

    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=False)
    report_type = Column(String(50), default="full") # full, roadmap, health
    title = Column(String(255), nullable=False)
    file_content = Column(Text, nullable=False) # markdown or JSON output
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    project = relationship("Project", back_populates="reports")

class ActivityLog(Base):
    __tablename__ = "activity_logs"

    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, nullable=True)
    action = Column(String(255), nullable=False)
    details = Column(Text, nullable=True)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)
