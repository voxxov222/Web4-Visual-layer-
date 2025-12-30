
import React, { useMemo } from 'react';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import treemapModule from 'highcharts/modules/treemap';
import treegraphModule from 'highcharts/modules/treegraph';

// Safe module resolution for ESM environments (like esm.sh)
const H: any = (Highcharts as any).default || Highcharts;
const treemap: any = (treemapModule as any).default || treemapModule;
const treegraph: any = (treegraphModule as any).default || treegraphModule;

// The treegraph series requires the treemap module to be loaded first.
// Highcharts modules expect a valid Highcharts object with specific prototypes.
if (typeof H === 'object' && H.Chart && H.Chart.prototype && H.Series && H.Series.prototype) {
    // Initialize Treemap first
    if (typeof treemap === 'function' && H.Series.types && !H.Series.types.treemap) {
        try {
            treemap(H);
        } catch (e) {
            console.error("Failed to initialize Treemap module:", e);
        }
    }
    // Then initialize Treegraph
    if (typeof treegraph === 'function' && H.Series.types && !H.Series.types.treegraph) {
        try {
            treegraph(H);
        } catch (e) {
            console.error("Failed to initialize Treegraph module:", e);
        }
    }
}

interface WalletInvestigatorProps {
    walletAddress: string;
}

const WalletInvestigator: React.FC<WalletInvestigatorProps> = ({ walletAddress }) => {
    const options: Highcharts.Options = useMemo(() => ({
        chart: {
            backgroundColor: 'transparent',
            spacingBottom: 30,
            height: 800,
            style: { fontFamily: 'inherit' }
        },
        title: {
            text: `Propagation Tree: ${walletAddress.slice(0, 8)}...`,
            style: { color: '#f8fafc', fontSize: '16px', fontWeight: 'bold' }
        },
        series: [{
            type: 'treegraph',
            keys: ['parent', 'id', 'level'],
            clip: false,
            data: [
                [undefined, walletAddress, 1],
                [walletAddress, 'Binance Hot Wallet', 2],
                [walletAddress, 'Coinbase Prime', 2],
                [walletAddress, 'Unknown Whale 0x42', 2],
                [walletAddress, 'DeFi Aggregator', 2],
                
                ['Binance Hot Wallet', 'BUSD Stable-Pool', 3],
                ['Binance Hot Wallet', 'ETH Staking Node', 3],
                
                ['Coinbase Prime', 'Institutional Custody', 3],
                ['Coinbase Prime', 'Retail Flow', 3],
                
                ['Unknown Whale 0x42', 'Mixer Protocol', 3],
                ['Unknown Whale 0x42', 'NFT Marketplace', 3],
                
                ['DeFi Aggregator', 'Uniswap V3', 4],
                ['DeFi Aggregator', 'Curve Finance', 4],
                ['DeFi Aggregator', 'Aave V3', 4],
                
                ['Mixer Protocol', 'Output A (Shielded)', 6],
                ['Mixer Protocol', 'Output B (Shielded)', 6],
                ['NFT Marketplace', 'BAYC #420', 6],
                ['NFT Marketplace', 'CryptoPunks #99', 6],
                ['Uniswap V3', 'WBTC/USDC Pool', 6],
                ['Curve Finance', '3Pool Liquidity', 6],
                ['Institutional Custody', 'SEC-Compliant Vault', 6],
                ['Retail Flow', 'User Wallets (10k+)', 6]
            ],
            marker: {
                symbol: 'circle',
                radius: 8,
                fillColor: '#1e293b',
                lineWidth: 2,
                lineColor: '#3b82f6'
            },
            dataLabels: {
                align: 'left',
                pointFormat: '{point.id}',
                style: {
                    color: '#94a3b8',
                    textOutline: 'none',
                    fontSize: '10px',
                    fontWeight: 'bold'
                },
                x: 15,
                crop: false,
                overflow: 'none'
            },
            levels: [
                { level: 1, levelIsConstant: false, color: '#3b82f6' },
                { level: 2, colorByPoint: true },
                { 
                  level: 3, 
                  colorVariation: { key: 'brightness', to: -0.5 },
                  link: { color: 'rgba(59, 130, 246, 0.3)' }
                },
                { level: 6, dataLabels: { x: 10 }, marker: { radius: 5 } }
            ]
        }],
        credits: { enabled: false },
        tooltip: {
            backgroundColor: 'rgba(15, 23, 42, 0.95)',
            style: { color: '#f8fafc' },
            borderRadius: 12,
            borderWidth: 1,
            borderColor: '#334155'
        }
    }), [walletAddress]);

    return (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-2xl overflow-hidden relative">
            <div className="absolute top-4 right-4 z-10 flex items-center space-x-2">
                <div className="px-2 py-1 bg-emerald-500/10 border border-emerald-500/30 rounded text-[9px] text-emerald-400 font-black uppercase tracking-widest">
                    Real-time Mapping
                </div>
            </div>
            <HighchartsReact highcharts={H} options={options} />
        </div>
    );
};

export default WalletInvestigator;
