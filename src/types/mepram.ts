import type { ChartDatum, KpiStat } from "@/types/databrowser";

export interface MepramSeriesDefinition {
  color: string;
  key: string;
  label: string;
}

export interface MepramMultiSeriesChartDatum {
  [key: string]: number | string;
  label: string;
}

export interface MepramMultiSeriesChart {
  data: MepramMultiSeriesChartDatum[];
  simulated: boolean;
  series: MepramSeriesDefinition[];
}

export interface MepramTerritorialCoverageRegion {
  centers: number;
  dominantPathogen: string;
  hospitals: number;
  label: string;
  notes: string[];
  regionCode: string;
  samples: number;
  simulated: boolean;
  topResistanceSignal: string;
  x: number;
  y: number;
}

export interface MepramOverviewData {
  analyzedSamples: number;
  annualPathogenSeries: MepramMultiSeriesChart;
  centers: ChartDatum[];
  collectionTimeline: ChartDatum[];
  collectingRegions: ChartDatum[];
  infectionTypes: ChartDatum[];
  kpis: KpiStat[];
  notes: string[];
  participatingCenters: number;
  participatingRegions: number;
  pathogenDistributionSimulated: boolean;
  projectPathogenDistribution: ChartDatum[];
  resistanceSignalsSeries: MepramMultiSeriesChart;
  resistanceProfiles: ChartDatum[];
  resistanceProfilesSimulated: boolean;
  sequencingPlatforms: ChartDatum[];
  submittingRegions: ChartDatum[];
  territorialCoverage: MepramTerritorialCoverageRegion[];
  territorialCoverageSimulated: boolean;
  totalSamples: number;
}

export interface MepramExplorerRow {
  carbapenemase: string | null;
  collectionDate: string | null;
  collectingRegion: string | null;
  host: string | null;
  infectionType: string | null;
  isolateDeliveryType: string | null;
  pathogen: string | null;
  region: string | null;
  resistanceProfile: string | null;
  sampleId: string;
  sequenceType: string | null;
  sequencingPlatform: string | null;
  sequencingSampleId: string | null;
  submittingInstitution: string | null;
  submittingRegion: string | null;
}

export interface MepramExplorerFilterOptions {
  autonomousCommunities: string[];
  centers: string[];
  collectionDateMax: string | null;
  collectionDateMin: string | null;
  infectionTypes: string[];
  pathogens: string[];
  resistanceProfiles: string[];
  sequencingPlatforms: string[];
  sequenceTypes: string[];
}

export interface MepramExplorerData {
  filterOptions: MepramExplorerFilterOptions;
  notes: string[];
  operationalFieldsSimulated: boolean;
  rows: MepramExplorerRow[];
  totalLoaded: number;
}

export interface MepramSnapshot {
  explorer: MepramExplorerData;
  generatedAt: string;
  integrationGaps: string[];
  overview: MepramOverviewData;
  projectLabel: string;
}
