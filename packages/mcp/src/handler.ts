import { createMcpHandler } from "mcp-handler";
import { createMcpResourceHandler } from "./resource-auth";
import { registerMcpTools } from "./tools/register-tools";

export function createCollidrMcpHttpHandler() {
  return createMcpResourceHandler(async (request, claims) => {
    const handler = createMcpHandler((server) => {
      registerMcpTools(server, claims);
    });
    return handler(request);
  });
}
