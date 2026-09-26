import ast
import re
from typing import Dict, List, Any, Tuple

class CodeAnalyzer:
    @staticmethod
    def analyze_file(file_info: Dict[str, Any]) -> Tuple[Dict[str, Any], List[Dict[str, Any]]]:
        rel_path = file_info["file_path"]
        content = file_info.get("content_text", "")
        lang = file_info.get("language", "")
        
        metrics = {
            "cyclomatic_complexity": 1.0,
            "maintainability_index": 95.0,
            "function_count": 0,
            "class_count": 0,
            "import_count": 0,
            "duplicate_ratio": 0.0
        }
        issues: List[Dict[str, Any]] = []

        if lang == "Python":
            metrics, py_issues = CodeAnalyzer._analyze_python(rel_path, content)
            issues.extend(py_issues)
        elif lang in ("JavaScript", "TypeScript", "TypeScript (React)", "JavaScript (React)"):
            metrics, js_issues = CodeAnalyzer._analyze_js_ts(rel_path, content)
            issues.extend(js_issues)
        else:
            # Generic lines analysis
            lines = content.splitlines()
            metrics["import_count"] = sum(1 for line in lines if "import " in line or "require(" in line)

        return metrics, issues

    @staticmethod
    def _analyze_python(rel_path: str, content: str) -> Tuple[Dict[str, Any], List[Dict[str, Any]]]:
        metrics = {
            "cyclomatic_complexity": 1.0,
            "maintainability_index": 90.0,
            "function_count": 0,
            "class_count": 0,
            "import_count": 0,
            "duplicate_ratio": 0.0
        }
        issues: List[Dict[str, Any]] = []

        try:
            tree = ast.parse(content)
        except SyntaxError as e:
            issues.append({
                "category": "code_quality",
                "severity": "high",
                "title": "Syntax Error in Python File",
                "description": f"File failed to parse: {e.msg}",
                "why_it_matters": "Syntax errors prevent execution and indicate broken code.",
                "recommendation": "Fix the syntax syntax error at the specified line.",
                "line_start": e.lineno,
                "line_end": e.lineno,
                "code_snippet": e.text.strip() if e.text else "",
                "detected_by": "Python AST Parser"
            })
            return metrics, issues

        total_complexity = 1
        lines = content.splitlines()

        for node in ast.walk(tree):
            if isinstance(node, (ast.FunctionDef, ast.AsyncFunctionDef)):
                metrics["function_count"] += 1
                fn_lines = (node.end_lineno or node.lineno) - node.lineno + 1
                
                # Cyclomatic complexity approximation
                fn_complexity = 1
                for child in ast.walk(node):
                    if isinstance(child, (ast.If, ast.While, ast.For, ast.ExceptHandler, ast.With, ast.Assert)):
                        fn_complexity += 1
                    elif isinstance(child, ast.BoolOp):
                        fn_complexity += len(child.values) - 1

                total_complexity += fn_complexity

                if fn_complexity > 8:
                    snippet = "\n".join(lines[node.lineno-1:min(node.lineno+5, len(lines))])
                    issues.append({
                        "category": "code_quality",
                        "severity": "medium",
                        "title": f"High Cyclomatic Complexity in function `{node.name}`",
                        "description": f"Function `{node.name}` has a complexity score of {fn_complexity}, which exceeds the recommended threshold of 8.",
                        "why_it_matters": "Functions with high cyclomatic complexity are prone to edge-case bugs and are difficult to test and maintain.",
                        "recommendation": "Break down the complex logic into smaller helper functions or use lookup tables/polymorphism.",
                        "line_start": node.lineno,
                        "line_end": node.end_lineno or node.lineno,
                        "code_snippet": snippet,
                        "detected_by": "RepoMind AST Complexity Analyzer"
                    })

                if fn_lines > 50:
                    issues.append({
                        "category": "code_quality",
                        "severity": "low",
                        "title": f"Long Function `{node.name}` ({fn_lines} lines)",
                        "description": f"Function `{node.name}` spans {fn_lines} lines. Functions over 50 lines often violate single-responsibility principle.",
                        "why_it_matters": "Long functions are harder to read, debug, and unit-test independently.",
                        "recommendation": "Extract distinct sub-operations into dedicated private methods.",
                        "line_start": node.lineno,
                        "line_end": node.end_lineno or node.lineno,
                        "code_snippet": "\n".join(lines[node.lineno-1:min(node.lineno+4, len(lines))]),
                        "detected_by": "RepoMind Code Smell Engine"
                    })

            elif isinstance(node, ast.ClassDef):
                metrics["class_count"] += 1

            elif isinstance(node, (ast.Import, ast.ImportFrom)):
                metrics["import_count"] += 1

            elif isinstance(node, ast.ExceptHandler):
                # Check for empty or bare except: pass
                if not node.type or (len(node.body) == 1 and isinstance(node.body[0], ast.Pass)):
                    issues.append({
                        "category": "bug_risk",
                        "severity": "medium",
                        "title": "Silent Exception Swallowing (`except: pass`)",
                        "description": "Catching general exceptions and silently passing obscures runtime failures.",
                        "why_it_matters": "Silencing exceptions makes unexpected system errors, network timeouts, and database failures invisible in production.",
                        "recommendation": "Catch specific exception classes and log the stack trace using a logging library.",
                        "line_start": node.lineno,
                        "line_end": node.end_lineno or node.lineno,
                        "code_snippet": "\n".join(lines[node.lineno-1:node.end_lineno or node.lineno]),
                        "detected_by": "RepoMind Bug Hunter"
                    })

        avg_complexity = round(total_complexity / max(metrics["function_count"], 1), 2)
        metrics["cyclomatic_complexity"] = avg_complexity
        # Maintainability index approximation
        loc = max(len(lines), 1)
        mi = max(20.0, min(100.0, 100 - (avg_complexity * 4.5) - (loc / 25.0)))
        metrics["maintainability_index"] = round(mi, 1)

        return metrics, issues

    @staticmethod
    def _analyze_js_ts(rel_path: str, content: str) -> Tuple[Dict[str, Any], List[Dict[str, Any]]]:
        metrics = {
            "cyclomatic_complexity": 1.0,
            "maintainability_index": 88.0,
            "function_count": 0,
            "class_count": 0,
            "import_count": 0,
            "duplicate_ratio": 0.0
        }
        issues: List[Dict[str, Any]] = []
        lines = content.splitlines()

        # Count functions (arrow, standard, class methods)
        fn_matches = re.findall(r'(function\s+\w+|\w+\s*=\s*\(.*?\)\s*=>|const\s+\w+\s*=\s*function)', content)
        metrics["function_count"] = len(fn_matches)
        
        # Count classes
        class_matches = re.findall(r'\bclass\s+\w+', content)
        metrics["class_count"] = len(class_matches)

        # Count imports
        import_matches = re.findall(r'\bimport\s+.*?\s+from|\brequire\(', content)
        metrics["import_count"] = len(import_matches)

        # Look for console.log statements left in production code
        for idx, line in enumerate(lines, 1):
            if re.search(r'\bconsole\.(log|debug|warn|info)\b', line) and not line.strip().startswith("//"):
                issues.append({
                    "category": "code_quality",
                    "severity": "low",
                    "title": "Unremoved Console Log Statement",
                    "description": "Production code contains direct `console.log` statements.",
                    "why_it_matters": "Can leak sensitive variable states to client browser devtools and degrade runtime performance.",
                    "recommendation": "Remove console statements or replace with a configurable logging utility.",
                    "line_start": idx,
                    "line_end": idx,
                    "code_snippet": line.strip(),
                    "detected_by": "RepoMind Linter"
                })

            if re.search(r'\bany\b', line) and rel_path.endswith((".ts", ".tsx")):
                if ": any" in line or "<any>" in line or "as any" in line:
                    issues.append({
                        "category": "code_quality",
                        "severity": "low",
                        "title": "TypeScript `any` Type Usage",
                        "description": "Using `any` type bypasses TypeScript type-checking safety.",
                        "why_it_matters": "Reduces type safety and can lead to unexpected runtime undefined attribute errors.",
                        "recommendation": "Define a strict TypeScript interface or generic type instead of `any`.",
                        "line_start": idx,
                        "line_end": idx,
                        "code_snippet": line.strip(),
                        "detected_by": "RepoMind TypeScript Inspector"
                    })

        loc = max(len(lines), 1)
        metrics["cyclomatic_complexity"] = round(1.0 + (len(re.findall(r'\b(if|for|while|switch|case|\?\?|\&\&|\|\|)\b', content)) / max(len(lines), 1) * 10), 2)
        metrics["maintainability_index"] = round(max(30.0, 100 - (metrics["cyclomatic_complexity"] * 3) - (loc / 30.0)), 1)

        return metrics, issues
