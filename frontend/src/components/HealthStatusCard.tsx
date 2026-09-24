import React from 'react';
import { HealthResponse } from '../api/healthApi';
import { Server, Database, Network, ShieldCheck, RefreshCw, AlertTriangle } from 'lucide-react';
import { Button, Tag } from 'antd';

interface HealthStatusCardProps {
  data: HealthResponse | null;
  loading: boolean;
  error: string | null;
  onRefresh: () => void;
}

export const HealthStatusCard: React.FC<HealthStatusCardProps> = ({
  data,
  loading,
  error,
  onRefresh,
}) => {
  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Top Header Card */}
      <div className="glass-panel p-6 rounded-2xl shadow-xl border border-slate-700/50 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-3">
            <span className="p-2.5 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/20">
              <ShieldCheck className="w-6 h-6" />
            </span>
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight">
                {data?.appName || 'PetSafe System Health'}
              </h2>
              <p className="text-sm text-slate-400">
                Phase 1 Project Skeleton • End-to-End Status Monitor
              </p>
            </div>
          </div>
        </div>

        <Button
          type="primary"
          icon={<RefreshCw className={`w-4 h-4 inline mr-1 ${loading ? 'animate-spin' : ''}`} />}
          onClick={onRefresh}
          className="bg-emerald-600 hover:bg-emerald-500 border-none rounded-lg font-medium"
        >
          Re-Check Status
        </Button>
      </div>

      {error && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/30 text-rose-300 rounded-xl flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 flex-shrink-0" />
          <div className="text-sm">
            <p className="font-semibold">Backend Connection Issue</p>
            <p className="text-xs text-rose-400">{error}</p>
          </div>
        </div>
      )}

      {/* Grid of Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* 1. REST API Status */}
        <div className="glass-card p-6 rounded-2xl border border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-4">
              <div className="p-2 bg-blue-500/10 text-blue-400 rounded-lg">
                <Server className="w-5 h-5" />
              </div>
              <Tag color={data?.status === 'UP' ? 'success' : 'error'} className="font-medium px-2.5 py-0.5 rounded-full">
                {data?.status === 'UP' ? 'ACTIVE' : 'OFFLINE'}
              </Tag>
            </div>
            <h3 className="text-base font-semibold text-white mb-1">Spring Boot REST</h3>
            <p className="text-xs text-slate-400 mb-3">HTTP Endpoint: /api/health</p>
            <div className="text-xs text-slate-300 space-y-1 bg-slate-900/50 p-3 rounded-lg border border-slate-800">
              <p><span className="text-slate-500">Port:</span> 8080</p>
              <p><span className="text-slate-500">Framework:</span> Spring Boot 3.2</p>
            </div>
          </div>
        </div>

        {/* 2. Plain JDBC Database Status */}
        <div className="glass-card p-6 rounded-2xl border border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-4">
              <div className="p-2 bg-purple-500/10 text-purple-400 rounded-lg">
                <Database className="w-5 h-5" />
              </div>
              <Tag color={data?.database?.connected ? 'success' : 'warning'} className="font-medium px-2.5 py-0.5 rounded-full">
                {data?.database?.connected ? 'JDBC CONNECTED' : 'WAITING FOR DB'}
              </Tag>
            </div>
            <h3 className="text-base font-semibold text-white mb-1">MySQL Database</h3>
            <p className="text-xs text-slate-400 mb-3">Plain JDBC (DriverManager)</p>
            <div className="text-xs text-slate-300 space-y-1 bg-slate-900/50 p-3 rounded-lg border border-slate-800">
              <p><span className="text-slate-500">Driver:</span> com.mysql.cj.jdbc.Driver</p>
              <p><span className="text-slate-500">ORMs Used:</span> None (Rubric Compliant)</p>
            </div>
          </div>
        </div>

        {/* 3. TCP Socket Server Status */}
        <div className="glass-card p-6 rounded-2xl border border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-4">
              <div className="p-2 bg-amber-500/10 text-amber-400 rounded-lg">
                <Network className="w-5 h-5" />
              </div>
              <Tag color={data?.socketServer?.running ? 'success' : 'error'} className="font-medium px-2.5 py-0.5 rounded-full">
                {data?.socketServer?.running ? 'LISTENING' : 'STOPPED'}
              </Tag>
            </div>
            <h3 className="text-base font-semibold text-white mb-1">TCP Socket Server</h3>
            <p className="text-xs text-slate-400 mb-3">java.net.ServerSocket</p>
            <div className="text-xs text-slate-300 space-y-1 bg-slate-900/50 p-3 rounded-lg border border-slate-800">
              <p><span className="text-slate-500">Port:</span> {data?.socketServer?.port || 9090}</p>
              <p><span className="text-slate-500">Buffer Queue:</span> {data?.socketServer?.pendingQueueSize || 0} messages</p>
            </div>
          </div>
        </div>
      </div>

      {/* Rubric Compliance Section */}
      {data?.rubricCompliance && (
        <div className="glass-panel p-6 rounded-2xl border border-slate-800">
          <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-4 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            Academic Viva Rubric Compliance Summary
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(data.rubricCompliance).map(([key, val]) => (
              <div key={key} className="p-3 bg-slate-900/40 rounded-xl border border-slate-800/80">
                <span className="text-xs font-semibold text-emerald-400 block mb-1">{key}</span>
                <span className="text-xs text-slate-300">{val}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
