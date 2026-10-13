import { loader } from "fumadocs-core/source";
import { docs } from "../../.source/server";

const docsBaseUrl =
  process.env.VERCEL_SERVICES === "1" || process.env.NEXT_BASE_PATH
    ? ""
    : "/docs";

export const source = loader({
  baseUrl: docsBaseUrl,
  source: docs.toFumadocsSource(),
});
