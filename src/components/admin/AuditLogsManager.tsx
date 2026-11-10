import React, { useState, useEffect } from 'react';
import { AuditLog } from '../../types';
import { ShieldCheck, Clock, User, Filter, RefreshCw } from 'lucide-react';
import { apiRequest } from '../../services/api';

import { AuditLogDetailsDrawer } from './drawers/AuditLogDetailsDrawer';
import { Eye } from 'lucide-react';

export const AuditLogsManager: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);

  const fetchLogs = () => {
    setIsLoading(true);
    apiRequest('/admin/audit-logs').then((res) => {
      setIsLoading(false);
      if (res.success && res.logs) {
        setLogs(res.logs);
      }
    });
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  return (
    <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xs space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-black text-slate-900">System Administrative Audit Trail</h2>
            <p className="text-xs text-slate-500">
              Chronological ledger of catalog updates, order transitions, and system events.
            </p>
          </div>
        </div>

        <button
          onClick={fetchLogs}
          disabled={isLoading}
          className="px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 flex items-center gap-2 self-start sm:self-auto cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Refresh Audit Logs</span>
        </button>
      </div>

      <div className="divide-y divide-slate-100">
        {logs.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-400">
            No audit events recorded yet. New administrative actions will appear here.
          </div>
        ) : (
          logs.map((log) => (
            <div
              key={log._id}
              onClick={() => setSelectedLog(log)}
              className="py-3.5 px-3 rounded-2xl hover:bg-slate-50/80 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-2 cursor-pointer group"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-xs bg-slate-100 text-slate-800 px-2 py-0.5 rounded-md">
                    {log.action}
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">
                    {log.module}
                  </span>
                </div>
                <p className="text-xs text-slate-700">{log.details}</p>
              </div>

              <div className="flex items-center gap-3 self-end sm:self-auto">
                <div className="text-right text-[11px] text-slate-400 shrink-0">
                  <p className="font-semibold text-slate-600">By {log.actorName} ({log.actorRole})</p>
                  <p className="font-mono text-[10px]">{new Date(log.timestamp).toLocaleString()}</p>
                </div>
                <div className="p-1.5 rounded-lg text-slate-400 group-hover:text-blue-600 group-hover:bg-blue-50 transition">
                  <Eye className="w-4 h-4" />
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Audit Log Inspection Drawer */}
      <AuditLogDetailsDrawer
        isOpen={!!selectedLog}
        onClose={() => setSelectedLog(null)}
        log={selectedLog}
      />
    </div>
  );
};
