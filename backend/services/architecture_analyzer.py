import os
import re
from pathlib import Path
from typing import Dict, List, Any, Tuple
import networkx as nx

class ArchitectureAnalyzer:
    @staticmethod
    def analyze_architecture(files: List[Dict[str, Any]]) -> Tuple[Dict[str, Any], List[Dict[str, Any]]]:
        G = nx.DiGraph()
        module_map = {}

        # 1. Map file paths to module names
        for f in files:
            p = f["file_path"]
            # Exclude non-code files from architecture graph
            if not p.endswith((".py", ".ts", ".tsx", ".js", ".jsx")):
                continue
            
            # Module ID e.g. "users", "payment", "database", "frontend/Login"
            mod_id = Path(p).with_suffix("").as_posix()
            mod_name = Path(p).stem
            
            # Determine layer type
            layer = "service"
            p_lower = p.lower()
            if "frontend" in p_lower or "view" in p_lower or "component" in p_lower:
                layer = "frontend"
            elif "api" in p_lower or "route" in p_lower or "controller" in p_lower:
                layer = "api"
            elif "data" in p_lower or "db" in p_lower or "model" in p_lower or "repo" in p_lower:
                layer = "database"
            elif "util" in p_lower or "helper" in p_lower or "config" in p_lower:
                layer = "util"
            
            module_map[mod_name] = mod_id
            module_map[mod_id] = mod_id

            G.add_node(mod_id, label=f"{mod_name}.{f['extension'].lstrip('.')}", layer=layer, file_path=p, loc=f.get("line_count", 0))

        # 2. Extract import dependencies
        for f in files:
            p = f["file_path"]
            if not p.endswith((".py", ".ts", ".tsx", ".js", ".jsx")):
                continue

            src_mod_id = Path(p).with_suffix("").as_posix()
            content = f.get("content_text", "")
            lines = content.splitlines()

            for line in lines:
                line_str = line.strip()
                # Python imports: import xyz / from xyz import abc
                py_match = re.match(r'^(?:from\s+([a-zA-Z0-9_\.]+)\s+import|import\s+([a-zA-Z0-9_\.]+))', line_str)
                if py_match:
                    target = py_match.group(1) or py_match.group(2)
                    target_root = target.split(".")[0]
                    for node in G.nodes():
                        if node == target_root or node.endswith(f"/{target_root}"):
                            if src_mod_id != node:
                                G.add_edge(src_mod_id, node)

                # JS/TS imports: import ... from './xyz'
                js_match = re.search(r'from\s+[\'"]([^\'"]+)[\'"]', line_str)
                if js_match:
                    target = js_match.group(1).lstrip("./")
                    target_clean = Path(target).with_suffix("").as_posix()
                    for node in G.nodes():
                        if node == target_clean or node.endswith(f"/{target_clean}") or target_clean in node:
                            if src_mod_id != node:
                                G.add_edge(src_mod_id, node)

        # 3. Detect Circular Dependencies (cycles)
        cycles = []
        try:
            cycles = list(nx.simple_cycles(G))
        except Exception:
            pass

        circular_edges = set()
        for cycle in cycles:
            for i in range(len(cycle)):
                u = cycle[i]
                v = cycle[(i + 1) % len(cycle)]
                circular_edges.add((u, v))

        # 4. Generate Architecture Findings & Issues
        findings = []
        issues = []

        # Circular dependency findings
        for cycle in cycles:
            cycle_str = " -> ".join([G.nodes[n].get("label", n) for n in cycle] + [G.nodes[cycle[0]].get("label", cycle[0])])
            src = cycle[0]
            tgt = cycle[1] if len(cycle) > 1 else cycle[0]

            findings.append({
                "finding_type": "circular_dependency",
                "source_module": src,
                "target_module": tgt,
                "coupling_score": 90.0,
                "recommendation": f"Break the circular dependency chain `{cycle_str}` by introducing a mediator interface, service event bus, or moving shared dependencies into a core utility layer."
            })

            issues.append({
                "category": "architecture",
                "severity": "high",
                "title": f"Circular Dependency Detected: {cycle_str}",
                "description": f"A mutual import loop was discovered between modules ({cycle_str}).",
                "why_it_matters": "Circular dependencies cause tight coupling, initialization race conditions, memory leaks, and prevent modular unit testing.",
                "recommendation": "Decouple modules by introducing an abstraction layer or extracting common models into a shared module.",
                "line_start": 1,
                "line_end": 1,
                "code_snippet": f"import loop: {cycle_str}",
                "detected_by": "RepoMind Architecture Graph Analyzer",
                "arch_meta": {
                    "finding_type": "circular_dependency",
                    "source_module": src,
                    "target_module": tgt,
                    "coupling_score": 85.0,
                    "recommendation": "Introduce a service layer or shared abstraction."
                }
            })

        # High coupling detection
        for node in G.nodes():
            in_deg = G.in_degree(node)
            out_deg = G.out_degree(node)
            total_deg = in_deg + out_deg
            if total_deg >= 4:
                node_label = G.nodes[node].get("label", node)
                findings.append({
                    "finding_type": "high_coupling",
                    "source_module": node,
                    "target_module": "multiple",
                    "coupling_score": float(total_deg * 10),
                    "recommendation": f"Module `{node_label}` has {total_deg} incoming/outgoing dependencies. Consider refactoring with facade or dependency injection."
                })
                issues.append({
                    "category": "architecture",
                    "severity": "medium",
                    "title": f"High Architectural Coupling on `{node_label}`",
                    "description": f"Module `{node_label}` is connected to {total_deg} distinct modules (in: {in_deg}, out: {out_deg}).",
                    "why_it_matters": "Highly coupled modules make code modifications risky because changes ripple across all dependent services.",
                    "recommendation": "Encapsulate responsibilities and use interfaces/protocols to reduce coupling.",
                    "line_start": 1,
                    "line_end": 1,
                    "code_snippet": f"Module: {node} (connections: {total_deg})",
                    "detected_by": "RepoMind Architecture Graph Analyzer",
                    "arch_meta": {
                        "finding_type": "high_coupling",
                        "source_module": node,
                        "target_module": None,
                        "coupling_score": float(total_deg * 10),
                        "recommendation": "Apply Dependency Inversion Principle."
                    }
                })

        # 5. Build React Flow Node & Edge layout
        rf_nodes = []
        rf_edges = []

        # Layer positions
        layer_x = {
            "frontend": 100,
            "api": 350,
            "service": 600,
            "database": 850,
            "util": 600
        }
        layer_y_counts = {"frontend": 0, "api": 0, "service": 0, "database": 0, "util": 0}

        for node_id in G.nodes():
            node_data = G.nodes[node_id]
            layer = node_data.get("layer", "service")
            
            x = layer_x.get(layer, 500)
            if layer == "util":
                y = 420 + (layer_y_counts[layer] * 90)
            else:
                y = 80 + (layer_y_counts[layer] * 120)
            
            layer_y_counts[layer] = layer_y_counts.get(layer, 0) + 1

            rf_nodes.append({
                "id": node_id,
                "label": node_data.get("label", node_id),
                "type": layer,
                "position": {"x": x, "y": y},
                "details": {
                    "filePath": node_data.get("file_path", ""),
                    "loc": node_data.get("loc", 0),
                    "inDegree": G.in_degree(node_id),
                    "outDegree": G.out_degree(node_id),
                    "isCircular": any(node_id in c for c in cycles)
                }
            })

        for u, v in G.edges():
            is_circ = (u, v) in circular_edges or (v, u) in circular_edges
            rf_edges.append({
                "id": f"e_{u}_{v}",
                "source": u,
                "target": v,
                "label": "imports",
                "is_circular": is_circ
            })

        coupling_score = min(100.0, round(float(len(G.edges())) / max(len(G.nodes()), 1) * 20.0, 1))
        cohesion_score = max(30.0, round(100.0 - (len(cycles) * 15.0) - (coupling_score * 0.3), 1))

        graph_result = {
            "nodes": rf_nodes,
            "edges": rf_edges,
            "coupling_score": coupling_score,
            "cohesion_score": cohesion_score,
            "circular_dependencies_count": len(cycles),
            "architecture_type": "Layered Micro-Modular Architecture",
            "findings": findings
        }

        return graph_result, issues
