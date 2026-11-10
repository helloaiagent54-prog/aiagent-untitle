import React, { useState } from 'react';
import { Database, Download, RefreshCw, CheckCircle, Shield } from 'lucide-react';
import { apiRequest } from '../../services/api';
import { useAppDispatch } from '../../app/hooks';
import { addToast } from '../../features/ui/uiSlice';

export const BackupManager: React.FC = () => {
  const dispatch = useAppDispatch();
  const [isExporting, setIsExporting] = useState(false);
  const [lastExport, setLastExport] = useState<any>(null);

  const handleExportBackup = async () => {
    setIsExporting(true);
    const res = await apiRequest('/admin/backup/export', { method: 'POST' });
    setIsExporting(false);

    if (res.success && res.backup) {
      setLastExport(res.backup);
      // Trigger browser download of JSON snapshot
      const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(res.backup, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute('href', dataStr);
      downloadAnchor.setAttribute('download', `aurelia_backup_${new Date().toISOString().slice(0, 10)}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();

      dispatch(
        addToast({
          type: 'success',
          title: 'Database Backup Generated',
          message: 'JSON database snapshot downloaded to your device.',
        })
      );
    } else {
      dispatch(
        addToast({
          type: 'error',
          title: 'Backup Failed',
          message: res.message || 'Could not export database snapshot.',
        })
      );
    }
  };

  return (
    <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xs space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-black text-slate-900">Database Backup & Disaster Recovery</h2>
            <p className="text-xs text-slate-500">
              Export complete JSON snapshots of products, categories, orders, coupons, and CMS content.
            </p>
          </div>
        </div>

        <button
          onClick={handleExportBackup}
          disabled={isExporting}
          className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-md shadow-blue-500/20 transition-all self-start sm:self-auto disabled:opacity-50"
        >
          <Download className="w-4 h-4" />
          <span>{isExporting ? 'Generating Snapshot...' : 'Export Full Database Backup'}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
        <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
          <h4 className="font-bold text-slate-800 flex items-center gap-2">
            <Shield className="w-4 h-4 text-emerald-600" />
            Snapshot Specifications
          </h4>
          <ul className="space-y-1.5 text-slate-600 list-disc pl-4">
            <li>Exports all active and archived product records and variant attributes.</li>
            <li>Includes category hierarchy, promotional coupons, and CMS hero slides.</li>
            <li>Contains all historical order records and fulfillment audit notes.</li>
          </ul>
        </div>

        <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
          <h4 className="font-bold text-slate-800">Latest Export Status</h4>
          {lastExport ? (
            <div className="space-y-1 text-slate-600 font-mono text-[11px]">
              <p>Generated: {lastExport.exportDate}</p>
              <p>Products: {lastExport.data?.products?.length || 0} records</p>
              <p>Orders: {lastExport.data?.orders?.length || 0} records</p>
            </div>
          ) : (
            <p className="text-slate-400">No snapshot exported during this active session.</p>
          )}
        </div>
      </div>
    </div>
  );
};
