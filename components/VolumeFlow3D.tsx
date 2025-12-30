
import React, { useEffect, useState, useMemo } from 'react';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import highcharts3dModule from 'highcharts/highcharts-3d';

// Safe module resolution for ESM environments
const H: any = (Highcharts as any).default || Highcharts;
const highcharts3d: any = (highcharts3dModule as any).default || highcharts3dModule;

if (typeof H === 'object' && H.Chart && H.Chart.prototype && H.Series && H.Series.prototype && H.Axis && H.Axis.prototype) {
    if (typeof highcharts3d === 'function' && !H.Chart.prototype.add3d) {
        try {
            highcharts3d(H);
        } catch (e) {
            console.error("Failed to initialize Highcharts 3D module in VolumeFlow3D:", e);
        }
    }
}

const VolumeFlow3D: React.FC = () => {
    const [volumeData, setVolumeData] = useState<number[]>(
        Array.from({ length: 7 }, () => Math.floor(Math.random() * 2000))
    );

    useEffect(() => {
        const interval = setInterval(() => {
            setVolumeData(Array.from({ length: 7 }, () => Math.floor(Math.random() * 2000)));
        }, 3000);
        return () => clearInterval(interval);
    }, []);

    const options: Highcharts.Options = useMemo(() => ({
        chart: {
            type: 'column',
            backgroundColor: 'transparent',
            options3d: {
                enabled: true,
                alpha: 15,
                beta: 30,
                depth: 300,
                viewDistance: 25,
                frame: {
                    bottom: { size: 1, color: 'rgba(59, 130, 246, 0.05)' },
                    back: { size: 1, color: 'rgba(59, 130, 246, 0.02)' },
                    front: { size: 1, color: 'rgba(59, 130, 246, 0.02)' },
                    right: { size: 1, color: 'rgba(59, 130, 246, 0.02)' },
                    left: { size: 1, color: 'rgba(59, 130, 246, 0.02)' }
                }
            }
        },
        title: {
            text: 'Live 3D Volume Flow: Cross-Exchange Analytics',
            style: { color: '#f8fafc', fontSize: '18px', fontWeight: '900', letterSpacing: '2px' }
        },
        subtitle: {
            text: 'Neural Synapse Update // Frequency: 0.33Hz',
            style: { color: '#64748b', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '4px' }
        },
        xAxis: {
            categories: ['BTC', 'ETH', 'XRP', 'LTC', 'ADA', 'DOT', 'LINK'],
            labels: { style: { color: '#94a3b8', fontSize: '10px', fontWeight: 'bold' } },
            lineColor: '#334155'
        },
        yAxis: {
            title: { text: 'Volume (Neural Units)', style: { color: '#64748b' } },
            gridLineColor: '#1e293b',
            labels: { style: { color: '#64748b' } }
        },
        plotOptions: {
            column: {
                depth: 40,
                colorByPoint: true,
                colors: ['#3b82f6', '#60a5fa', '#93c5fd', '#bfdbfe', '#dbeafe', '#8b5cf6', '#a78bfa']
            }
        },
        series: [{
            name: 'Stream Intensity',
            data: volumeData,
            animation: {
                duration: 1200
            }
        }],
        legend: { enabled: false },
        credits: { enabled: false },
        tooltip: {
            backgroundColor: '#0f172a',
            style: { color: '#f8fafc' },
            borderColor: '#3b82f6',
            borderRadius: 8
        }
    }), [volumeData]);

    return (
        <div className="w-full h-full p-8 flex flex-col items-center justify-center bg-slate-900/40 backdrop-blur-3xl rounded-3xl border border-slate-800 shadow-inner">
            <div className="w-full max-w-4xl h-[500px]">
                <HighchartsReact highcharts={H} options={options} />
            </div>
            <div className="mt-8 grid grid-cols-4 gap-4 w-full max-w-2xl">
                 <div className="bg-slate-900/60 p-3 rounded-xl border border-blue-500/20 text-center">
                    <p className="text-[8px] text-slate-500 uppercase font-black">Peak Amplitude</p>
                    <p className="text-sm font-black text-blue-400 italic">{Math.max(...volumeData)}</p>
                 </div>
                 <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800 text-center">
                    <p className="text-[8px] text-slate-500 uppercase font-black">Mean Flow</p>
                    <p className="text-sm font-black text-slate-300 italic">{Math.round(volumeData.reduce((a,b) => a+b, 0) / volumeData.length)}</p>
                 </div>
                 <div className="bg-slate-900/60 p-3 rounded-xl border border-emerald-500/20 text-center">
                    <p className="text-[8px] text-slate-500 uppercase font-black">Sync Health</p>
                    <p className="text-sm font-black text-emerald-400 italic">NOMINAL</p>
                 </div>
                 <div className="bg-slate-900/60 p-3 rounded-xl border border-purple-500/20 text-center">
                    <p className="text-[8px] text-slate-500 uppercase font-black">Delta Mode</p>
                    <p className="text-sm font-black text-purple-400 italic">3D_COLUMN</p>
                 </div>
            </div>
        </div>
    );
};

export default VolumeFlow3D;
