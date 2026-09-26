import React, { useEffect, useState } from 'react';
import {
  Package,
  AlertTriangle,
  CheckCircle2,
  ExternalLink,
  ShieldAlert,
  ArrowUpCircle
} from 'lucide-react';
import { useProject } from '../context/ProjectContext';
import { analyticsApi } from '../services/api';
import { Dependency } from '../types';
import { EmptyProjectState } from '../components/EmptyProjectState';

export const DependenciesPage: React.FC = () => {
  const { currentProject } = useProject();
  const [dependencies, setDependencies] = useState<Dependency[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentProject) {
      setDependencies([]);
      setLoading(false);
      return;
    }
    const loadData = async () => {
      setLoading(true);
      try {
        const list = await analyticsApi.getDependencies(currentProject.project_id);
        setDependencies(list || []);
      } catch (err) {
        console.error('Failed to load dependencies', err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [currentProject]);

  if (!currentProject) {
    return (
      <EmptyProjectState
        featureTitle="Dependency & Supply Chain Audit"
        description="Connect a GitHub repository to audit package manifests (requirements.txt, package.json), identify outdated versions, and detect CVE vulnerabilities."
      />
    );
  }

  const vulnerableCount = dependencies.filter((d) => (d.vulnerability_count || 0) > 0).length;

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-2 text-xs font-semibold text-purple-400 mb-1">
          <Package className="w-4 h-4" />
          <span>Supply Chain & Dependency Audit</span>
        </div>
        <h1 className="text-2xl font-black text-white">Dependencies & Packages</h1>
        <p className="text-xs text-slate-400">
          Auditing third-party libraries across Pipfile, requirements.txt, and package.json for <strong className="text-white">{currentProject.name}</strong>.
        </p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 glass-card rounded-2xl border-slate-800">
          <span className="text-xs font-semibold text-slate-400">Total Packages</span>
          <p className="text-3xl font-black text-white mt-1">{dependencies.length}</p>
        </div>
        <div className="p-5 glass-card rounded-2xl border-slate-800">
          <span className="text-xs font-semibold text-rose-400">Vulnerable Dependencies</span>
          <p className="text-3xl font-black text-rose-400 mt-1">{vulnerableCount}</p>
          <span className="text-[10px] text-slate-400">Known CVE Advisories</span>
        </div>
        <div className="p-5 glass-card rounded-2xl border-slate-800">
          <span className="text-xs font-semibold text-emerald-400">Clean Packages</span>
          <p className="text-3xl font-black text-emerald-400 mt-1">{dependencies.length - vulnerableCount}</p>
          <span className="text-[10px] text-slate-400">Up to date</span>
        </div>
      </div>

      {/* Dependencies Table */}
      <div className="glass-card rounded-3xl border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/90 text-slate-400 border-b border-slate-800 uppercase text-[10px] font-bold tracking-wider">
              <tr>
                <th className="px-6 py-4">Package Name</th>
                <th className="px-6 py-4">Manager</th>
                <th className="px-6 py-4">Installed Version</th>
                <th className="px-6 py-4">Recommended</th>
                <th className="px-6 py-4">Vulnerability Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {dependencies.map((d) => {
                const hasVuln = (d.vulnerability_count || 0) > 0;
                return (
                  <tr key={d.dependency_id} className="hover:bg-slate-900/40 transition">
                    <td className="px-6 py-4 font-bold text-white flex items-center gap-2">
                      <Package className="w-4 h-4 text-indigo-400" />
                      <span>{d.package_name}</span>
                    </td>
                    <td className="px-6 py-4 text-slate-400 uppercase font-semibold">{d.package_manager}</td>
                    <td className="px-6 py-4 text-slate-300">{d.current_version || 'latest'}</td>
                    <td className="px-6 py-4 text-indigo-300 font-bold">{d.latest_version || 'latest'}</td>
                    <td className="px-6 py-4">
                      {hasVuln ? (
                        <div className="flex flex-col gap-0.5">
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/30">
                            <ShieldAlert className="w-3 h-3" />
                            CVE Advisory Detected
                          </span>
                          <span className="text-[10px] text-slate-400 font-sans">{d.vulnerability_desc}</span>
                        </div>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30">
                          <CheckCircle2 className="w-3 h-3" />
                          Secure
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
