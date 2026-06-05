const BUCKET = "media";

const ENTITIES = {
  logo: "logo",
  banner: "banner",
  producto: "productos",
  combo: "combos",
} as const;

export type StorageEntity = keyof typeof ENTITIES;

export function getStorageBucket(): string {
  return BUCKET;
}

export function getEntityFolder(entity: StorageEntity): string {
  return ENTITIES[entity];
}

export function buildStoragePath(
  negocioId: string,
  entity: StorageEntity,
  filename: string,
): string {
  const folder = getEntityFolder(entity);
  return `${negocioId}/${folder}/${filename}`;
}

export function generateStorageFilename(ext: string): string {
  const cleanExt = ext.replace(/^\./, "").toLowerCase() || "png";
  return `${crypto.randomUUID()}-${Date.now()}.${cleanExt}`;
}
