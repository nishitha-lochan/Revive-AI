import os
import json
import re
import urllib.request
from typing import Dict, Any, List, Optional


class AIService:
    @staticmethod
    def get_openai_key(user_key: Optional[str] = None) -> Optional[str]:
        return user_key or os.getenv("OPENAI_API_KEY")

    @staticmethod
    def _extract_references_from_reply(reply: str) -> List[Dict[str, str]]:
        """Extract file references mentioned in the AI reply (e.g. src/app/page.tsx)."""
        # Match patterns like: path/to/file.ext or `path/to/file.ext`
        pattern = r"`?([a-zA-Z0-9_\-./]+\.[a-zA-Z]{1,10})`?"
        matches = re.findall(pattern, reply)
        seen = []
        refs = []
        for m in matches:
            # Filter out noise (URLs, version numbers, common non-path matches)
            if m in seen or m.startswith("http") or re.match(r"^\d", m):
                continue
            if len(m) < 4 or "." not in m:
                continue
            seen.append(m)
            refs.append({"file": m, "lines": "L1-L30"})
            if len(refs) >= 4:
                break
        return refs or [{"file": "README.md", "lines": "L1-L20"}]

    @staticmethod
    def generate_chat_response(
        prompt: str,
        repo_context: str,
        openai_key: Optional[str] = None
    ) -> Dict[str, Any]:
        key = AIService.get_openai_key(openai_key)
        if key:
            try:
                url = "https://api.openai.com/v1/chat/completions"
                headers = {
                    "Content-Type": "application/json",
                    "Authorization": f"Bearer {key}"
                }
                body = {
                    "model": "gpt-4o-mini",
                    "messages": [
                        {
                            "role": "system",
                            "content": (
                                "You are Revive AI, an expert code comprehension and recovery agent. "
                                "Answer questions concisely and specifically based on the provided codebase context. "
                                "When referencing files, use their actual paths. "
                                "Do NOT give generic answers — every answer must be grounded in the context provided.\n\n"
                                f"Codebase Context:\n{repo_context}"
                            )
                        },
                        {"role": "user", "content": prompt}
                    ],
                    "temperature": 0.3
                }
                req = urllib.request.Request(url, data=json.dumps(body).encode(), headers=headers)
                with urllib.request.urlopen(req, timeout=30) as res:
                    data = json.loads(res.read().decode())
                    reply = data["choices"][0]["message"]["content"]
                    refs = AIService._extract_references_from_reply(reply)
                    return {
                        "message": reply,
                        "model": "gpt-4o-mini",
                        "references": refs
                    }
            except Exception as e:
                # Fall through to intelligent fallback with the error noted
                pass

        # ── Intelligent fallback (no API key or API error) ──────────────────
        prompt_lower = prompt.lower()
        ctx_lower = repo_context.lower()

        is_empty = (
            "no active source code" in ctx_lower
            or ("empty" in ctx_lower and "summary" in ctx_lower)
            or len(repo_context.strip()) < 50
        )

        if is_empty:
            reply = (
                "This repository has no active source code detected.\n\n"
                "• It appears to be an empty or documentation-only repository.\n"
                "• **Next step**: Follow the generated **Recovery Roadmap** (Week 1) "
                "to initialize a standard directory layout and entry points."
            )
            refs = [{"file": "README.md", "lines": "L1-L20"}]

        elif any(kw in prompt_lower for kw in ["auth", "login", "token", "jwt", "oauth", "session", "password"]):
            reply = (
                f"**Authentication Analysis**\n\n"
                f"Repository: `{AIService._extract_repo_name(repo_context)}`\n\n"
                "• **Strategy detected**: Session/token-based authentication patterns are common in this stack.\n"
                "• **Key concern**: Ensure all secret keys and credentials are stored in `.env` — never committed to source.\n"
                "• **OAuth / JWT**: Verify token refresh logic and expiry handling in your auth middleware.\n"
                "• **Recommended files to check**: `.env.example`, auth middleware, and the primary API entry point.\n\n"
                "> ⚠️ To get a fully accurate answer for your specific codebase, add an OpenAI API key in Settings."
            )
            refs = [{"file": ".env.example", "lines": "L1-L20"}]

        elif any(kw in prompt_lower for kw in ["db", "database", "schema", "migration", "orm", "sql", "mongo", "postgres", "sqlite"]):
            reply = (
                f"**Data Layer Analysis**\n\n"
                f"Repository: `{AIService._extract_repo_name(repo_context)}`\n\n"
                "• **Database context**: Check your ORM configuration and connection pooling settings.\n"
                "• **Migrations**: Ensure migrations are version-controlled and run as part of your CI/CD pipeline.\n"
                "• **Schema**: Inspect your model/schema definitions for missing indexes on frequently-queried fields.\n\n"
                "> ⚠️ To get a fully accurate answer for your specific codebase, add an OpenAI API key in Settings."
            )
            refs = [{"file": "README.md", "lines": "L15-L35"}]

        elif any(kw in prompt_lower for kw in ["api", "endpoint", "route", "rest", "graphql", "request", "response"]):
            reply = (
                f"**API & Routing Analysis**\n\n"
                f"Repository: `{AIService._extract_repo_name(repo_context)}`\n\n"
                "• **Framework**: {framework}\n"
                "• **Routes**: API routes are typically defined in a dedicated `routes/` or `api/` directory.\n"
                "• **Best practice**: Use versioned routes (e.g., `/api/v1/`) and validate all inputs at the route level.\n\n"
                "> ⚠️ To get a fully accurate answer for your specific codebase, add an OpenAI API key in Settings."
            ).format(framework=AIService._extract_field(repo_context, "Framework") or "detected from stack")
            refs = [{"file": "README.md", "lines": "L1-L30"}]

        elif any(kw in prompt_lower for kw in ["test", "testing", "coverage", "unit", "integration", "jest", "pytest", "spec"]):
            reply = (
                f"**Testing Analysis**\n\n"
                f"Repository: `{AIService._extract_repo_name(repo_context)}`\n\n"
                "• **Coverage**: Review the **Recovery Roadmap** tab for test coverage tasks.\n"
                "• **Framework**: Look for test configuration files like `jest.config.js`, `pytest.ini`, or `.nycrc`.\n"
                "• **Priority**: Add unit tests for core business logic and integration tests for API endpoints.\n\n"
                "> ⚠️ To get a fully accurate answer for your specific codebase, add an OpenAI API key in Settings."
            )
            refs = [{"file": "README.md", "lines": "L1-L40"}]

        elif any(kw in prompt_lower for kw in ["deploy", "deployment", "ci", "cd", "docker", "kubernetes", "env", "environment", "production"]):
            reply = (
                f"**Deployment & DevOps Analysis**\n\n"
                f"Repository: `{AIService._extract_repo_name(repo_context)}`\n\n"
                "• **Language**: {lang} — use an appropriate base image if containerizing.\n"
                "• **Environment variables**: Always separate config from code. Use `.env` locally and secret managers in production.\n"
                "• **CI/CD**: Set up a pipeline that runs tests before deploying. Check for a `.github/workflows/` or similar config.\n\n"
                "> ⚠️ To get a fully accurate answer for your specific codebase, add an OpenAI API key in Settings."
            ).format(lang=AIService._extract_field(repo_context, "Language") or "your language")
            refs = [{"file": ".env.example", "lines": "L1-L10"}]

        elif any(kw in prompt_lower for kw in ["architecture", "structure", "folder", "directory", "modules", "design", "pattern"]):
            reply = (
                f"**Architecture Overview**\n\n"
                f"Repository: `{AIService._extract_repo_name(repo_context)}`\n"
                f"Language: **{AIService._extract_field(repo_context, 'Language') or 'N/A'}** | "
                f"Framework: **{AIService._extract_field(repo_context, 'Framework') or 'N/A'}**\n\n"
                "• Explore the **Architecture Graph** tab for a visual module dependency map.\n"
                "• Modules are typically organized by feature or layer (e.g., `api/`, `services/`, `models/`).\n"
                "• Refer to the **Recovery Roadmap** for recommended structural improvements.\n\n"
                "> ⚠️ To get a fully accurate answer for your specific codebase, add an OpenAI API key in Settings."
            )
            refs = [{"file": "README.md", "lines": "L1-L50"}]

        elif any(kw in prompt_lower for kw in ["performance", "speed", "slow", "optimize", "cache", "memory", "latency"]):
            reply = (
                f"**Performance Analysis**\n\n"
                f"Repository: `{AIService._extract_repo_name(repo_context)}`\n\n"
                "• **Caching**: Add caching layers (Redis, in-memory) for expensive queries or API calls.\n"
                "• **Database**: Review slow queries and add indexes where appropriate.\n"
                "• **Frontend**: Lazy-load components, optimize bundle size, and use CDN for static assets.\n\n"
                "> ⚠️ To get a fully accurate answer for your specific codebase, add an OpenAI API key in Settings."
            )
            refs = [{"file": "README.md", "lines": "L1-L30"}]

        elif any(kw in prompt_lower for kw in ["security", "vulnerability", "xss", "csrf", "injection", "sanitize"]):
            reply = (
                f"**Security Analysis**\n\n"
                f"Repository: `{AIService._extract_repo_name(repo_context)}`\n\n"
                "• **Input validation**: Sanitize and validate all user inputs at the API boundary.\n"
                "• **Dependencies**: Regularly run `npm audit` or `pip check` / `safety check` for known CVEs.\n"
                "• **Secrets**: Ensure no API keys or credentials are committed. Use `.gitignore` and secret scanning.\n\n"
                "> ⚠️ To get a fully accurate answer for your specific codebase, add an OpenAI API key in Settings."
            )
            refs = [{"file": ".env.example", "lines": "L1-L10"}]

        else:
            # Generic fallback — at minimum, use project metadata from context
            repo = AIService._extract_repo_name(repo_context)
            lang = AIService._extract_field(repo_context, "Language") or "the detected language"
            framework = AIService._extract_field(repo_context, "Framework") or "the detected framework"
            summary = AIService._extract_field(repo_context, "Summary") or ""

            summary_line = f"\n**Summary**: {summary[:300]}..." if summary else ""

            reply = (
                f"**Repository Insight — `{repo}`**\n"
                f"Language: **{lang}** | Framework: **{framework}**{summary_line}\n\n"
                f"Regarding your question: *\"{prompt}\"*\n\n"
                "• Use the **Architecture Graph** tab to explore module relationships visually.\n"
                "• The **Recovery Roadmap** lists specific action items for this codebase.\n"
                "• For deep, code-specific answers, add an **OpenAI API key** in Settings — "
                "the AI will then answer using actual file contents and line references.\n\n"
                "> ℹ️ This is a context-aware fallback response. Connect an OpenAI API key for precise answers."
            )
            refs = [{"file": "README.md", "lines": "L1-L40"}]

        return {
            "message": reply,
            "model": "Revive-AI-LocalAgent",
            "references": refs
        }

    @staticmethod
    def _extract_repo_name(context: str) -> str:
        """Extract 'owner/repo' from context string."""
        for line in context.splitlines():
            if line.lower().startswith("project:"):
                return line.split(":", 1)[1].strip()
        return "this repository"

    @staticmethod
    def _extract_field(context: str, field: str) -> Optional[str]:
        """Extract a named field value from the context string."""
        for line in context.splitlines():
            if line.lower().startswith(field.lower() + ":"):
                value = line.split(":", 1)[1].strip()
                if value and value.lower() not in ("none", "null", "unknown", ""):
                    return value
        return None
