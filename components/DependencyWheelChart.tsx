
import React from 'react';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import sankeyModule from 'highcharts/modules/sankey';
import dependencyWheelModule from 'highcharts/modules/dependency-wheel';
import accessibilityModule from 'highcharts/modules/accessibility';
import exportingModule from 'highcharts/modules/exporting';

// Safe module resolution for ESM
const H: any = (Highcharts as any).default || Highcharts;
const sankey: any = (sankeyModule as any).default || sankeyModule;
const dependencyWheel: any = (dependencyWheelModule as any).default || dependencyWheelModule;
const accessibility: any = (accessibilityModule as any).default || accessibilityModule;
const exporting: any = (exportingModule as any).default || exportingModule;

if (typeof H === 'object' && H.Chart && H.Chart.prototype && H.Series && H.Series.prototype) {
    if (typeof sankey === 'function' && H.Series.types && !H.Series.types.sankey) {
        try { sankey(H); } catch(e) { console.error("Sankey init error", e); }
    }
    if (typeof dependencyWheel === 'function' && H.Series.types && !H.Series.types.dependencywheel) {
        try { dependencyWheel(H); } catch(e) { console.error("Dependency Wheel init error", e); }
    }
    if (typeof accessibility === 'function' && !H.Accessibility) {
        try { accessibility(H); } catch(e) { console.error("Accessibility init error", e); }
    }
    if (typeof exporting === 'function' && !H.Chart.prototype.exportChart) {
        try { exporting(H); } catch(e) { console.error("Exporting init error", e); }
    }
}

const DependencyWheelChart: React.FC = () => {
    const options: Highcharts.Options = {
        chart: {
            backgroundColor: 'transparent',
            height: 650,
            style: {
                fontFamily: 'inherit'
            }
        },
        title: {
            text: 'Highcharts Dependency Wheel',
            style: { 
                color: '#f8fafc', 
                fontSize: '18px', 
                fontWeight: 'bold' 
            }
        },
        accessibility: {
            point: {
                valueDescriptionFormat: '{index}. From {point.from} to {point.to}: {point.weight}.'
            }
        },
        exporting: {
            enabled: true,
            buttons: {
                contextButton: {
                    theme: {
                        fill: 'transparent',
                        states: {
                            hover: {
                                fill: '#1e293b'
                            }
                        }
                    }
                }
            }
        },
        series: [{
            keys: ['from', 'to', 'weight'],
            data: [
                ['Brazil', 'Portugal', 5],
                ['Brazil', 'France', 1],
                ['Brazil', 'Spain', 1],
                ['Brazil', 'England', 1],
                ['Canada', 'Portugal', 1],
                ['Canada', 'France', 5],
                ['Canada', 'England', 1],
                ['Mexico', 'Portugal', 1],
                ['Mexico', 'France', 1],
                ['Mexico', 'Spain', 5],
                ['Mexico', 'England', 1],
                ['USA', 'Portugal', 1],
                ['USA', 'France', 1],
                ['USA', 'Spain', 1],
                ['USA', 'England', 5],
                ['Portugal', 'Angola', 2],
                ['Portugal', 'Senegal', 1],
                ['Portugal', 'Morocco', 1],
                ['Portugal', 'South Africa', 3],
                ['France', 'Angola', 1],
                ['France', 'Senegal', 3],
                ['France', 'Mali', 3],
                ['France', 'Morocco', 3],
                ['France', 'South Africa', 1],
                ['Spain', 'Senegal', 1],
                ['Spain', 'Morocco', 3],
                ['Spain', 'South Africa', 1],
                ['England', 'Angola', 1],
                ['England', 'Senegal', 1],
                ['England', 'Morocco', 2],
                ['England', 'South Africa', 7],
                ['South Africa', 'China', 5],
                ['South Africa', 'India', 1],
                ['South Africa', 'Japan', 3],
                ['Angola', 'China', 5],
                ['Angola', 'India', 1],
                ['Angola', 'Japan', 3],
                ['Senegal', 'China', 5],
                ['Senegal', 'India', 1],
                ['Senegal', 'Japan', 3],
                ['Mali', 'China', 5],
                ['Mali', 'India', 1],
                ['Mali', 'Japan', 3],
                ['Morocco', 'China', 5],
                ['Morocco', 'India', 1],
                ['Morocco', 'Japan', 3],
                ['Japan', 'Brazil', 1]
            ],
            type: 'dependencywheel',
            name: 'Dependency wheel series',
            dataLabels: {
                color: '#94a3b8',
                style: {
                    textOutline: 'none',
                    fontSize: '10px'
                },
                textPath: {
                    enabled: true
                },
                distance: 10
            },
            size: '95%'
        }],
        credits: { enabled: false },
        tooltip: {
            backgroundColor: '#0f172a',
            style: { color: '#f8fafc' },
            borderColor: '#334155'
        }
    };

    return (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl">
            <HighchartsReact highcharts={H} options={options} />
        </div>
    );
};

export default DependencyWheelChart;
