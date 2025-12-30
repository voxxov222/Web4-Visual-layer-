
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  EngineStatus, 
  EngineMetric, 
  EngineLog, 
  EngineConfig,
  EnginePreset
} from './types';
import { 
  INITIAL_CONFIG, 
  MAX_LOGS, 
  METRIC_HISTORY_LENGTH 
} from './constants.tsx';
import MetricsChart from './components/MetricsChart';
import EngineVisualizer from './components/EngineVisualizer';
import LogViewer from './components/LogViewer';
import AIChatSidebar from './components/AIChatSidebar';
import NeuralLandscape from './components/NeuralLandscape';
import SciChartPane from './components/SciChartPane';
import DependencyWheelChart from './components/DependencyWheelChart';
import WaveChart3D from './components/WaveChart3D';
import { getEngineAdvice, deepEngineAnalysis } from './services/geminiService';

const App: React.FC = () => {
  // State
  const [status, setStatus] = useState<EngineStatus>(EngineStatus.IDLE);
  const [config, setConfig] = useState<EngineConfig>(INITIAL_CONFIG);
  const [metrics, setMetrics] = useState<EngineMetric[]>([]);
  const [logs, setLogs] = useState<EngineLog[]>([]);
  const [advice, setAdvice] = useState<string>("Initializing neural pathways...");
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [isDeepAnalyzing, setIsDeepAnalyzing] = useState(false);
  const [activeCryptoNode, setActiveCryptoNode] = useState('BTC');
  const [viewMode, setViewMode] = useState<'standard' | 'neural'>('neural');
  const [isFullScreen, setIsFullScreen] = useState(false);
  
  // Presets State
  const [presets, setPresets] = useState<EnginePreset[]>([]);

  const metricsRef = useRef<EngineMetric[]>([]);
  const configRef = useRef<EngineConfig>(config);
  const statusRef = useRef<EngineStatus>(status);

  useEffect(() => { metricsRef.current = metrics; }, [metrics]);
  useEffect(() => { configRef.current = config; }, [config]);
  useEffect(() => { statusRef.current = status; }, [status]);

  useEffect(() => {
    const saved = localStorage.getItem('primed_engine_presets');
    if (saved) {
      try {
        setPresets(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse presets", e);
      }
    }
  }, []);

  const addLog = useCallback((message: string, level: EngineLog['level'] = 'info') => {
    setLogs(prev => {
      const newLog: EngineLog = {
        id: Math.random().toString(36).substr(2, 9),
        timestamp: new Date(),
        level,
        message
      };
      return [newLog, ...prev].slice(0, MAX_LOGS);
    });
  }, []);

  useEffect(() => {
    if (status !== EngineStatus.RUNNING && status !== EngineStatus.OPTIMIZING) return;

    const interval = setInterval(() => {
      const timestamp = new Date().toLocaleTimeString();
      const currentConfig = configRef.current;
      const baseThroughput = currentConfig.coreFrequency * 150;
      const throughput = Math.max(0, baseThroughput + (currentConfig.plasmaDensity * 100) + (Math.random() * 20 - 10));
      const temperature = Math.max(20, (40 + (currentConfig.coreFrequency * 10)) - (currentConfig.coolantFlow * 0.1) + (Math.random() * 5));
      const efficiency = Math.min(100, (throughput / (currentConfig.coreFrequency * 250)) * 100);
      const load = Math.min(100, (throughput / 1500) * 100);

      const newMetric: EngineMetric = {
        timestamp,
        throughput: parseFloat(throughput.toFixed(2)),
        temperature: parseFloat(temperature.toFixed(1)),
        efficiency: parseFloat(efficiency.toFixed(1)),
        load: parseFloat(load.toFixed(1))
      };

      setMetrics(prev => [...prev, newMetric].slice(-METRIC_HISTORY_LENGTH));

      if (temperature > currentConfig.safetyThreshold && statusRef.current === EngineStatus.RUNNING) {
        setStatus(EngineStatus.ERROR);
        addLog(`Emergency Stop: Core Temp ${temperature.toFixed(1)}°C exceeds threshold!`, 'error');
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [status, addLog]);

  useEffect(() => {
    let adviceInterval: number | undefined;
    const fetchAdvice = async () => {
      if (statusRef.current !== EngineStatus.RUNNING) return;
      if (metricsRef.current.length === 0) return;
      const result = await getEngineAdvice(metricsRef.current, configRef.current, statusRef.current);
      setAdvice(result);
    };

    if (status === EngineStatus.RUNNING) {
      fetchAdvice();
      adviceInterval = window.setInterval(fetchAdvice, 60000);
    }
    return () => { if (adviceInterval) clearInterval(adviceInterval); };
  }, [status]);

  const toggleEngine = () => {
    if (status === EngineStatus.IDLE || status === EngineStatus.PAUSED) {
      setStatus(EngineStatus.RUNNING);
      addLog('Engine sequence initiated', 'success');
    } else {
      setStatus(EngineStatus.PAUSED);
      addLog('Engine cycle suspended', 'warn');
    }
  };

  const updateConfig = (key: keyof EngineConfig, val: number) => {
    setConfig(prev => ({ ...prev, [key]: val }));
  };

  return (
    <div className="flex h-screen w-full bg-slate-950 overflow-hidden font-sans text-slate-200">
      {/* Immersive Full Screen Overlay */}
      {isFullScreen && (
        <div className="fixed inset-0 z-[100] bg-slate-950 flex flex-col">
          <div className="absolute top-8 right-8 z-[110] flex space-x-4">
             <div className="hidden lg:block w-96 bg-slate-900/40 backdrop-blur-xl border border-white/5 p-4 rounded-2xl h-64 shadow-2xl overflow-hidden">
                <WaveChart3D />
             </div>
            <button 
              onClick={() => setIsFullScreen(false)}
              className="px-6 py-2 bg-red-600/20 border border-red-500/50 text-red-400 rounded-lg font-black uppercase tracking-widest hover:bg-red-600/40 transition-all flex items-center space-x-2 h-fit"
            >
              <i className="fas fa-compress"></i>
              <span>Exit Immersion</span>
            </button>
          </div>
          <NeuralLandscape activeNode={activeCryptoNode} isFullScreen={true} />
        </div>
      )}

      <main className={`flex-1 flex flex-col min-w-0 relative ${isFullScreen ? 'hidden' : ''}`}>
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none z-0" style={{ 
          backgroundImage: 'linear-gradient(#3b82f6 1px, transparent 1px), linear-gradient(90deg, #3b82f6 1px, transparent 1px)',
          backgroundSize: '100px 100px'
        }}></div>

        <header className="h-16 shrink-0 bg-slate-900/50 backdrop-blur-md border-b border-slate-800 px-6 flex items-center justify-between z-10">
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center rotate-3 shadow-[0_0_20px_rgba(37,99,235,0.4)] border border-blue-400/30">
              <i className="fas fa-bolt-lightning text-white text-xl"></i>
            </div>
            <div>
              <h1 className="text-lg font-black tracking-tight text-white uppercase italic flex items-center">
                Primed Engine <span className="ml-2 px-1.5 py-0.5 bg-blue-600 text-[8px] rounded not-italic tracking-normal">ULTRA_SYNC_v3</span>
              </h1>
              <p className="text-[10px] text-slate-500 font-mono uppercase">Neural Navigator // Active Stream: {activeCryptoNode}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-6">
            <div className="flex items-center bg-slate-800 p-1 rounded-lg border border-slate-700">
              <button 
                onClick={() => setViewMode('standard')}
                className={`px-3 py-1 rounded text-[9px] font-black uppercase tracking-wider transition-all ${viewMode === 'standard' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
              >
                Telemetry
              </button>
              <button 
                onClick={() => setViewMode('neural')}
                className={`px-3 py-1 rounded text-[9px] font-black uppercase tracking-wider transition-all ${viewMode === 'neural' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
              >
                Neural View
              </button>
            </div>
            <button 
              onClick={toggleEngine}
              className={`px-6 py-2 rounded-lg font-black text-xs uppercase tracking-[0.2em] transition-all border ${
                status === EngineStatus.RUNNING 
                  ? 'bg-slate-800/50 text-slate-400 border-slate-700' 
                  : 'bg-emerald-600/20 text-emerald-400 border-emerald-500/50 hover:bg-emerald-600/30'
              }`}
            >
              <i className={`fas ${status === EngineStatus.RUNNING ? 'fa-pause' : 'fa-play'} mr-2`}></i>
              {status === EngineStatus.RUNNING ? 'Suspend' : 'Initiate'}
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-6 space-y-6 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            <div className="lg:col-span-4 space-y-6">
              <EngineVisualizer status={status} load={metrics[metrics.length-1]?.load || 0} />
              
              <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-2xl p-5 space-y-5 shadow-2xl relative overflow-hidden">
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center">
                   <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-2"></span> Neural Link Nodes
                </h3>
                <div className="grid grid-cols-3 gap-2">
                  {['BTC', 'ETH', 'SOL', 'LINK', 'DOT', 'NEAR'].map(symbol => (
                    <button 
                      key={symbol}
                      onClick={() => setActiveCryptoNode(symbol)}
                      className={`py-2 rounded-lg text-[10px] font-black tracking-widest transition-all border ${
                        activeCryptoNode === symbol 
                        ? 'bg-blue-600 border-blue-400 text-white shadow-[0_0_15px_rgba(37,99,235,0.3)]' 
                        : 'bg-slate-800 border-slate-700 text-slate-500 hover:border-slate-600'
                      }`}
                    >
                      {symbol}
                    </button>
                  ))}
                </div>

                <div className="space-y-4 mt-6">
                  <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Global Parameters</h4>
                  {[
                    { label: 'Core Frequency', key: 'coreFrequency', unit: 'GHz', min: 1, max: 10, step: 0.1, color: 'blue' },
                    { label: 'Plasma Density', key: 'plasmaDensity', unit: '', min: 0, max: 2, step: 0.01, color: 'purple' },
                    { label: 'Coolant Flow', key: 'coolantFlow', unit: 'L/s', min: 0, max: 500, step: 10, color: 'emerald' },
                  ].map((param) => (
                    <div key={param.key} className="space-y-1">
                      <div className="flex justify-between text-[10px] text-slate-500 uppercase font-bold">
                        <span>{param.label}</span>
                        <span className={`text-${param.color}-400 font-mono`}>{config[param.key as keyof EngineConfig]} {param.unit}</span>
                      </div>
                      <input 
                        type="range" min={param.min} max={param.max} step={param.step} 
                        value={config[param.key as keyof EngineConfig]} 
                        onChange={(e) => updateConfig(param.key as keyof EngineConfig, parseFloat(e.target.value))}
                        className={`w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-${param.color}-500 transition-all`}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="lg:col-span-8 space-y-6">
              {viewMode === 'neural' ? (
                <div className="relative group rounded-2xl overflow-hidden shadow-2xl border border-slate-800">
                  <div className="absolute top-4 right-4 z-20">
                    <button 
                      onClick={() => setIsFullScreen(true)}
                      className="px-4 py-1.5 bg-slate-900/80 backdrop-blur-md border border-slate-700 text-slate-300 text-[10px] font-black uppercase tracking-widest rounded-lg hover:bg-blue-600 hover:border-blue-400 hover:text-white transition-all shadow-xl"
                    >
                      <i className="fas fa-expand mr-2"></i>
                      Immersion Mode
                    </button>
                  </div>
                  <NeuralLandscape activeNode={activeCryptoNode} />
                </div>
              ) : (
                <div className="space-y-6 animate-in fade-in duration-500">
                  <MetricsChart data={metrics} />
                  <SciChartPane />
                  <DependencyWheelChart />
                </div>
              )}

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                  { label: 'Market Flow', value: (metrics[metrics.length-1]?.throughput || 0).toFixed(0), unit: 'TX/s', color: 'blue', icon: 'fa-gauge' },
                  { label: 'Node Health', value: '99.9', unit: '%', color: 'emerald', icon: 'fa-shield-halved' },
                  { label: 'Vol Density', value: config.plasmaDensity.toFixed(2), unit: 'ρ', color: 'amber', icon: 'fa-circle-nodes' },
                  { label: 'Neural Load', value: metrics[metrics.length-1]?.load.toFixed(0) || '0', unit: '%', color: 'purple', icon: 'fa-brain' },
                ].map((stat, i) => (
                  <div key={i} className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 transition-all hover:border-slate-600 shadow-xl group">
                    <div className="flex items-center space-x-2 mb-1">
                       <i className={`fas ${stat.icon} text-${stat.color}-400 text-[10px] group-hover:scale-125 transition-transform`}></i>
                       <span className="text-[10px] text-slate-500 uppercase font-black tracking-widest">{stat.label}</span>
                    </div>
                    <div className="flex items-baseline space-x-1">
                      <span className={`text-2xl font-black text-${stat.color}-400`}>{stat.value}</span>
                      <span className="text-[10px] text-slate-600 font-black">{stat.unit}</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-72">
                <LogViewer logs={logs} />
                <div className="bg-slate-900/80 border border-slate-800 rounded-2xl flex flex-col overflow-hidden shadow-2xl relative">
                  <div className="p-3 border-b border-slate-800 bg-slate-800/30 flex items-center justify-between">
                     <div className="flex items-center">
                       <div className={`w-2 h-2 rounded-full mr-2 animate-pulse ${advice.includes('rate-limited') ? 'bg-amber-500' : 'bg-blue-500'}`}></div>
                       <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Neural Diagnostic</h3>
                     </div>
                  </div>
                  <div className="p-6 flex-1 flex flex-col justify-center overflow-y-auto bg-gradient-to-br from-transparent to-blue-500/[0.02]">
                    <div className="border-l-2 border-blue-500/50 pl-4">
                       <p className="text-sm italic text-slate-300 leading-relaxed font-medium">
                        {advice}
                       </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>

        <footer className="h-10 shrink-0 bg-slate-900/80 backdrop-blur-md border-t border-slate-800 px-6 flex items-center justify-between text-[10px] font-mono text-slate-500 z-10">
          <div className="flex items-center space-x-6">
            <span className="flex items-center"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-2 shadow-[0_0_5px_#10b981]"></span>NEURAL_NOMINAL</span>
            <div className="flex space-x-4 uppercase tracking-tighter">
              <span>SYNC: ENABLED</span>
              <span>BUF_SIZE: 1024KB</span>
              <span>RENDER: SCICHART_WASM</span>
            </div>
          </div>
          <div className="font-black text-slate-700 tracking-[0.3em] uppercase">Primed_Engine_Os // Matrix_Link_On</div>
        </footer>
      </main>
      <AIChatSidebar />
    </div>
  );
};

export default App;
