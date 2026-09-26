import json
import re
from typing import Dict, List, Any, Tuple

# Curated CVE database for Python & NPM packages
KNOWN_VULNERABILITIES = {
    ("requests", "pip"): {
        "vulnerable_below": "2.31.0",
        "cve": "CVE-2023-32681",
        "severity": "medium",
        "description": "Proxy-Authorization header leak in requests on redirect to HTTPS",
        "recommended": "2.31.0"
    },
    ("jinja2", "pip"): {
        "vulnerable_below": "2.11.3",
        "cve": "CVE-2020-28493",
        "severity": "high",
        "description": "ReDoS vulnerability in email filter",
        "recommended": "3.1.3"
    },
    ("pyyaml", "pip"): {
        "vulnerable_below": "5.4",
        "cve": "CVE-2020-14343",
        "severity": "critical",
        "description": "Arbitrary code execution through untrusted YAML load()",
        "recommended": "6.0.1"
    },
    ("urllib3", "pip"): {
        "vulnerable_below": "1.26.18",
        "cve": "CVE-2023-43804",
        "severity": "high",
        "description": "Cookie leak on redirect to cross-site destination",
        "recommended": "2.2.1"
    },
    ("cryptography", "pip"): {
        "vulnerable_below": "3.4.8",
        "cve": "CVE-2023-49083",
        "severity": "high",
        "description": "NULL pointer dereference when parsing PKCS#7 structures",
        "recommended": "42.0.5"
    },
    ("lodash", "npm"): {
        "vulnerable_below": "4.17.21",
        "cve": "CVE-2021-23337",
        "severity": "high",
        "description": "Prototype Pollution in lodash.template",
        "recommended": "4.17.21"
    },
    ("axios", "npm"): {
        "vulnerable_below": "0.21.2",
        "cve": "CVE-2021-3749",
        "severity": "high",
        "description": "Regular Expression Denial of Service (ReDoS) in trim method",
        "recommended": "1.6.8"
    }
}

class DependencyScanner:
    @staticmethod
    def scan_dependencies(files: List[Dict[str, Any]]) -> Tuple[List[Dict[str, Any]], List[Dict[str, Any]]]:
        dependencies: List[Dict[str, Any]] = []
        issues: List[Dict[str, Any]] = []

        for f in files:
            path = f["file_path"].lower()
            content = f.get("content_text", "")

            if path.endswith("requirements.txt"):
                deps, iss = DependencyScanner._parse_requirements(f["file_path"], content)
                dependencies.extend(deps)
                issues.extend(iss)

            elif path.endswith("package.json"):
                deps, iss = DependencyScanner._parse_package_json(f["file_path"], content)
                dependencies.extend(deps)
                issues.extend(iss)

        return dependencies, issues

    @staticmethod
    def _parse_requirements(file_path: str, content: str) -> Tuple[List[Dict[str, Any]], List[Dict[str, Any]]]:
        deps = []
        issues = []
        lines = content.splitlines()

        for idx, line in enumerate(lines, 1):
            line = line.strip()
            if not line or line.startswith("#") or line.startswith("-"):
                continue

            match = re.match(r'^([a-zA-Z0-9_\-\.]+)\s*(?:==|>=|<=|~=|>|<)?\s*([0-9a-zA-Z\.\-]+)?', line)
            if match:
                pkg_name = match.group(1).lower()
                version = match.group(2) or "latest"

                vuln_info = KNOWN_VULNERABILITIES.get((pkg_name, "pip"))
                vuln_count = 1 if vuln_info else 0
                vuln_desc = vuln_info["description"] if vuln_info else None
                latest_rec = vuln_info["recommended"] if vuln_info else "latest"

                deps.append({
                    "package_name": pkg_name,
                    "current_version": version,
                    "package_manager": "pip",
                    "dependency_type": "production",
                    "latest_version": latest_rec,
                    "vulnerability_count": vuln_count,
                    "vulnerability_desc": vuln_desc
                })

                if vuln_info:
                    issues.append({
                        "category": "dependency",
                        "severity": vuln_info["severity"],
                        "title": f"Vulnerable Dependency `{pkg_name}` ({version})",
                        "description": f"Package `{pkg_name}` at version {version} is affected by {vuln_info['cve']}: {vuln_info['description']}.",
                        "why_it_matters": "Known vulnerabilities in third-party packages can be directly exploited without flaws in your business code.",
                        "recommendation": f"Upgrade `{pkg_name}` to version {vuln_info['recommended']} or higher in requirements.txt.",
                        "line_start": idx,
                        "line_end": idx,
                        "code_snippet": line,
                        "detected_by": "RepoMind Dependency Auditor"
                    })

        return deps, issues

    @staticmethod
    def _parse_package_json(file_path: str, content: str) -> Tuple[List[Dict[str, Any]], List[Dict[str, Any]]]:
        deps = []
        issues = []
        try:
            data = json.loads(content)
            prod_deps = data.get("dependencies", {})
            dev_deps = data.get("devDependencies", {})

            for name, ver in prod_deps.items():
                clean_ver = re.sub(r'[\^~>=<]', '', ver)
                vuln_info = KNOWN_VULNERABILITIES.get((name.lower(), "npm"))
                vuln_count = 1 if vuln_info else 0
                vuln_desc = vuln_info["description"] if vuln_info else None
                latest_rec = vuln_info["recommended"] if vuln_info else "latest"

                deps.append({
                    "package_name": name,
                    "current_version": clean_ver,
                    "package_manager": "npm",
                    "dependency_type": "production",
                    "latest_version": latest_rec,
                    "vulnerability_count": vuln_count,
                    "vulnerability_desc": vuln_desc
                })

                if vuln_info:
                    issues.append({
                        "category": "dependency",
                        "severity": vuln_info["severity"],
                        "title": f"Vulnerable NPM Package `{name}` ({clean_ver})",
                        "description": f"Package `{name}` has a known security advisory {vuln_info['cve']}: {vuln_info['description']}.",
                        "why_it_matters": "Client-side or server-side vulnerabilities in NPM dependencies can enable DoS, XSS, or Prototype Pollution.",
                        "recommendation": f"Upgrade `{name}` to version {vuln_info['recommended']} in package.json and run `npm install`.",
                        "line_start": 1,
                        "line_end": 1,
                        "code_snippet": f'"{name}": "{ver}"',
                        "detected_by": "RepoMind NPM Auditor"
                    })

            for name, ver in dev_deps.items():
                clean_ver = re.sub(r'[\^~>=<]', '', ver)
                deps.append({
                    "package_name": name,
                    "current_version": clean_ver,
                    "package_manager": "npm",
                    "dependency_type": "development",
                    "latest_version": "latest",
                    "vulnerability_count": 0,
                    "vulnerability_desc": None
                })
        except Exception:
            pass

        return deps, issues
