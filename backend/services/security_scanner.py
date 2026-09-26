import re
from typing import Dict, List, Any

SECRET_PATTERNS = [
    (r'(?i)(?:password|passwd|pwd)\s*=\s*["\']([^"\']{6,})["\']', "Hardcoded Password", "critical", "CWE-798"),
    (r'(?i)(?:api_key|apikey|secret_key|jwt_secret)\s*=\s*["\']([a-zA-Z0-9_\-\.]{12,})["\']', "Hardcoded API Key / Secret Token", "critical", "CWE-798"),
    (r'sk-[a-zA-Z0-9]{20,}', "OpenAI / Stripe Secret API Key", "critical", "CWE-798"),
    (r'AKIA[0-9A-Z]{16}', "AWS Access Key ID", "critical", "CWE-798"),
    (r'(?i)DEBUG\s*=\s*True', "Production Debug Mode Enabled", "medium", "CWE-489"),
]

SQL_INJECTION_PATTERNS = [
    (r'(?i)(?:execute|query)\s*\(\s*f["\'].*?SELECT.*?\{.*?\}', "SQL Injection via f-string Formatting", "critical", "CWE-89"),
    (r'(?i)(?:execute|query)\s*\(\s*["\'].*?SELECT.*?["\']\s*\+\s*\w+', "SQL Injection via String Concatenation", "critical", "CWE-89"),
    (r'(?i)(?:execute|query)\s*\(\s*["\'].*?INSERT.*?["\']\s*\+\s*\w+', "SQL Injection via String Concatenation in INSERT", "critical", "CWE-89"),
    (r'(?i)(?:execute|query)\s*\(\s*["\'].*?UPDATE.*?["\']\s*\+\s*\w+', "SQL Injection via String Concatenation in UPDATE", "critical", "CWE-89"),
]

class SecurityScanner:
    @staticmethod
    def scan_file(file_info: Dict[str, Any]) -> List[Dict[str, Any]]:
        findings = []
        rel_path = file_info["file_path"]
        content = file_info.get("content_text", "")
        lines = content.splitlines()

        # Skip scanning lockfiles or compiled/dist items
        if rel_path.endswith((".lock", ".min.js", ".min.css", ".map")):
            return findings

        # 1. Scan for hardcoded secrets
        for pattern, title, severity, cwe in SECRET_PATTERNS:
            for idx, line in enumerate(lines, 1):
                if line.strip().startswith("#") or line.strip().startswith("//"):
                    # Still check for high confidence secrets even in comments
                    pass
                match = re.search(pattern, line)
                if match:
                    findings.append({
                        "category": "security",
                        "severity": severity,
                        "title": title,
                        "description": f"Potential sensitive credential found in `{rel_path}` at line {idx}.",
                        "why_it_matters": "Exposing secrets in repository source code leads to credential leaks, unauthorized database access, and severe account compromise.",
                        "recommendation": "Extract credentials into environment variables (`os.getenv`) and load them from `.env` or a secure cloud secrets manager.",
                        "line_start": idx,
                        "line_end": idx,
                        "code_snippet": line.strip(),
                        "detected_by": "RepoMind Security Guard",
                        "security_meta": {
                            "vulnerability_type": "hardcoded_secret",
                            "cwe_id": cwe,
                            "confidence": 0.95,
                            "remediation": "Move value to an environment variable."
                        }
                    })

        # 2. Scan for SQL Injection
        for pattern, title, severity, cwe in SQL_INJECTION_PATTERNS:
            for idx, line in enumerate(lines, 1):
                if re.search(pattern, line):
                    snippet_lines = lines[max(0, idx-2):min(len(lines), idx+2)]
                    findings.append({
                        "category": "security",
                        "severity": severity,
                        "title": title,
                        "description": f"Direct user input concatenated into an SQL statement in `{rel_path}` at line {idx}.",
                        "why_it_matters": "Unsanitized user inputs can modify query logic, allowing malicious actors to bypass authentication, dump tables, or delete data.",
                        "recommendation": "Use parameterized queries (`cursor.execute(query, (param,))`) or an ORM like SQLAlchemy.",
                        "line_start": idx,
                        "line_end": idx,
                        "code_snippet": "\n".join(snippet_lines),
                        "detected_by": "RepoMind Security Guard",
                        "security_meta": {
                            "vulnerability_type": "sql_injection",
                            "cwe_id": cwe,
                            "confidence": 0.98,
                            "remediation": "Use parameterized queries instead of string formatting."
                        }
                    })

        # 3. Scan for insecure local storage of tokens in frontend
        for idx, line in enumerate(lines, 1):
            if "localStorage.setItem" in line and ("token" in line.lower() or "auth" in line.lower() or "jwt" in line.lower()):
                findings.append({
                    "category": "security",
                    "severity": "medium",
                    "title": "Insecure Token Storage in LocalStorage",
                    "description": f"JWT or authentication token is stored directly in browser `localStorage` in `{rel_path}`.",
                    "why_it_matters": "`localStorage` is accessible to any JavaScript running on the page, leaving tokens vulnerable to Cross-Site Scripting (XSS) exfiltration.",
                    "recommendation": "Store session tokens in HTTP-only, Secure, SameSite cookies to protect them against XSS theft.",
                    "line_start": idx,
                    "line_end": idx,
                    "code_snippet": line.strip(),
                    "detected_by": "RepoMind Security Guard",
                    "security_meta": {
                        "vulnerability_type": "insecure_storage",
                        "cwe_id": "CWE-922",
                        "confidence": 0.90,
                        "remediation": "Use HttpOnly Secure cookies for session tokens."
                    }
                })

            if "eval(" in line or "exec(" in line:
                if not line.strip().startswith(("#", "//")):
                    findings.append({
                        "category": "security",
                        "severity": "critical",
                        "title": "Dynamic Code Execution (`eval` / `exec`)",
                        "description": f"Dangerous dynamic execution statement detected in `{rel_path}`.",
                        "why_it_matters": "If user-controlled data reaches `eval` or `exec`, attackers can achieve arbitrary remote code execution (RCE).",
                        "recommendation": "Avoid `eval`/`exec`. Use safe parsing libraries or explicit data mappings.",
                        "line_start": idx,
                        "line_end": idx,
                        "code_snippet": line.strip(),
                        "detected_by": "RepoMind Security Guard",
                        "security_meta": {
                            "vulnerability_type": "code_injection",
                            "cwe_id": "CWE-94",
                            "confidence": 0.92,
                            "remediation": "Remove dynamic evaluation."
                        }
                    })

        return findings
