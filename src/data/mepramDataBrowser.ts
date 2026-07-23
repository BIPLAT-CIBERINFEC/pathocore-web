export type DomainId =
  | "sociodemographic"
  | "clinical"
  | "microbiology"
  | "genomic"
  | "conditions"
  | "procedures"
  | "drugs"
  | "measurements"
  | "observations";

export type ConceptRecord = {
  slug: string;
  name: string;
  domain: DomainId;
  patients: number;
  events?: number;
  percentage: number;
  coverage: number;
  unit?: string;
  vocabulary: {
    source: string;
    code: string;
    label: string;
  };
  distribution: {
    kind: "categorical" | "measurement" | "temporal";
    bySex: { label: string; value: number }[];
    byAge: { label: string; value: number }[];
    timeline?: { label: string; value: number }[];
    histogram?: { label: string; value: number }[];
  };
  hierarchy?: {
    source: string;
    descendants: string[];
  };
  summary: string;
};

export const mepramNavigation: { href: string; label: string }[] = [
  { href: "/data-tools/data-browser", label: "Data browser" },
  { href: "/data-tools/clinical-data", label: "Clinical data" },
  { href: "/data-tools/genomic-data", label: "Genomic data" },
];

export const platformNavigation: {
  label: string;
  href?: string;
  external?: boolean;
  children?: { label: string; href: string }[];
}[] = [
  { label: "Home", href: "/" },
  { label: "About us", href: "https://uites.isciii.es/mepram", external: true },
  {
    label: "Data browser",
    href: "/data-tools/data-browser",
    
    // children: [
    //   { label: "Clinical data", href: "/data-tools/clinical-data" },
    //   { label: "Genomic data", href: "/data-tools/genomic-data" },
    // ],
  },
  {
    label: "Use cases",
    //  href: "/projects",
    children: [
      // { label: "Redlabra", href: "/use-cases/mepram" },
      { label: "Mepram", href: "/use-cases/mepram" },
    ],
  },
  { label: "IA models", href: "/ia-models" },
];

export const cohortSnapshot = {
  title: "MePRAM Sepsis Research Cohort",
  subtitle:
    "Public browser for aggregate epidemiological, clinical, microbiological and genomic signals derived from harmonized cohort APIs.",
  updatedAt: "06 Apr 2026",
  releaseLabel: "Public release 0.2",
  institutionNote:
    "Aggregate cohort browsing environment for public-facing biomedical research communication.",
  quickFacts: [
    "No individual-level access",
    "OMOP-compatible aggregate API",
    "Clinical, microbiology and genomics",
  ],
  researchTracks: [
    {
      title: "Clinical severity and trajectories",
      text: "Understand how MePRAM supports descriptive exploration of sepsis phenotypes, acute organ dysfunction and ICU-linked pathways.",
    },
    {
      title: "Microbiology and resistance context",
      text: "Surface pathogen prevalence, specimen source and antimicrobial resistance patterns without exposing raw laboratory events.",
    },
    {
      title: "Host and pathogen genomics",
      text: "Introduce a future-ready layer for molecular signals while preserving the same public-browser interaction model.",
    },
  ],
  kpis: [
    {
      label: "Participants in cohort",
      value: "18,742",
      note: "Adult and pediatric episodes harmonized from hospital and laboratory systems",
    },
    {
      label: "Sepsis-related encounters",
      value: "31,406",
      note: "Aggregated episodes suitable for descriptive and translational research",
    },
    {
      label: "Standardized concepts",
      value: "4,286",
      note: "Mapped to OMOP, SNOMED CT, LOINC, RxNorm and internal genomic registries",
    },
    {
      label: "Data domains available",
      value: "9",
      note: "From sociodemographic and clinical events to microbiology and genomic variants",
    },
  ],
  coverageCards: [
    { label: "Demographic coverage", value: 99, description: "Sex, age, admission context, geography" },
    { label: "Clinical event coverage", value: 92, description: "Conditions, procedures, drug exposures, ICU stay" },
    { label: "Microbiology coverage", value: 71, description: "Cultures, susceptibilities and pathogen families" },
    { label: "Genomic coverage", value: 38, description: "Targeted panels and resistance-associated markers" },
  ],
  sexDistribution: [
    { label: "Male", value: 58 },
    { label: "Female", value: 41 },
    { label: "Other / undisclosed", value: 1 },
  ],
  ageDistribution: [
    { label: "<18", value: 6 },
    { label: "18-39", value: 14 },
    { label: "40-59", value: 25 },
    { label: "60-74", value: 31 },
    { label: "75+", value: 24 },
  ],
  timeline: [
    { label: "2020", value: 4382 },
    { label: "2021", value: 4968 },
    { label: "2022", value: 5286 },
    { label: "2023", value: 5621 },
    { label: "2024", value: 5855 },
    { label: "2025", value: 5294 },
  ],
  topConditions: [
    { label: "Sepsis", value: 64.8 },
    { label: "Septic shock", value: 28.6 },
    { label: "Acute kidney injury", value: 24.4 },
    { label: "Respiratory failure", value: 22.2 },
    { label: "Pneumonia", value: 18.3 },
    { label: "Bacteremia", value: 15.9 },
  ],
  topMeasurements: [
    { label: "C-reactive protein", value: 79 },
    { label: "Lactate", value: 68 },
    { label: "Creatinine", value: 83 },
    { label: "Procalcitonin", value: 41 },
    { label: "IL-6", value: 19 },
    { label: "PaO2/FiO2 ratio", value: 36 },
  ],
  topProcedures: [
    { label: "Blood culture collection", value: 74 },
    { label: "ICU admission", value: 37 },
    { label: "Mechanical ventilation", value: 21 },
    { label: "Central venous catheter", value: 26 },
    { label: "Renal replacement therapy", value: 8 },
  ],
  topDrugs: [
    { label: "Piperacillin/tazobactam", value: 34 },
    { label: "Meropenem", value: 27 },
    { label: "Vancomycin", value: 18 },
    { label: "Norepinephrine", value: 22 },
    { label: "Ceftriaxone", value: 16 },
  ],
};

