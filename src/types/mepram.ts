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
  sequencingPlatforms: ChartDatum[];
  specimenSources: ChartDatum[];
  specimenSourcesSimulated: boolean;
  submittingRegions: ChartDatum[];
  territorialCoverage: MepramTerritorialCoverageRegion[];
  territorialCoverageSimulated: boolean;
  totalSamples: number;
}

export interface MepramExplorerRow {
  amrAllele: string | null;
  amrClassification: string | null;
  amrGene: string | null;
  amrGeneRecords: MepramAmrGeneRecord[];
  blaCarb: string | null;
  blaEsbl: string | null;
  collectionDate: string | null;
  collectingProvince: string | null;
  collectingRegion: string | null;
  dataOrigin: string | null;
  host: string | null;
  infectionType: string | null;
  isSequenced: boolean;
  isolateDeliveryType: string | null;
  pathogen: string | null;
  pathogenOrigin: string | null;
  province: string | null;
  region: string | null;
  sampleId: string;
  sequenceType: string | null;
  sequenceTypeSchemes: string[];
  sequencingStatus: string;
  sequencingSampleId: string | null;
  species: string | null;
  speciesGroup: string | null;
  submittingInstitution: string | null;
  submittingProvince: string | null;
  submittingRegion: string | null;
}

export interface MepramAmrGeneRecord {
  allele: string | null;
  classification: string | null;
  gene: string | null;
  label: string | null;
  origin: string | null;
}

export interface MepramExplorerFilterOptions {
  autonomousCommunities: string[];
  alleles: string[];
  blaGroups: string[];
  centers: string[];
  classifications: string[];
  collectionDateMax: string | null;
  collectionDateMin: string | null;
  genes: string[];
  infectionTypes: string[];
  pathogens: string[];
  provinces: string[];
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
