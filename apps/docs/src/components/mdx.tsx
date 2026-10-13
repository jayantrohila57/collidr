import defaultMdxComponents from "fumadocs-ui/mdx";
import type { MDXComponents } from "mdx/types";
import { McpToolDoc } from "@/components/mcp-tool-doc";
import { McpToolsTable } from "@/components/mcp-tools-table";

export function getMDXComponents(components?: MDXComponents): MDXComponents {
  return {
    ...defaultMdxComponents,
    McpToolDoc,
    McpToolsTable,
    ...components,
  };
}

export const useMDXComponents = getMDXComponents;

declare global {
  type MDXProvidedComponents = ReturnType<typeof getMDXComponents>;
}