export const domainCards = [
  {
    id: "sociodemographic" as DomainId,
    name: "Sociodemographic",
    patients: 18742,
    concepts: 82,
    coverage: 99,
    description: "Age, sex, admission source, geography and longitudinal cohort segmentation.",
  },
  {
    id: "clinical" as DomainId,
    name: "Clinical data",
    patients: 17248,
    concepts: 612,
    coverage: 92,
    description: "Acute severity, ICU trajectories, organ dysfunction and sepsis pathway context.",
  },
  {
    id: "microbiology" as DomainId,
    name: "Microbiological",
    patients: 13210,
    concepts: 241,
    coverage: 71,
    description: "Cultures, microorganism identification, sample type and antimicrobial resistance.",
  },
  {
    id: "genomic" as DomainId,
    name: "Genomic data",
    patients: 7140,
    concepts: 198,
    coverage: 38,
    description: "Host variants, targeted sequencing panels and pathogen resistance signatures.",
  },
  {
    id: "conditions" as DomainId,
    name: "Conditions",
    patients: 16184,
    concepts: 904,
    coverage: 86,
    description: "OMOP-compatible condition concepts linked to episode-level frequency.",
  },
  {
    id: "procedures" as DomainId,
    name: "Procedures",
    patients: 14862,
    concepts: 422,
    coverage: 79,
    description: "Interventions, support procedures and diagnostic workflows.",
  },
  {
    id: "drugs" as DomainId,
    name: "Drugs",
    patients: 15390,
    concepts: 496,
    coverage: 82,
    description: "Antibiotics, vasoactive agents and protocol-level medication exposure.",
  },
  {
    id: "measurements" as DomainId,
    name: "Measurements",
    patients: 17640,
    concepts: 947,
    coverage: 94,
    description: "Laboratory and bedside measurements exposed as aggregate distributions.",
  },
  {
    id: "observations" as DomainId,
    name: "Observations",
    patients: 12483,
    concepts: 384,
    coverage: 67,
    description: "Scores, derived variables and observational descriptors from curated sources.",
  },
];

export const overviewHighlights = [
  {
    label: "Primary audience",
    value: "Clinical researchers, epidemiologists and translational teams",
  },
  {
    label: "Data access stance",
    value: "Public descriptive access with aggregate-only interaction patterns",
  },
  {
    label: "Scalability",
    value: "Modular structure prepared for extension to additional cohorts and releases",
  },
];

