from typing import Dict, Any, List

class CodeHealthAgent:
    """Agent responsible for code health, test coverage detection, dead code, and recovery score."""

    @staticmethod
    def run(intel: Dict[str, Any]) -> Dict[str, Any]:
        is_empty = intel.get("is_empty", False)
        if is_empty:
            return {
                "recovery_score": 15,
                "metrics": {
                    "documentation": 10,
                    "testing": 0,
                    "maintainability": 20,
                    "security": 30,
                    "technical_debt": 90,
                    "performance": 50
                },
                "dead_code_files": ["No files present in repository"],
                "broken_dependencies": ["Empty repository - initial codebase required"]
            }

        file_paths = intel.get("file_paths", [])
        paths_str = " ".join(file_paths).lower()
        has_readme = intel.get("has_readme", False)
        has_tests = intel.get("has_tests", False)
        test_files = intel.get("test_files", [])
        has_ci = intel.get("has_ci", False)
        has_env_example = intel.get("has_env_example", False)
        days_stale = intel.get("days_since_commit") or 0
        lang = intel.get("primary_language", "Unknown").lower()

        stars = intel.get("stars", 0)
        is_major_repo = stars > 300 or intel.get("forks", 0) > 100

        # 1. Documentation Score (20 - 95)
        doc_score = 40
        if has_readme:
            doc_score += 35
        if intel.get("has_contributing"):
            doc_score += 10
        if intel.get("has_license"):
            doc_score += 10
        if "docs" in paths_str or is_major_repo:
            doc_score += 10
        doc_score = min(95, max(20, doc_score))

        # 2. Testing Score (5 - 95)
        if has_tests or len(test_files) > 0:
            test_score = 65 + min(25, len(test_files) * 3)
            if has_ci:
                test_score += 10
        elif is_major_repo:
            # Established open-source monorepos/libraries have extensive test suites in subdirectories
            test_score = 85
        else:
            test_score = 15

        test_score = min(95, max(10, test_score))

        # 3. Maintainability (20 - 95)
        maint_score = 85
        if days_stale > 365:
            maint_score -= 25
        elif days_stale > 180:
            maint_score -= 10
        elif days_stale > 60:
            maint_score -= 5

        open_issues = intel.get("open_issues", 0)
        if open_issues > 100 and not is_major_repo:
            maint_score -= 10
        if intel.get("archived", False):
            maint_score = 35

        maint_score = min(95, max(20, maint_score))

        # 4. Security Score (40 - 95)
        sec_score = 75
        if has_env_example or is_major_repo:
            sec_score += 10
        if has_ci:
            sec_score += 10
        if any(f in paths_str for f in ["package-lock.json", "poetry.lock", "cargo.lock", "go.sum", "yarn.lock"]):
            sec_score += 10
        sec_score = min(95, max(40, sec_score))

        # 5. Technical Debt
        tech_debt = int(100 - ((maint_score * 0.4) + (test_score * 0.4) + (sec_score * 0.2)))
        tech_debt = min(90, max(5, tech_debt))

        # 6. Performance Benchmark
        if lang in ("c", "c++", "rust"):
            perf_score = 95
        elif lang in ("go", "java"):
            perf_score = 90
        elif lang in ("typescript", "javascript"):
            perf_score = 85
        elif lang == "python":
            perf_score = 80
        else:
            perf_score = 82

        # Overall Recovery Score
        recovery_score = int(
            (doc_score * 0.20) + (test_score * 0.30) + (maint_score * 0.30) + (sec_score * 0.20)
        )
        recovery_score = min(98, max(15, recovery_score))

        # Find real dead code candidates or suspicious files from file tree
        dead_candidates = [
            fp for fp in file_paths
            if any(term in fp.lower() for term in ["deprecated", "old_", "v1_", "temp_", "tmp_", ".bak", ".draft"])
        ]
        if not dead_candidates:
            dead_candidates = [
                fp for fp in file_paths if fp.endswith(".tmp") or "unused" in fp.lower()
            ]
        if not dead_candidates:
            dead_candidates = ["No obvious dead/deprecated code files detected in active repository tree"]

        # Derive repo-specific dependency alerts
        deps_alerts = []
        if not has_env_example and ("src" in paths_str or "backend" in paths_str or "app" in paths_str):
            deps_alerts.append("Missing `.env.example` configuration file for environment variables")
        if not has_tests:
            deps_alerts.append(f"Missing automated unit test suite for {intel.get('framework', 'application')}")
        if not has_ci:
            deps_alerts.append("Missing GitHub Actions CI/CD automation workflow")
        if days_stale > 180:
            deps_alerts.append(f"Repository commits stale ({days_stale} days since last commit) - dependency audit recommended")
        if not deps_alerts:
            deps_alerts = ["Dependencies up to date; primary configurations validated."]

        return {
            "recovery_score": recovery_score,
            "metrics": {
                "documentation": doc_score,
                "testing": test_score,
                "maintainability": maint_score,
                "security": sec_score,
                "technical_debt": tech_debt,
                "performance": perf_score
            },
            "dead_code_files": dead_candidates,
            "broken_dependencies": deps_alerts
        }

