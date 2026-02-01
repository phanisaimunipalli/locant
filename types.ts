export type TimelineOption = 'Today' | '7 Days' | '30 Days' | '90 Days';

export interface ChartDataPoint {
  category: string;
  intentDensity: number;
  providerDensity: number;
}

export interface FunnelMetrics {
  totalSignal: number; // e.g., 1.4M
  activeIntentUsers: number; // e.g., 85k
  supplyCensus: number; // e.g., 412
}

export interface DemandSegment {
  category: string;
  volume: number;
  growth: number; // percentage change
  sentiment: 'Frustrated' | 'Eager' | 'Confused' | 'Loyal' | 'Indifferent';
}

export interface QuadrantPoint {
  label: string;
  supplyDensity: number; // 0-100 (X-axis)
  demandIntensity: number; // 0-100 (Y-axis)
  isVacuum: boolean; // Identifies the opportunity bubble
}

export interface StrategicStep {
  phase: string; // e.g. "Phase 1"
  action: string; // The Business Move
  insight: string; // The Data backing it
}

export interface LocantInsight {
  location: string;
  narrative: string; // Executive Summary
  funnel: FunnelMetrics;
  segments: DemandSegment[];
  quadrant: QuadrantPoint[];
  strategy: StrategicStep[];
  sources: Array<{ title: string; uri: string }>;
}

export interface SearchState {
  query: string;
  isSearching: boolean;
  hasSearched: boolean;
  result: LocantInsight | null;
  error: string | null;
  timeline: TimelineOption;
}