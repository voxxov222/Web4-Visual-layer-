
import React, { useEffect, useRef } from 'react';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import highcharts3dModule from 'highcharts/highcharts-3d';

// Safe module resolution for ESM
const H: any = (Highcharts as any).default || Highcharts;
const highcharts3d: any = (highcharts3dModule as any).default || highcharts3dModule;

if (typeof H === 'object' && H.Chart && H.Chart.prototype && H.Series && H.Series.prototype && H.Axis && H.Axis.prototype) {
    if (typeof highcharts3d === 'function' && !H.Chart.prototype.add3d) {
        try {
            highcharts3d(H);
        } catch (e) {
            console.error("Failed to initialize Highcharts 3D module:", e);
        }
    }
}

const WaveChart3D: React.FC = () => {
    const chartComponentRef = useRef<HighchartsReact.RefObject>(null);

    useEffect(() => {
        const interval = setInterval(() => {
            if (chartComponentRef.current && chartComponentRef.current.chart) {
                const chart = chartComponentRef.current.chart;
                const newData = Array.from({ length: 10 }, () => Math.floor(Math.random() * 10));
                chart.series[0].setData(newData, true);
            }
        }, 2000);

        return () => clearInterval(interval);
    }, []);

    const options: Highcharts.Options = {
        chart: {
            type: 'line',
            backgroundColor: 'transparent',
            options3d: {
                enabled: true,
                alpha: 10,
                beta: 30,
                depth: 250,
                viewDistance: 25,
                frame: {
                    bottom: { size: 1, color: 'rgba(59, 130, 246, 0.1)' },
                    back: { size: 1, color: 'rgba(59, 130, 246, 0.05)' },
                    front: { size: 1, color: 'rgba(59, 130, 246, 0.05)' },
                    right: { size: 1, color: 'rgba(59, 130, 246, 0.05)' },
                    left: { size: 1, color: 'rgba(59, 130, 246, 0.05)' }
                }
            }
        },
        title: {
            text: 'Neural Waveform Analysis',
            style: { color: '#f8fafc', fontSize: '14px', fontWeight: 'bold' }
        },
        xAxis: {
            categories: ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'],
            labels: { style: { color: '#64748b' } },
            lineColor: '#334155'
        },
        yAxis: {
            title: {
                text: 'Wave Amplitude',
                style: { color: '#64748b' }
            },
            gridLineColor: '#1e293b',
            labels: { style: { color: '#64748b' } }
        },
        series: [{
            name: 'Vector Pulse',
            data: [1, 3, 2, 5, 4, 6, 5, 7, 6, 8],
            color: '#3b82f6',
            animation: {
                duration: 1200
            }
        }],
        legend: {
            itemStyle: { color: '#94a3b8' }
        },
        credits: { enabled: false }
    };

    return (
        <div className="w-full h-full">
            <HighchartsReact 
                highcharts={H} 
                options={options} 
                ref={chartComponentRef}
            />
        </div>
    );
};

export default WaveChart3D;
