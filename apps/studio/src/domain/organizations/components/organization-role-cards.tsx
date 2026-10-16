"use client";

import {
  type ActionName,
  actionRegistry,
  type OrgRole,
  PERMISSION_MATRIX_ROWS,
  roleCapability,
} from "@loftlancer/actions";
import { AppIcon } from "@/components/patterns/app-icon";
import { RoleBadge } from "@/components/patterns/status-badge";

const ROLES: { role: OrgRole; summary: string }[] = [
  {
    role: "owner",
    summary:
      "Full control, including transferring or deleting the organization.",
  },
  {
    role: "manager",
    summary: "Runs members, invites and teams; project work once assigned.",
  },
  { role: "member", summary: "Works inside projects their teams are granted." },
];

const orgActions = (Object.keys(actionRegistry) as ActionName[]).filter(
  (name) => {
    const scope = actionRegistry[name].scope;
    return scope === "organization" || scope === "project";
  },
);

function countFor(role: OrgRole) {
  let yes = 0;
  let grant = 0;
  for (const action of orgActions) {
    const cap = roleCapability(action, role);
    if (cap === "yes") yes += 1;
    else if (cap === "grant") grant += 1;
  }
  return { yes, grant };
}

/**
 * One card per built-in role (reui settings-5). Every row is computed from
 * the same evaluator the API enforces, so nothing here is aspirational.
 */
export function OrganizationRoleCards() {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      {ROLES.map(({ role, summary }) => {
        const { yes, grant } = countFor(role);
        return (
          <section
            key={role}
            className="flex flex-col gap-3 rounded-xl bg-card p-4 ring-1 ring-border/60"
          >
            <header className="flex flex-col gap-1">
              <div className="flex items-center justify-between gap-1.5">
                <RoleBadge role={role} />
                <span className="text-muted-foreground text-xs tabular-nums">
                  {yes + grant}/{orgActions.length} actions
                </span>
              </div>
              <p className="text-muted-foreground text-xs">{summary}</p>
            </header>
            <ul className="flex flex-col gap-1.5 border-border/60 border-t pt-3">
              {PERMISSION_MATRIX_ROWS.map((row) => {
                const cap = roleCapability(row.action, role);
                return (
                  <li
                    key={row.action}
                    className="flex items-center gap-2 text-sm"
                  >
                    {cap === "yes" ? (
                      <AppIcon
                        name="check"
                        className="size-3.5 shrink-0 text-primary"
                      />
                    ) : cap === "grant" ? (
                      <AppIcon
                        name="variable"
                        className="size-3.5 shrink-0 text-muted-foreground"
                      />
                    ) : (
                      <AppIcon
                        name="minus"
                        className="size-3.5 shrink-0 text-muted-foreground/50"
                      />
                    )}
                    <span
                      className={
                        cap === "no"
                          ? "text-muted-foreground line-through decoration-muted-foreground/40"
                          : undefined
                      }
                    >
                      <span className="sr-only">
                        {cap === "yes"
                          ? "Allowed: "
                          : cap === "grant"
                            ? "With project access: "
                            : "Not allowed: "}
                      </span>
                      {row.label}
                    </span>
                    {cap === "grant" ? (
                      <span className="ms-auto text-muted-foreground text-xs">
                        with access
                      </span>
                    ) : null}
                  </li>
                );
              })}
            </ul>
            {grant > 0 ? (
              <p className="mt-auto text-muted-foreground text-xs">
                {grant} project action{grant === 1 ? "" : "s"} need project
                assignment or a team grant.
              </p>
            ) : null}
          </section>
        );
      })}
    </div>
  );
}
