
export enum EngineStatus {
  IDLE = 'IDLE',
  RUNNING = 'RUNNING',
  PAUSED = 'PAUSED',
  ERROR = 'ERROR',
  OPTIMIZING = 'OPTIMIZING'
}

export interface EngineMetric {
  timestamp: string;
  throughput: number;
  temperature: number;
  efficiency: number;
  load: number;
}

export interface EngineLog {
  id: string;
  timestamp: Date;
  level: 'info' | 'warn' | 'error' | 'success';
  message: string;
}

export interface EngineConfig {
  coreFrequency: number;
  plasmaDensity: number;
  coolantFlow: number;
  safetyThreshold: number;
}

export interface EnginePreset {
  id: string;
  name: string;
  config: Omit<EngineConfig, 'safetyThreshold'>;
}

export interface CryptoMarketData {
  symbol: string;
  price: number;
  change24h: number;
  volume: number[];
  lastUpdate: Date;
}

export type NeuralViewMode = 'TERRAIN' | 'VORTEX' | 'NETWORK' | 'CLUSTER' | 'DIVE' | 'FLOW' | 'VOLUME3D';

export interface TransactionPacket {
  id: string;
  value: number;
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  progress: number;
  color: string;
  hash?: string;
}

export interface DetailedTransaction {
  id: string;
  from: string;
  to: string;
  amount: number;
  timestamp: string;
  status: 'confirmed' | 'pending';
}

export interface AIChatMessage {
  role: 'user' | 'model';
  text: string;
  sources?: { uri: string; title: string }[];
  chartConfig?: any; // Highcharts Options
}
