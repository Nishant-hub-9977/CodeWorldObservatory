import type { CalibrationTrendRecord } from "./research-memory";

export interface ResearchDataset {
    datasetId: string;
    experimentId: string;
    scenarioId: string | null;
    simulationResults: string[];
    benchmarkResults: string[];
    calibrationData: {
        comparisonIds: string[];
        summary: CalibrationTrendRecord;
    };
    createdAt: string;
    updatedAt: string;
}

export interface ResearchDatasetListResponse {
    datasets: ResearchDataset[];
}

export interface ResearchDatasetDetailResponse {
    dataset: ResearchDataset;
}