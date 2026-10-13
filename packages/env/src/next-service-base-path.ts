import { readServiceBasePath, type VercelServiceName } from "./vercel-services";

type NextConfigLike = Record<string, unknown> & { basePath?: string };

/** Apply Services `basePath` when `VERCEL_SERVICES=1` or `NEXT_BASE_PATH_*` is set. */
export function withServiceBasePath<T extends NextConfigLike>(
  service: VercelServiceName,
  config: T,
): T {
  const basePath = readServiceBasePath(service);
  if (!basePath) {
    return config;
  }
  return {
    ...config,
    basePath,
  };
}
