import os
import json
import re
import urllib.request
from typing import Dict, Any, List, Optional

try:
    from dotenv import load_dotenv
    load_dotenv()
except Exception:
    pass


class AIService:
    @staticmethod
    def get_gemini_key(user_key: Optional[str] = None) -> Optional[str]:
        try:
            from dotenv import load_dotenv
            load_dotenv()
        except Exception:
            pass
        return user_key or os.getenv("GEMINI_API_KEY")

    @staticmethod
    def get_openai_key(user_key: Optional[str] = None) -> Optional[str]:
        try:
            from dotenv import load_dotenv
            load_dotenv()
        except Exception:
            pass
        return user_key or os.getenv("OPENAI_API_KEY")

    @staticmethod
    def _extract_references_from_reply(reply: str) -> List[Dict[str, str]]:
        """Extract file references mentioned in the AI reply (e.g. src/app/page.tsx)."""
        pattern = r"`?([a-zA-Z0-9_\-./]+\.[a-zA-Z]{1,10})`?"
        matches = re.findall(pattern, reply)
        seen = []
        refs = []
        for m in matches:
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
        openai_key: Optional[str] = None,
        gemini_key: Optional[str] = None
    ) -> Dict[str, Any]:
        g_key = AIService.get_gemini_key(gemini_key)
        o_key = AIService.get_openai_key(openai_key)

        system_instruction = (
            "You are Revive AI, an expert code comprehension and abandoned project revival AI assistant. "
            "Your job is to analyze repositories, explain what projects are about, list implemented vs missing/abandoned features, "
            "and guide developers step-by-step on how to revive, repair, and take ownership of the codebase.\n\n"
            "Guidelines:\n"
            "1. Answer concisely and specifically based on the provided Codebase Context.\n"
            "2. When referencing files, use exact file paths enclosed in backticks (e.g., `src/index.ts`).\n"
            "3. Provide actionable code snippets or architectural steps whenever asked how to fix or revive a feature.\n"
            "4. Do NOT give generic boilerplate answers. Every reply must directly address the specific repository.\n\n"
            f"--- CODEBASE CONTEXT ---\n{repo_context}\n--- END CODEBASE CONTEXT ---"
        )

        # ── 1. Try Google Gemini API ──────────────────────────────────────
        if g_key:
            for model_name in ["gemini-2.0-flash", "gemini-1.5-flash"]:
                try:
                    url = f"https://generativelanguage.googleapis.com/v1beta/models/{model_name}:generateContent?key={g_key}"
                    headers = {"Content-Type": "application/json"}
                    body = {
                        "contents": [
                            {
                                "role": "user",
                                "parts": [
                                    {"text": f"{system_instruction}\n\nUser Question: {prompt}"}
                                ]
                            }
                        ],
                        "generationConfig": {
                            "temperature": 0.3,
                            "maxOutputTokens": 1500
                        }
                    }
                    req = urllib.request.Request(url, data=json.dumps(body).encode(), headers=headers)
                    with urllib.request.urlopen(req, timeout=25) as res:
                        data = json.loads(res.read().decode())
                        reply = data["candidates"][0]["content"]["parts"][0]["text"]
                        refs = AIService._extract_references_from_reply(reply)
                        return {
                            "message": reply,
                            "model": f"Gemini ({model_name})",
                            "references": refs
                        }
                except Exception as e:
                    print(f"Gemini API ({model_name}) call failed: {e}")
                    pass

        # ── 2. Try OpenAI API ─────────────────────────────────────────────
        if o_key:
            try:
                url = "https://api.openai.com/v1/chat/completions"
                headers = {
                    "Content-Type": "application/json",
                    "Authorization": f"Bearer {o_key}"
                }
                body = {
                    "model": "gpt-4o-mini",
                    "messages": [
                        {"role": "system", "content": system_instruction},
                        {"role": "user", "content": prompt}
                    ],
                    "temperature": 0.3
                }
                req = urllib.request.Request(url, data=json.dumps(body).encode(), headers=headers)
                with urllib.request.urlopen(req, timeout=25) as res:
                    data = json.loads(res.read().decode())
                    reply = data["choices"][0]["message"]["content"]
                    refs = AIService._extract_references_from_reply(reply)
                    return {
                        "message": reply,
                        "model": "GPT-4o-Mini",
                        "references": refs
                    }
            except Exception as e:
                print(f"OpenAI API call failed: {e}")
                pass

        # ── 3. Codebase-Grounded Intelligent Synthesis Fallback ────────────
        return AIService._codebase_grounded_fallback(prompt, repo_context)

    @staticmethod
    def _codebase_grounded_fallback(prompt: str, repo_context: str) -> Dict[str, Any]:
        prompt_lower = prompt.lower()
        repo = AIService._extract_field(repo_context, "Project") or "this repository"
        lang = AIService._extract_field(repo_context, "Language") or "Codebase"
        framework = AIService._extract_field(repo_context, "Framework") or "Framework"
        purpose = AIService._extract_field(repo_context, "Purpose") or "Software application"
        impl = AIService._extract_field(repo_context, "Implemented Features") or "Core architecture"
        miss = AIService._extract_field(repo_context, "Missing/Abandoned Features") or "Test suite & documentation"
        entrypoint = AIService._extract_field(repo_context, "Primary Entrypoint") or "src/index.ts"

        # Check intent
        if any(kw in prompt_lower for kw in ["what is", "about", "overview", "describe", "purpose", "explain repo"]):
            reply = (
                f"### 📦 What `{repo}` is About\n\n"
                f"**Project Purpose**: {purpose}\n\n"
                f"• **Primary Language & Framework**: **{lang}** with **{framework}**\n"
                f"• **Primary Entry Point**: `{entrypoint}`\n\n"
                f"#### Implemented Features:\n{impl}\n\n"
                f"#### Abandoned / Missing Features to Revive:\n{miss}\n\n"
                f"> 💡 **Revival Strategy**: Check the **Recovery Roadmap** tab for step-by-step tasks to take ownership of this codebase. For deep code-generation responses, add a `GEMINI_API_KEY` or `OPENAI_API_KEY` in `backend/.env`!"
            )
            refs = [{"file": entrypoint, "lines": "L1-L40"}, {"file": "README.md", "lines": "L1-L30"}]

        elif any(kw in prompt_lower for kw in ["feature", "functionality", "working", "missing", "abandoned", "todo"]):
            reply = (
                f"### 🚀 Feature Breakdown for `{repo}`\n\n"
                f"#### ✅ Currently Implemented / Detected Features:\n{impl}\n\n"
                f"#### ⚠️ Missing / Abandoned Features Needing Revival:\n{miss}\n\n"
                f"#### 🛠️ Recommended Action Items:\n"
                f"1. Open `{entrypoint}` to verify server/application startup.\n"
                f"2. Add `.env.example` with required secret credentials.\n"
                f"3. Follow Week 2 of the **Recovery Roadmap** to build out the missing components."
            )
            refs = [{"file": entrypoint, "lines": "L1-L50"}]

        elif any(kw in prompt_lower for kw in ["revive", "fix", "repair", "take over", "abandoned", "how to"]):
            reply = (
                f"### 🛠️ How to Revive `{repo}` into Your Own Application\n\n"
                f"Follow this 4-step revival plan for `{repo}` ({framework} / {lang}):\n\n"
                f"1. **Environment Setup**: Copy `.env.example` to `.env` and verify key dependencies in the manifest file.\n"
                f"2. **Fix Entry Point**: Run the local server via `{entrypoint}` and fix any unhandled startup errors.\n"
                f"3. **Build Missing Features**:\n{miss}\n"
                f"4. **Add Tests & Containerization**: Add test specs and Docker configuration to make it production-ready.\n\n"
                f"> 🚀 Check the **Recovery Roadmap** tab to track your week-by-week progress!"
            )
            refs = [{"file": entrypoint, "lines": "L1-L30"}, {"file": "README.md", "lines": "L1-L20"}]

        else:
            reply = (
                f"### 🔍 Repository Intelligence — `{repo}`\n\n"
                f"**Language**: {lang} | **Framework**: {framework}\n"
                f"**Purpose**: {purpose}\n\n"
                f"Regarding your query *\"{prompt}\"*:\n\n"
                f"• **Main entry file**: `{entrypoint}`\n"
                f"• **Implemented capabilities**:\n{impl}\n"
                f"• **Key missing items**:\n{miss}\n\n"
                f"> ℹ️ To receive real-time AI code generation for any question, add your `GEMINI_API_KEY` or `OPENAI_API_KEY` to `backend/.env`."
            )
            refs = [{"file": entrypoint, "lines": "L1-L30"}]

        return {
            "message": reply,
            "model": "Revive-AI Codebase Engine",
            "references": refs
        }

    @staticmethod
    def _extract_field(context: str, field: str) -> Optional[str]:
        """Extract a named field value from the context string."""
        for line in context.splitlines():
            if line.lower().startswith(field.lower() + ":"):
                value = line.split(":", 1)[1].strip()
                if value and value.lower() not in ("none", "null", "unknown", ""):
                    return value
        return None
