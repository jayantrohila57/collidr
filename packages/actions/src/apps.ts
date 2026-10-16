import type { ActionName } from "./types";

/**
 * First-party installable apps (apps system, #245). Code is the source of
 * truth; `project_app` rows record which project has which app installed.
 * No third-party apps for now. `plan` is reserved for paid plans later.
 */
export type AppNavItem = {
  path: string;
  label: string;
  action: ActionName | null;
};

export type AppManifest = {
  id: string;
  version: number;
  name: string;
  description: string;
  /** lucide icon name, resolved in the UI */
  icon: "KeyRound" | "ListTodo";
  category: string;
  /** Action names this app owns; blocked when the app isn't installed. */
  actions: readonly string[];
  /** What the install dialog shows. */
  permissions: readonly string[];
  dataCreated: readonly string[];
  nav: readonly AppNavItem[];
  /** Reserved: "free" today; paid plans later. */
  plan: "free";
};

export const APP_RETENTION_DAYS = 30;

export const envApp: AppManifest = {
  id: "env",
  version: 1,
  name: "Environments",
  description:
    "Environments and encrypted variables with .env import and export.",
  icon: "KeyRound",
  category: "DevOps",
  actions: [
    "environment.read",
    "environment.create",
    "environment.update",
    "environment.delete",
    "variable.read",
    "variable.create",
    "variable.update",
    "variable.delete",
    "variable.reveal",
    "variable.export",
  ],
  permissions: [
    "Read and manage environments",
    "Read, reveal and export variables",
  ],
  dataCreated: ["Environments", "Encrypted variables"],
  nav: [{ path: "env", label: "Environments", action: "environment.read" }],
  plan: "free",
};

export const tasksApp: AppManifest = {
  id: "tasks",
  version: 1,
  name: "Tasks",
  description:
    "Numbered tasks with status, priority, assignee, due date, labels and comments.",
  icon: "ListTodo",
  category: "Project management",
  actions: [
    "tasks.task.read",
    "tasks.task.create",
    "tasks.task.update",
    "tasks.task.delete",
    "tasks.comment.create",
  ],
  permissions: [
    "Read and manage tasks",
    "Comment on tasks",
    "Notify assignees and mentions",
  ],
  dataCreated: ["Tasks", "Task comments"],
  nav: [{ path: "tasks", label: "Tasks", action: "tasks.task.read" }],
  plan: "free",
};

export const appRegistry: readonly AppManifest[] = [envApp, tasksApp];

export type AppId = "env" | "tasks";

export function getAppManifest(id: string): AppManifest | undefined {
  return appRegistry.find((a) => a.id === id);
}

export function appIdForAction(action: string): AppId | undefined {
  return appRegistry.find((a) => a.actions.includes(action))?.id as
    | AppId
    | undefined;
}
