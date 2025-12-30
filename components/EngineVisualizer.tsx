
import React, { useState, useEffect } from 'react';
import { EngineStatus } from '../types';

interface EngineVisualizerProps {
  status: EngineStatus;
  load: number;
}

const EngineVisualizer: React.FC<EngineVisualizerProps> = ({ status, load }) => {
  const [rotation, setRotation] = useState(0);

  useEffect(() => {
    let animationFrame: number;
    const animate = () => {
      const speed = status === EngineStatus.RUNNING ? (load / 20) + 1 : 0.5;
      setRotation(prev => (prev + speed) % 360);
      animationFrame = requestAnimationFrame(animate);
    };
    animate();
    return () => cancelAnimationFrame(animationFrame);
  }, [status, load]);

  const getStatusColor = () => {
    switch (status) {
      case EngineStatus.RUNNING: return 'emerald';
      case EngineStatus.PAUSED: return 'amber';
      case EngineStatus.ERROR: return 'red';
      case EngineStatus.OPTIMIZING: return 'blue';
      default: return 'slate';
    }
  };

  const color = getStatusColor();

  return (
    <div className="flex flex-col items-center justify-center p-8 bg-slate-900/80 rounded-2xl border border-slate-700/50 shadow-2xl relative overflow-hidden group h-[420px]" style={{ perspective: '1000px' }}>
      {/* Background Grid Effect */}
      <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ 
        backgroundImage: 'radial-gradient(circle at 2px 2px, #334155 1px, transparent 0)',
        backgroundSize: '24px 24px'
      }}></div>
      
      {/* Scanning Line Effect */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-blue-500/5 to-transparent h-20 w-full animate-[scan_4s_linear_infinite] pointer-events-none"></div>

      <div className="relative w-64 h-64 transition-transform duration-700 hover:scale-105" style={{ transformStyle: 'preserve-3d', transform: 'rotateX(45deg)' }}>
        
        {/* Shadow / Glow Base */}
        <div className={`absolute bottom-[-20px] left-1/2 -translate-x-1/2 w-48 h-48 rounded-full blur-3xl opacity-20 bg-${color}-500 transition-colors duration-500`}></div>

        {/* Outer Rotating Disc */}
        <div 
          className={`absolute inset-0 border-[6px] border-dashed border-${color}-500/30 rounded-full transition-colors duration-500`}
          style={{ transform: `rotateZ(${rotation}deg)` }}
        ></div>

        {/* Inner Counter-Rotating Ring */}
        <div 
          className={`absolute inset-8 border-2 border-${color}-400/50 rounded-full flex items-center justify-center transition-colors duration-500`}
          style={{ transform: `rotateZ(${-rotation * 1.5}deg)` }}
        >
          <div className={`w-full h-0.5 bg-${color}-400/20 absolute top-1/2`}></div>
          <div className={`w-0.5 h-full bg-${color}-400/20 absolute left-1/2`}></div>
        </div>

        {/* 3D Core Sphere */}
        <div 
          className="absolute inset-20 flex items-center justify-center"
          style={{ transform: 'translateZ(50px)' }}
        >
          <div className={`w-24 h-24 rounded-full relative flex items-center justify-center transition-all duration-500 
            ${status === EngineStatus.RUNNING ? 'scale-110 shadow-[0_0_50px_rgba(16,185,129,0.4)]' : ''}
            bg-${color}-500 group-hover:bg-${color}-400 shadow-xl border-4 border-white/20`}>
            
            <i className={`fas ${status === EngineStatus.ERROR ? 'fa-triangle-exclamation' : 'fa-atom'} text-4xl text-white animate-pulse`}></i>
            
            {/* Energy Orbits */}
            {status === EngineStatus.RUNNING && [1, 2, 3].map((i) => (
              <div 
                key={i}
                className="absolute w-32 h-32 border border-white/10 rounded-full"
                style={{ 
                  transform: `rotateX(${i * 60}deg) rotateY(${rotation * 2}deg)`,
                  animation: `orbit ${2 + i}s linear infinite`
                }}
              >
                <div className="absolute top-0 left-1/2 w-2 h-2 bg-white rounded-full shadow-[0_0_10px_white]"></div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Telemetry Overlay */}
      <div className="mt-auto w-full space-y-4 relative z-10">
        <div className="flex justify-between items-end">
          <div>
            <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mb-1">Vector Alignment</p>
            <p className="text-xs font-mono text-slate-300">AZIMUTH: {Math.round(rotation)}°</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mb-1">Core Load</p>
            <p className={`text-sm font-black ${load > 90 ? 'text-red-400' : 'text-emerald-400'}`}>{Math.round(load)}%</p>
          </div>
        </div>
        
        <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden border border-slate-700/50">
          <div 
            className={`h-full transition-all duration-1000 ease-out relative ${load > 90 ? 'bg-red-500' : 'bg-emerald-500'}`} 
            style={{ width: `${load}%` }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-[shimmer_2s_infinite]"></div>
          </div>
        </div>

        <div className="flex justify-center pt-2">
           <div className="flex items-center space-x-3 px-4 py-1.5 bg-slate-800/50 rounded-full border border-slate-700/50">
             <div className={`w-2 h-2 rounded-full bg-${color}-500 shadow-[0_0_8px] shadow-${color}-500 animate-pulse`}></div>
             <span className="text-[10px] font-black tracking-[0.3em] text-slate-300 uppercase">{status}</span>
           </div>
        </div>
      </div>

      <style>{`
        @keyframes scan {
          from { transform: translateY(-100%); }
          to { transform: translateY(400%); }
        }
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        @keyframes orbit {
          from { transform: rotateX(var(--rx)) rotateY(0deg); }
          to { transform: rotateX(var(--rx)) rotateY(360deg); }
        }
      `}</style>
    </div>
  );
};

export default EngineVisualizer;
