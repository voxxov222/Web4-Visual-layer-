
import React from 'react';
import { EngineLog } from '../types';

interface LogViewerProps {
  logs: EngineLog[];
}

const LogViewer: React.FC<LogViewerProps> = ({ logs }) => {
  return (
    <div className="bg-slate-900 border border-slate-700 rounded-xl flex flex-col h-full overflow-hidden">
      <div className="p-3 border-b border-slate-700 bg-slate-800 flex justify-between items-center">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">
          <i className="fas fa-terminal mr-2"></i> System Logs
        </h3>
        <span className="text-[10px] text-slate-500">{logs.length} entries</span>
      </div>
      <div className="p-4 space-y-2 overflow-y-auto font-mono text-xs flex-1">
        {logs.map((log) => (
          <div key={log.id} className="flex items-start space-x-2 border-b border-slate-800 pb-1">
            <span className="text-slate-600 shrink-0">[{log.timestamp.toLocaleTimeString()}]</span>
            <span className={`font-bold shrink-0 ${
              log.level === 'error' ? 'text-red-400' : 
              log.level === 'warn' ? 'text-amber-400' : 
              log.level === 'success' ? 'text-emerald-400' : 'text-blue-400'
            }`}>
              {log.level.toUpperCase()}:
            </span>
            <span className="text-slate-300">{log.message}</span>
          </div>
        ))}
        {logs.length === 0 && (
          <div className="text-slate-600 italic">No logs generated yet...</div>
        )}
      </div>
    </div>
  );
};

export default LogViewer;