export const concepts: ConceptRecord[] = [
  {
    slug: "sepsis",
    name: "Sepsis",
    domain: "conditions",
    patients: 12146,
    events: 16430,
    percentage: 64.8,
    coverage: 100,
    vocabulary: { source: "SNOMED CT", code: "91302008", label: "Sepsis" },
    distribution: {
      kind: "categorical",
      bySex: [
        { label: "Male", value: 59 },
        { label: "Female", value: 40 },
        { label: "Other", value: 1 },
      ],
      byAge: [
        { label: "<18", value: 4 },
        { label: "18-39", value: 11 },
        { label: "40-59", value: 24 },
        { label: "60-74", value: 34 },
        { label: "75+", value: 27 },
      ],
      timeline: [
        { label: "Q1", value: 3760 },
        { label: "Q2", value: 4094 },
        { label: "Q3", value: 4236 },
        { label: "Q4", value: 4340 },
      ],
    },
    hierarchy: {
      source: "OMOP condition_era",
      descendants: ["Septic shock", "Sepsis due to Gram-negative organism", "Sepsis-associated organ dysfunction"],
    },
    summary:
      "Anchor condition for the cohort. Exposed as aggregate prevalence, demographic breakdown and yearly frequency to support public exploration.",
  },
  {
    slug: "lactate",
    name: "Lactate",
    domain: "measurements",
    patients: 12798,
    events: 52284,
    percentage: 68.3,
    coverage: 68,
    unit: "mmol/L",
    vocabulary: { source: "LOINC", code: "2524-7", label: "Lactate [Moles/volume] in Serum or Plasma" },
    distribution: {
      kind: "measurement",
      bySex: [
        { label: "Male", value: 57 },
        { label: "Female", value: 42 },
        { label: "Other", value: 1 },
      ],
      byAge: [
        { label: "<18", value: 7 },
        { label: "18-39", value: 13 },
        { label: "40-59", value: 24 },
        { label: "60-74", value: 31 },
        { label: "75+", value: 25 },
      ],
      timeline: [
        { label: "Admission", value: 2.9 },
        { label: "6h", value: 2.6 },
        { label: "24h", value: 2.2 },
        { label: "48h", value: 1.9 },
      ],
      histogram: [
        { label: "0-1", value: 11 },
        { label: "1-2", value: 26 },
        { label: "2-3", value: 24 },
        { label: "3-4", value: 16 },
        { label: "4-6", value: 14 },
        { label: "6+", value: 9 },
      ],
    },
    hierarchy: {
      source: "LOINC to OMOP measurement",
      descendants: ["Serum lactate", "Arterial lactate", "Venous lactate"],
    },
    summary:
      "High-interest severity biomarker with repeated-measure support. The browser highlights histogram shape and early-time trajectory rather than patient-level traces.",
  },
  {
    slug: "septic-shock",
    name: "Septic shock",
    domain: "conditions",
    patients: 5360,
    events: 7880,
    percentage: 28.6,
    coverage: 72,
    vocabulary: { source: "SNOMED CT", code: "76571007", label: "Septic shock" },
    distribution: {
      kind: "categorical",
      bySex: [
        { label: "Male", value: 61 },
        { label: "Female", value: 38 },
        { label: "Other", value: 1 },
      ],
      byAge: [
        { label: "<18", value: 2 },
        { label: "18-39", value: 9 },
        { label: "40-59", value: 23 },
        { label: "60-74", value: 36 },
        { label: "75+", value: 30 },
      ],
      timeline: [
        { label: "Q1", value: 1840 },
        { label: "Q2", value: 1932 },
        { label: "Q3", value: 2018 },
        { label: "Q4", value: 2090 },
      ],
    },
    hierarchy: {
      source: "OMOP condition_occurrence",
      descendants: ["Shock due to sepsis", "Refractory septic shock", "Vasopressor-dependent septic shock"],
    },
    summary:
      "High-acuity condition concept surfaced as aggregate prevalence and demographic distribution for severe sepsis pathway exploration.",
  },
  {
    slug: "acute-kidney-injury",
    name: "Acute kidney injury",
    domain: "conditions",
    patients: 4572,
    events: 6512,
    percentage: 24.4,
    coverage: 68,
    vocabulary: { source: "SNOMED CT", code: "14669001", label: "Acute kidney injury" },
    distribution: {
      kind: "categorical",
      bySex: [
        { label: "Male", value: 57 },
        { label: "Female", value: 42 },
        { label: "Other", value: 1 },
      ],
      byAge: [
        { label: "<18", value: 3 },
        { label: "18-39", value: 10 },
        { label: "40-59", value: 25 },
        { label: "60-74", value: 34 },
        { label: "75+", value: 28 },
      ],
      timeline: [
        { label: "Q1", value: 1534 },
        { label: "Q2", value: 1601 },
        { label: "Q3", value: 1650 },
        { label: "Q4", value: 1727 },
      ],
    },
    hierarchy: {
      source: "OMOP condition_era",
      descendants: ["Stage 1 AKI", "Stage 2 AKI", "Stage 3 AKI"],
    },
    summary:
      "Complication concept used to represent renal dysfunction burden and severity-related comorbidity patterns in the cohort.",
  },
  {
    slug: "respiratory-failure",
    name: "Respiratory failure",
    domain: "conditions",
    patients: 4160,
    events: 5904,
    percentage: 22.2,
    coverage: 64,
    vocabulary: { source: "SNOMED CT", code: "409622000", label: "Respiratory failure" },
    distribution: {
      kind: "categorical",
      bySex: [
        { label: "Male", value: 60 },
        { label: "Female", value: 39 },
        { label: "Other", value: 1 },
      ],
      byAge: [
        { label: "<18", value: 5 },
        { label: "18-39", value: 9 },
        { label: "40-59", value: 22 },
        { label: "60-74", value: 33 },
        { label: "75+", value: 31 },
      ],
      timeline: [
        { label: "Q1", value: 1422 },
        { label: "Q2", value: 1458 },
        { label: "Q3", value: 1486 },
        { label: "Q4", value: 1538 },
      ],
    },
    hierarchy: {
      source: "OMOP condition_occurrence",
      descendants: ["Acute hypoxemic respiratory failure", "Respiratory failure requiring ventilation", "ARDS-related respiratory failure"],
    },
    summary:
      "Critical respiratory condition displayed as aggregate burden, age pattern and temporal activity across the public cohort release.",
  },
  {
    slug: "blood-culture-collection",
    name: "Blood culture collection",
    domain: "procedures",
    patients: 13862,
    events: 23109,
    percentage: 73.9,
    coverage: 74,
    vocabulary: { source: "SNOMED CT", code: "104177005", label: "Blood culture taken" },
    distribution: {
      kind: "temporal",
      bySex: [
        { label: "Male", value: 58 },
        { label: "Female", value: 41 },
        { label: "Other", value: 1 },
      ],
      byAge: [
        { label: "<18", value: 6 },
        { label: "18-39", value: 12 },
        { label: "40-59", value: 23 },
        { label: "60-74", value: 33 },
        { label: "75+", value: 26 },
      ],
      timeline: [
        { label: "<6h", value: 62 },
        { label: "6-12h", value: 18 },
        { label: "12-24h", value: 11 },
        { label: "24h+", value: 9 },
      ],
    },
    hierarchy: {
      source: "Hospital procedural registry",
      descendants: ["Peripheral blood culture", "Catheter blood culture"],
    },
    summary:
      "Sentinel workflow concept used to describe diagnostic intensity and time-to-microbiology readiness.",
  },
  {
    slug: "piperacillin-tazobactam",
    name: "Piperacillin / tazobactam exposure",
    domain: "drugs",
    patients: 6386,
    events: 14892,
    percentage: 34.1,
    coverage: 34,
    vocabulary: { source: "RxNorm", code: "857004", label: "Piperacillin / tazobactam" },
    distribution: {
      kind: "temporal",
      bySex: [
        { label: "Male", value: 60 },
        { label: "Female", value: 39 },
        { label: "Other", value: 1 },
      ],
      byAge: [
        { label: "<18", value: 3 },
        { label: "18-39", value: 10 },
        { label: "40-59", value: 26 },
        { label: "60-74", value: 34 },
        { label: "75+", value: 27 },
      ],
      timeline: [
        { label: "Empiric start", value: 54 },
        { label: "Targeted continuation", value: 23 },
        { label: "Escalation", value: 12 },
        { label: "De-escalation", value: 11 },
      ],
    },
    hierarchy: {
      source: "RxNorm / antimicrobial stewardship registry",
      descendants: ["Empiric broad-spectrum regimen", "ICU empiric therapy"],
    },
    summary:
      "Drug exposure presented as episode frequency and stewardship pattern rather than dosage-level medication history.",
  },
  {
    slug: "escherichia-coli",
    name: "Escherichia coli isolate",
    domain: "microbiology",
    patients: 4212,
    events: 4876,
    percentage: 22.5,
    coverage: 23,
    vocabulary: { source: "SNOMED CT", code: "112283007", label: "Escherichia coli" },
    distribution: {
      kind: "categorical",
      bySex: [
        { label: "Male", value: 47 },
        { label: "Female", value: 52 },
        { label: "Other", value: 1 },
      ],
      byAge: [
        { label: "<18", value: 5 },
        { label: "18-39", value: 15 },
        { label: "40-59", value: 25 },
        { label: "60-74", value: 30 },
        { label: "75+", value: 25 },
      ],
      timeline: [
        { label: "Blood", value: 41 },
        { label: "Urine", value: 37 },
        { label: "Respiratory", value: 8 },
        { label: "Other", value: 14 },
      ],
    },
    hierarchy: {
      source: "Microbiology LIS",
      descendants: ["ESBL-producing E. coli", "Carbapenem-sensitive E. coli"],
    },
    summary:
      "Representative pathogen concept combining aggregate isolation frequency and specimen-source distribution.",
  },
  {
    slug: "tlr4-rs4986790",
    name: "TLR4 rs4986790",
    domain: "genomic",
    patients: 2148,
    events: 2148,
    percentage: 11.5,
    coverage: 11,
    vocabulary: { source: "dbSNP", code: "rs4986790", label: "TLR4 Asp299Gly" },
    distribution: {
      kind: "categorical",
      bySex: [
        { label: "Male", value: 55 },
        { label: "Female", value: 44 },
        { label: "Other", value: 1 },
      ],
      byAge: [
        { label: "<18", value: 2 },
        { label: "18-39", value: 11 },
        { label: "40-59", value: 29 },
        { label: "60-74", value: 35 },
        { label: "75+", value: 23 },
      ],
      timeline: [
        { label: "Reference homozygous", value: 81 },
        { label: "Heterozygous", value: 17 },
        { label: "Variant homozygous", value: 2 },
      ],
    },
    hierarchy: {
      source: "Targeted host genomics panel",
      descendants: ["Innate immunity panel", "Inflammatory response module"],
    },
    summary:
      "Example host-genomic concept to show that MePRAM can surface aggregate variant prevalence without exposing individual genotype data.",
  },
];

