
export interface VehicleCount {
  type: 'Car' | 'Truck' | 'Bus' | 'Motorcycle';
  count: number;
}

export interface Session {
  id: string;
  date: string;
  modelUsed: string;
  duration: string;
  totalVehicles: number;
  vehicleCounts: VehicleCount[];
  videoSource: string;
  avgFps?: number;
}

export interface ModelPerformance {
  mAP: number;
  fps: number;
  params: string; 
  size: string; 
  flops: number;
}

export interface YoloModel {
  id: string;
  name: string;
  description: string;
  useCases: string[];
  performance: ModelPerformance;
  strengths: string[];
  weaknesses: string[];
  architectureDiagramUrl: string;
}