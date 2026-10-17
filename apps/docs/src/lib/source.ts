import { loader } from "fumadocs-core/source";
import { docs } from "../../.source/server";

const docsBaseUrl = "/docs";

export const source = loader({
  baseUrl: docsBaseUrl,
  source: docs.toFumadocsSource(),
});