export const featuredConcepts = [
  "sepsis",
  "lactate",
  "blood-culture-collection",
  "piperacillin-tazobactam",
  "escherichia-coli",
  "tlr4-rs4986790",
].map((slug) => concepts.find((item) => item.slug === slug)!);

export const metadataSections = [
  {
    title: "Dataset description",
    items: [
      ["Dataset title", "MePRAM Aggregate Sepsis Data Browser"],
      ["Purpose", "Public exploration of descriptive cohort statistics and concept availability"],
      ["Population", "Hospital-based sepsis cohort with linked microbiology and selected genomics"],
      ["Temporal coverage", "2020-2025 aggregated release"],
    ],
  },
  {
    title: "Governance and responsible parties",
    items: [
      ["Data controller", "MePRAM WP1 consortium"],
      ["Scientific leads", "Clinical, epidemiology and bioinformatics work package leads"],
      ["Technical steward", "Aggregate API and browser delivery team"],
      ["Contact point", "Public-facing project coordination mailbox"],
    ],
  },
  {
    title: "Standards and interoperability",
    items: [
      ["Core model", "OMOP-compatible aggregate layer"],
      ["Terminologies", "SNOMED CT, LOINC, RxNorm, dbSNP and curated pathogen vocabularies"],
      ["Metadata profile", "HealthDCAT-AP aligned presentation"],
      ["Exchange readiness", "API-first aggregated statistics, terminology versioned"],
    ],
  },
  {
    title: "Access and licensing",
    items: [
      ["Access level", "Public aggregated summaries only"],
      ["Individual-level data", "Not exposed in this browser"],
      ["Reuse conditions", "Project-defined public use statement and attribution requirements"],
      ["Authentication", "Not required for public descriptive browsing"],
    ],
  },
  {
    title: "Quality, provenance and refresh",
    items: [
      ["Refresh cadence", "Quarterly aggregate API publication"],
      ["Quality indicators", "Coverage, completeness, vocabulary mapping status, outlier review"],
      ["Source systems", "EHR, laboratory information system, microbiology and genomic assays"],
      ["Provenance note", "All visuals derived from validated aggregate endpoints, never raw OMOP tables"],
    ],
  },
];

