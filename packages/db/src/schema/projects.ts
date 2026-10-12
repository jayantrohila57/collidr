import { relations } from "drizzle-orm";
import {
  boolean,
  index,
  pgTable,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";
import { user } from "./auth";

export const project = pgTable(
  "project",
  {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    slug: varchar("slug", { length: 255 }).notNull().unique(),
    description: text("description"),
    isArchived: boolean("is_archived").default(false).notNull(),
    isPublic: boolean("is_public").default(false).notNull(),
    repositoryUrl: text("repository_url"),
    websiteUrl: text("website_url"),
    status: varchar("status", {
      length: 50,
      enum: ["active", "inactive", "maintenance"],
    })
      .default("active")
      .notNull(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [
    index("project_userId_idx").on(table.userId),
    index("project_slug_idx").on(table.slug),
    index("project_status_idx").on(table.status),
    index("project_isArchived_idx").on(table.isArchived),
  ],
);

export const environment = pgTable(
  "environment",
  {
    id: text("id").primaryKey(),
    name: text("name").notNull(), // dev, staging, prod
    slug: varchar("slug", { length: 255 }).notNull(),
    branch: text("branch"), // git branch name
    deployedUrl: text("deployed_url"), // deployed application URL
    status: varchar("status", {
      length: 50,
      enum: ["active", "inactive", "building", "failed"],
    })
      .default("active")
      .notNull(),
    isProduction: boolean("is_production").default(false).notNull(),
    description: text("description"),
    projectId: text("project_id")
      .notNull()
      .references(() => project.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [
    index("environment_projectId_idx").on(table.projectId),
    index("environment_slug_idx").on(table.slug),
    index("environment_status_idx").on(table.status),
    index("environment_branch_idx").on(table.branch),
  ],
);

export const environmentVariable = pgTable(
  "environment_variable",
  {
    id: text("id").primaryKey(),
    key: text("key").notNull(),
    encryptedValue: text("encrypted_value").notNull(),
    value: text("value").notNull(),
    environmentId: text("environment_id")
      .notNull()
      .references(() => environment.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [
    index("environment_variable_environmentId_idx").on(table.environmentId),
    index("environment_variable_key_idx").on(table.key),
  ],
);

// Relations
export const projectRelations = relations(project, ({ one, many }) => ({
  user: one(user, {
    fields: [project.userId],
    references: [user.id],
  }),
  environments: many(environment),
  variables: many(environmentVariable),
}));

export const environmentRelations = relations(environment, ({ one, many }) => ({
  project: one(project, {
    fields: [environment.projectId],
    references: [project.id],
  }),
  variables: many(environmentVariable),
}));

export const environmentVariableRelations = relations(
  environmentVariable,
  ({ one }) => ({
    environment: one(environment, {
      fields: [environmentVariable.environmentId],
      references: [environment.id],
    }),
  }),
);
