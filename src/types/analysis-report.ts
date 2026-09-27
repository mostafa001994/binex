export type AnalysisMetric = { label: string; value: string; delta?: string; tone?: "success" | "warning" | "neutral"; };
export type AnalysisReport = {
  metrics: AnalysisMetric[];
  trend: number[];
  executiveSummary: string;
  qualityWarning?: string;
  insights: string[];
  recommendations: string[];
};
