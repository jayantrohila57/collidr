"use client";

import type { Route } from "next";

export interface RedirectOptions {
  fallback?: string;
  replace?: boolean;
}

/**
 * Utility class for consistent redirect patterns across the application
 */
export class AppNavigation {
  private router: ReturnType<typeof import("next/navigation").useRouter>;

  constructor(router: ReturnType<typeof import("next/navigation").useRouter>) {
    this.router = router;
  }

  /**
   * Redirect to a project detail page
   */
  redirectToProject(projectSlug: string, options?: RedirectOptions) {
    const path = `/dashboard/projects/${projectSlug}` as Route;
    this.navigate(path, options);
  }

  /**
   * Redirect to projects list
   */
  redirectToProjects(options?: RedirectOptions) {
    this.navigate("/dashboard/projects" as Route, options);
  }

  /**
   * Redirect to dashboard
   */
  redirectToDashboard(options?: RedirectOptions) {
    this.navigate("/dashboard" as Route, options);
  }

  /**
   * Redirect to environment detail page
   */
  redirectToEnvironment(
    projectSlug: string,
    environmentId: string,
    options?: RedirectOptions,
  ) {
    const path =
      `/dashboard/projects/${projectSlug}/environments?env=${encodeURIComponent(environmentId)}` as Route;
    this.navigate(path, options);
  }

  /**
   * Go back to previous page
   */
  goBack() {
    this.router.back();
  }

  /**
   * Navigate to a specific path
   */
  public navigate(path: Route, options?: RedirectOptions) {
    if (options?.replace) {
      this.router.replace(path);
    } else {
      this.router.push(path);
    }
  }

  /**
   * Handle post-operation redirects based on operation type
   */
  handlePostOperationRedirect(
    operation: "create" | "update" | "delete" | "archive" | "unarchive",
    entityType: "project" | "environment" | "variable",
    data?: {
      projectSlug?: string;
      environmentId?: string;
      fallbackPath?: string;
    },
  ) {
    switch (operation) {
      case "create":
        if (entityType === "project" && data?.projectSlug) {
          this.redirectToProject(data.projectSlug);
        } else if (
          entityType === "environment" &&
          data?.projectSlug &&
          data?.environmentId
        ) {
          this.redirectToEnvironment(data.projectSlug, data.environmentId);
        } else {
          this.redirectToProjects({ fallback: data?.fallbackPath });
        }
        break;

      case "update":
        // Stay on current page for updates
        break;

      case "delete":
      case "archive":
      case "unarchive":
        if (entityType === "project") {
          this.redirectToProjects({ fallback: data?.fallbackPath });
        } else if (entityType === "environment" && data?.projectSlug) {
          this.redirectToProject(data.projectSlug);
        }
        break;

      default:
        this.redirectToDashboard({ fallback: data?.fallbackPath });
    }
  }
}

/**
 * Hook for using AppNavigation
 */
export function useAppNavigation() {
  const { useRouter } = require("next/navigation");
  const router = useRouter();
  return new AppNavigation(router);
}

/**
 * Standalone utility functions for common navigation patterns
 */
export const navigationUtils = {
  /**
   * Create a redirect handler for successful CRUD operations
   */
  createSuccessRedirectHandler: (
    operation: "create" | "update" | "delete" | "archive" | "unarchive",
    entityType: "project" | "environment" | "variable",
  ) => {
    return (
      data?: {
        projectSlug?: string;
        environmentId?: string;
        fallbackPath?: string;
      },
      router?: ReturnType<typeof import("next/navigation").useRouter>,
    ) => {
      if (!router) {
        throw new Error("Router instance is required for navigation");
      }
      const navigation = new AppNavigation(router);
      navigation.handlePostOperationRedirect(operation, entityType, data);
    };
  },

  /**
   * Create an error handler that redirects on failure
   */
  createErrorRedirectHandler: (fallbackPath = "/dashboard") => {
    return (
      error: Error,
      router?: ReturnType<typeof import("next/navigation").useRouter>,
    ) => {
      console.error("Operation failed:", error);
      if (!router) {
        throw new Error("Router instance is required for navigation");
      }
      const navigation = new AppNavigation(router);
      navigation.navigate(fallbackPath as Route, { replace: true });
    };
  },
};
