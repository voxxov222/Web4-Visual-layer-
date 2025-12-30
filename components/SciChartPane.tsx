
import React, { useEffect, useRef, useState } from 'react';
import { 
  SciChartSurface, 
  NumericAxis, 
  FastLineRenderableSeries, 
  XyDataSeries, 
  SciChartJsNavyTheme,
  EAutoRange,
  MouseWheelZoomModifier,
  ZoomPanModifier,
  ZoomExtentsModifier
} from 'scichart';
import { VisibleRangeSynchronizationManager } from '../services/chartSync';

// Configure SciChart to use CDN for WASM to avoid local 404 errors
SciChartSurface.configure({
  wasmUrl: "https://cdn.jsdelivr.net/npm/scichart@3.4.617/_wasm/scichart2d.wasm"
});

const SciChartPane: React.FC = () => {
  const chart1Ref = useRef<HTMLDivElement>(null);
  const chart2Ref = useRef<HTMLDivElement>(null);
  const chart3Ref = useRef<HTMLDivElement>(null);
  const surfacesRef = useRef<SciChartSurface[]>([]);
  const syncManagerRef = useRef<VisibleRangeSynchronizationManager>(new VisibleRangeSynchronizationManager());
  const [syncEnabled, setSyncEnabled] = useState(true);

  useEffect(() => {
    if (syncManagerRef.current) {
      syncManagerRef.current.enabled = syncEnabled;
    }
  }, [syncEnabled]);

  useEffect(() => {
    let timerId: any;
    const initSciChart = async () => {
      try {
        const theme = new SciChartJsNavyTheme();

        const createSurface = async (divElement: HTMLDivElement, title: string, color: string) => {
          const { sciChartSurface, wasmContext } = await SciChartSurface.create(divElement, { theme });
          
          sciChartSurface.xAxes.add(new NumericAxis(wasmContext, { 
            autoRange: EAutoRange.Always, 
            axisTitle: "Timeline",
            labelStyle: { fontSize: 10, color: '#64748b' }
          }));
          sciChartSurface.yAxes.add(new NumericAxis(wasmContext, { 
            autoRange: EAutoRange.Always, 
            axisTitle: title,
            labelStyle: { fontSize: 10, color: '#64748b' }
          }));

          const dataSeries = new XyDataSeries(wasmContext);
          sciChartSurface.renderableSeries.add(new FastLineRenderableSeries(wasmContext, {
            dataSeries,
            stroke: color,
            strokeThickness: 2
          }));

          sciChartSurface.chartModifiers.add(new MouseWheelZoomModifier());
          sciChartSurface.chartModifiers.add(new ZoomPanModifier());
          sciChartSurface.chartModifiers.add(new ZoomExtentsModifier());

          return { sciChartSurface, dataSeries };
        };

        const s1 = await createSurface(chart1Ref.current!, "Throughput", "#3b82f6");
        const s2 = await createSurface(chart2Ref.current!, "Temperature", "#ef4444");
        const s3 = await createSurface(chart3Ref.current!, "Neural Load", "#8b5cf6");

        surfacesRef.current = [s1.sciChartSurface, s2.sciChartSurface, s3.sciChartSurface];
        syncManagerRef.current.sync(s1.sciChartSurface, s2.sciChartSurface, s3.sciChartSurface);

        let t = 0;
        timerId = setInterval(() => {
          const batch = 5;
          for (let i = 0; i < batch; i++) {
            t += 50;
            s1.dataSeries.append(t, 600 + Math.random() * 100 + Math.sin(t / 500) * 50);
            s2.dataSeries.append(t, 45 + Math.random() * 2 + Math.cos(t / 1000) * 5);
            s3.dataSeries.append(t, 70 + Math.random() * 10 + Math.sin(t / 800) * 15);
          }
          
          if (s1.dataSeries.count() > 1000) {
            s1.dataSeries.removeRange(0, batch);
            s2.dataSeries.removeRange(0, batch);
            s3.dataSeries.removeRange(0, batch);
          }
        }, 50);
      } catch (err) {
        console.error("SciChart Init Failed:", err);
      }
    };

    initSciChart();

    return () => {
      if (timerId) clearInterval(timerId);
      surfacesRef.current.forEach(s => {
        try { s.delete(); } catch(e) {}
      });
    };
  }, []);

  return (
    <div className="flex flex-col space-y-4 h-[700px] w-full bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl overflow-hidden relative group">
      <div className="flex justify-between items-center mb-2">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-blue-600/20 rounded flex items-center justify-center border border-blue-500/30">
            <i className="fas fa-sync-alt text-blue-400 text-xs animate-spin-slow"></i>
          </div>
          <div>
            <h3 className="text-xs font-black text-white uppercase tracking-widest">Multi-Stream Synchronizer</h3>
            <p className="text-[9px] text-slate-500 font-mono tracking-tighter uppercase">High Precision X-Axis Locking</p>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-700">
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Global Sync</span>
            <button 
              onClick={() => setSyncEnabled(!syncEnabled)}
              className={`w-10 h-5 rounded-full transition-all relative ${syncEnabled ? 'bg-blue-600' : 'bg-slate-700'}`}
            >
              <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${syncEnabled ? 'left-6' : 'left-1'}`} />
            </button>
          </div>
          <div className="text-[9px] text-slate-500 font-mono hidden sm:block">
            BUFFER: 1000PTS // RATE: 20Hz
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col space-y-3">
        <div className="flex-1 relative border border-slate-800/50 rounded-xl overflow-hidden bg-slate-950/50">
          <div className="absolute top-2 left-2 z-10 px-2 py-0.5 bg-slate-900/80 rounded border border-slate-800 text-[8px] font-bold text-blue-400 uppercase tracking-widest">Throughput_Vector</div>
          <div ref={chart1Ref} className="w-full h-full" />
        </div>
        <div className="flex-1 relative border border-slate-800/50 rounded-xl overflow-hidden bg-slate-950/50">
           <div className="absolute top-2 left-2 z-10 px-2 py-0.5 bg-slate-900/80 rounded border border-slate-800 text-[8px] font-bold text-red-400 uppercase tracking-widest">Thermal_Signature</div>
          <div ref={chart2Ref} className="w-full h-full" />
        </div>
        <div className="flex-1 relative border border-slate-800/50 rounded-xl overflow-hidden bg-slate-950/50">
           <div className="absolute top-2 left-2 z-10 px-2 py-0.5 bg-slate-900/80 rounded border border-slate-800 text-[8px] font-bold text-purple-400 uppercase tracking-widest">Neural_Resonance</div>
          <div ref={chart3Ref} className="w-full h-full" />
        </div>
      </div>

      <style>{`
        .animate-spin-slow {
          animation: spin 3s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default SciChartPane;
