import { buildDatabrowserSnapshot } from "@/adapters/databrowser";
import { PathocoreApiClient } from "@/api/client";
import type { ApiCredentials } from "@/types/api";
import type { DatabrowserSnapshot } from "@/types/databrowser";

async function mapWithConcurrency<T, R>(
  items: T[],
  concurrency: number,
  mapper: (item: T) => Promise<R>,
) {
  const results = new Array<R>(items.length);
  let nextIndex = 0;

  async function worker() {
    while (nextIndex < items.length) {
      const currentIndex = nextIndex;
      nextIndex += 1;
      results[currentIndex] = await mapper(items[currentIndex]);
    }
  }

  const workers = Array.from({ length: Math.min(concurrency, items.length) }, () =>
    worker(),
  );

  await Promise.all(workers);

  return results;
}

export async function loadDatabrowserSnapshot(
  credentials: ApiCredentials | null,
): Promise<DatabrowserSnapshot> {
  const client = new PathocoreApiClient(credentials);
  const [
    schemas,
    samples,
    variantSummary,
    variantFilterOptions,
    variantReferenceGenomes,
  ] = await Promise.all([
    client.listSchemas(),
    client.listAllSamples(),
    client.getVariantSummary(),
    client.getVariantFilterOptions(),
    client.listVariantReferenceGenomes(),
  ]);

  const [schemaDetails, sampleMetadata] = await Promise.all([
    Promise.all(
      schemas.map((schema) =>
        client.getSchemaDetail(schema.schema_name, schema.schema_version),
      ),
    ),
    mapWithConcurrency(samples, 4, async (sample) => ({
      metadata: await client.getSampleMetadata(sample.sample_unique_id),
      sampleUniqueId: sample.sample_unique_id,
    })),
  ]);

  return buildDatabrowserSnapshot({
    sampleMetadata,
    samples,
    schemaDetails,
    schemas,
    variantFilterOptions,
    variantReferenceGenomes,
    variantSummary,
  });
}