export const searchIndex = [
  ...domainCards.map((domain) => ({
    type: "Domain",
    label: domain.name,
    href: domain.id === "clinical" ? "/data-tools/clinical-data" : "/data-tools/data-browser",
    meta: `${domain.coverage}% coverage`,
  })),
  ...concepts.map((concept) => ({
    type: "Concept",
    label: concept.name,
    href: `/data-tools/data-browser/concepts/${concept.slug}`,
    meta: `${concept.vocabulary.source} ${concept.vocabulary.code}`,
  })),
  {
    type: "Catalog",
    label: "Variable Catalog",
    href: "/data-tools/data-browser/catalog",
    meta: "Search across data types",
  },
  {
    type: "Metadata",
    label: "Metadata Catalog",
    href: "/data-tools/data-browser/metadata",
    meta: "HealthDCAT-AP aligned",
  },
];

export const domainCatalogRows = [
  ...concepts,
  {
    slug: "icu-admission",
    name: "ICU admission",
    domain: "clinical" as DomainId,
    patients: 6928,
    events: 7214,
    percentage: 37,
    coverage: 37,
    vocabulary: { source: "OMOP", code: "VISIT_ICU", label: "ICU stay indicator" },
    distribution: {
      kind: "temporal" as const,
      bySex: [
        { label: "Male", value: 61 },
        { label: "Female", value: 38 },
        { label: "Other", value: 1 },
      ],
      byAge: [
        { label: "<18", value: 4 },
        { label: "18-39", value: 11 },
        { label: "40-59", value: 27 },
        { label: "60-74", value: 33 },
        { label: "75+", value: 25 },
      ],
      timeline: [
        { label: "ED to ICU", value: 44 },
        { label: "Ward to ICU", value: 35 },
        { label: "OR to ICU", value: 9 },
        { label: "Other", value: 12 },
      ],
    },
    summary: "ICU entry flag used to segment high-acuity phenotypes.",
  },
  {
    slug: "c-reactive-protein",
    name: "C-reactive protein",
    domain: "measurements" as DomainId,
    patients: 14790,
    events: 61782,
    percentage: 79,
    coverage: 79,
    unit: "mg/L",
    vocabulary: { source: "LOINC", code: "1988-5", label: "C reactive protein [Mass/volume] in Serum or Plasma" },
    distribution: {
      kind: "measurement" as const,
      bySex: [
        { label: "Male", value: 58 },
        { label: "Female", value: 41 },
        { label: "Other", value: 1 },
      ],
      byAge: [
        { label: "<18", value: 6 },
        { label: "18-39", value: 13 },
        { label: "40-59", value: 24 },
        { label: "60-74", value: 32 },
        { label: "75+", value: 25 },
      ],
      histogram: [
        { label: "0-25", value: 18 },
        { label: "25-50", value: 20 },
        { label: "50-100", value: 24 },
        { label: "100-200", value: 22 },
        { label: "200+", value: 16 },
      ],
    },
    summary: "Routine inflammatory measurement with high cohort penetration.",
  },
];

export const conceptBySlug = (slug?: string) =>
  domainCatalogRows.find((concept) => concept.slug === slug) ?? featuredConcepts[0];

export const formatInteger = (value: number) => new Intl.NumberFormat("en-US").format(value);
