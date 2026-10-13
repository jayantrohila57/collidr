import defaultMdxComponents from "fumadocs-ui/mdx";
import type { MDXComponents } from "mdx/types";
import { AuthAppUrl, McpHttpUrl } from "@/components/mcp-endpoints";
import { McpToolDoc } from "@/components/mcp-tool-doc";
import { McpToolsTable } from "@/components/mcp-tools-table";

export function getMDXComponents(components?: MDXComponents): MDXComponents {
  return {
    ...defaultMdxComponents,
    AuthAppUrl,
    McpHttpUrl,
    McpToolDoc,
    McpToolsTable,
    ...components,
  };
}

export const useMDXComponents = getMDXComponents;

declare global {
  type MDXProvidedComponents = ReturnType<typeof getMDXComponents>;
}
