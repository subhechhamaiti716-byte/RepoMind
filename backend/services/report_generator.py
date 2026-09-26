import json
from datetime import datetime
from typing import Dict, List, Any

class ReportGenerator:
    @staticmethod
    def generate_full_report_data(
        project_name: str,
        repo_url: str,
        health_data: Dict[str, Any],
        metrics: Dict[str, Any],
        issues: List[Dict[str, Any]],
        arch_data: Dict[str, Any],
        ai_summary: Dict[str, Any],
        dependencies: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        return {
            "metadata": {
                "project_name": project_name,
                "repository_url": repo_url,
                "generated_at": datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S UTC"),
                "auditor": "RepoMind AI Codebase Doctor & Architecture Assistant",
                "version": "1.0.0"
            },
            "executive_summary": ai_summary.get("summary", ""),
            "health_score": health_data,
            "metrics": metrics,
            "issues_summary": {
                "total": len(issues),
                "critical": sum(1 for i in issues if i.get("severity") == "critical"),
                "high": sum(1 for i in issues if i.get("severity") == "high"),
                "medium": sum(1 for i in issues if i.get("severity") == "medium"),
                "low": sum(1 for i in issues if i.get("severity") == "low")
            },
            "architecture": {
                "type": arch_data.get("architecture_type", "Layered"),
                "coupling_score": arch_data.get("coupling_score", 0),
                "cohesion_score": arch_data.get("cohesion_score", 0),
                "circular_dependencies": arch_data.get("circular_dependencies_count", 0)
            },
            "ai_recommendations": ai_summary.get("recommendations", []),
            "issues": issues,
            "dependencies": dependencies
        }

    @staticmethod
    def to_markdown(report_data: Dict[str, Any]) -> str:
        meta = report_data["metadata"]
        health = report_data["health_score"]
        metrics = report_data["metrics"]
        summary = report_data["issues_summary"]
        arch = report_data["architecture"]

        md = f"""# 🧠 RepoMind Codebase Health & Architecture Report

**Project:** {meta['project_name']}  
**Repository:** {meta['repository_url']}  
**Audit Date:** {meta['generated_at']}  
**Auditor:** {meta['auditor']}  

---

## 📊 Executive Summary
{report_data['executive_summary']}

---

## ❤️ Codebase Health Scores (Overall: {health.get('overall_score', 0)}/100)

| Category | Score | Status |
| :--- | :--- | :--- |
| **Code Quality** | {health.get('code_quality_score', 0)} / 100 | {'🟢 Good' if health.get('code_quality_score', 0) > 75 else '🟠 Needs Review'} |
| **Security** | {health.get('security_score', 0)} / 100 | {'🟢 Secure' if health.get('security_score', 0) > 80 else '🔴 Vulnerabilities Detected'} |
| **Architecture** | {health.get('architecture_score', 0)} / 100 | {'🟢 Clean' if health.get('architecture_score', 0) > 75 else '🟠 High Coupling'} |
| **Dependencies** | {health.get('dependency_score', 0)} / 100 | {'🟢 Up to Date' if health.get('dependency_score', 0) > 80 else '🟡 Outdated Packages'} |
| **Maintainability** | {health.get('maintainability_score', 0)} / 100 | {'🟢 Maintainable' if health.get('maintainability_score', 0) > 70 else '🟠 Technical Debt'} |

---

## 📈 Codebase Statistics
- **Total Files Analyzed:** {metrics.get('total_files', 0)}
- **Total Lines of Code:** {metrics.get('total_lines', 0)}
- **Functions:** {metrics.get('functions', 0)} | **Classes:** {metrics.get('classes', 0)}
- **Average Complexity:** {metrics.get('average_complexity', 0)}
- **Architecture Coupling Score:** {arch.get('coupling_score', 0)} / 100
- **Circular Dependencies:** {arch.get('circular_dependencies', 0)}

---

## 🚨 Detected Issues ({summary['total']} Total)
- 🔴 **Critical:** {summary['critical']}
- 🟠 **High:** {summary['high']}
- 🟡 **Medium:** {summary['medium']}
- 🔵 **Low:** {summary['low']}

### Priority Action Items
"""
        for idx, issue in enumerate(report_data.get("issues", [])[:10], 1):
            md += f"\n#### {idx}. [{issue.get('severity', 'medium').upper()}] {issue.get('title')}\n"
            md += f"- **File:** `{issue.get('file_path')}` (Lines {issue.get('line_start')}-{issue.get('line_end')})\n"
            md += f"- **Category:** {issue.get('category')} | **Detected by:** {issue.get('detected_by')}\n"
            md += f"- **Description:** {issue.get('description')}\n"
            md += f"- **Why it matters:** {issue.get('why_it_matters')}\n"
            md += f"- **Recommended Fix:** {issue.get('recommendation')}\n"

        md += "\n---\n\n## 💡 AI Architecture Recommendations\n"
        for rec in report_data.get("ai_recommendations", []):
            md += f"- **[{rec.get('priority', 'info').upper()}] {rec.get('title')}**: {rec.get('description')}\n"

        md += "\n\n*Generated automatically by RepoMind - AI Codebase Doctor & Architecture Assistant.*"
        return md
