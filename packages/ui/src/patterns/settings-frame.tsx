"use client";

import { Check, ChevronLeft, Copy } from "lucide-react";
import type React from "react";
import { type ReactNode, useState } from "react";

import { cn } from "../lib/utils";

/**
 * Settings page frame: blends ReUI form-5 (centered container, back link,
 * identity row, line tabs, sticky right rail) with profile-2 (H2 + description
 * sections of hairline-separated label/control rows). Rebuilt from our own
 * shadcn primitives; no ReUI source is used.
 */

type LinkLike = React.ElementType<{
  href: string;
  className?: string;
  children?: ReactNode;
  "aria-current"?: "page";
}>;

export type SettingsTab = {
  href: string;
  label: string;
  icon?: ReactNode;
  active?: boolean;
};

export function SettingsAvatar({
  src,
  name,
  className,
}: {
  src?: string | null;
  name?: string | null;
  className?: string;
}) {
  const initials =
    (name ?? "?")
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join("") || "?";
  return (
    <span
      className={cn(
        "relative inline-flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-muted font-medium text-muted-foreground text-sm",
        className,
      )}
    >
      {src ? (
        // biome-ignore lint/performance/noImgElement: remote avatar, no Next image config in shared package
        <img src={src} alt="" className="size-full object-cover" />
      ) : (
        initials
      )}
    </span>
  );
}

export function SettingsTabs({
  tabs,
  LinkComponent = "a",
}: {
  tabs: SettingsTab[];
  LinkComponent?: LinkLike | "a";
}) {
  const L = LinkComponent as React.ElementType;
  return (
    <nav
      aria-label="Settings sections"
      className="flex flex-wrap gap-x-1 border-b"
    >
      {tabs.map((tab) => (
        <L
          key={tab.href}
          href={tab.href}
          aria-current={tab.active ? "page" : undefined}
          className={cn(
            "-mb-px inline-flex shrink-0 items-center gap-2 whitespace-nowrap border-b-2 px-3 py-2.5 font-medium text-sm transition-colors [&_svg]:size-4",
            tab.active
              ? "border-foreground text-foreground"
              : "border-transparent text-muted-foreground hover:text-foreground",
          )}
        >
          {tab.icon}
          {tab.label}
        </L>
      ))}
    </nav>
  );
}

export type SettingsFrameProps = {
  back?: { href: string; label: string };
  avatar?: { src?: string | null; name?: string | null };
  title: ReactNode;
  subtitle?: ReactNode;
  actions?: ReactNode;
  tabs?: SettingsTab[];
  LinkComponent?: LinkLike | "a";
  /** Full-width block under the tabs (e.g. activity heatmap). */
  top?: ReactNode;
  /** Sticky right rail (audit rail, health). */
  aside?: ReactNode;
  children: ReactNode;
};

export function SettingsFrame({
  back,
  avatar,
  title,
  subtitle,
  actions,
  tabs,
  LinkComponent = "a",
  top,
  aside,
  children,
}: SettingsFrameProps) {
  const L = LinkComponent as React.ElementType;
  return (
    <div data-testid="settings-frame" className="w-full min-w-0 space-y-6">
      {back ? (
        <L
          href={back.href}
          className="inline-flex items-center gap-1 text-muted-foreground text-sm hover:text-foreground"
        >
          <ChevronLeft className="size-4" aria-hidden />
          {back.label}
        </L>
      ) : null}
      <div className="flex flex-wrap items-center gap-3">
        {avatar ? <SettingsAvatar src={avatar.src} name={avatar.name} /> : null}
        <div className="min-w-0 flex-1">
          <h1 className="truncate font-semibold text-lg leading-tight">{title}</h1>
          {subtitle ? (
            <p className="truncate text-muted-foreground text-sm">{subtitle}</p>
          ) : null}
        </div>
        {actions ? <div className="flex items-center gap-2">{actions}</div> : null}
      </div>
      {tabs?.length ? <SettingsTabs tabs={tabs} LinkComponent={LinkComponent} /> : null}
      {top}
      {aside ? (
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_18rem]">
          <div className="min-w-0 space-y-8">{children}</div>
          <aside className="space-y-4 xl:sticky xl:top-6 xl:self-start">{aside}</aside>
        </div>
      ) : (
        <div className="min-w-0 space-y-8">{children}</div>
      )}
    </div>
  );
}

export function SettingsSection({
  title,
  description,
  actions,
  children,
  bare = false,
}: {
  title: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  children: ReactNode;
  /** Skip the bordered card (content brings its own, e.g. a table). */
  bare?: boolean;
}) {
  return (
    <section className="space-y-3">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="min-w-0">
          <h2 className="font-semibold text-base">{title}</h2>
          {description ? (
            <p className="text-muted-foreground text-sm">{description}</p>
          ) : null}
        </div>
        {actions ? <div className="flex items-center gap-2">{actions}</div> : null}
      </div>
      {bare ? (
        children
      ) : (
        <div className="divide-y rounded-xl border bg-card text-card-foreground">
          {children}
        </div>
      )}
    </section>
  );
}

export function SettingsRow({
  label,
  helper,
  children,
}: {
  label: ReactNode;
  helper?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:gap-6">
      <div className="min-w-0 sm:w-55 sm:shrink-0">
        <div className="font-medium text-sm">{label}</div>
        {helper ? <div className="text-muted-foreground text-xs">{helper}</div> : null}
      </div>
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}

function CopyButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      aria-label="Copy"
      className="inline-flex size-6 shrink-0 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-foreground"
      onClick={() => {
        void navigator.clipboard?.writeText(value).then(() => {
          setCopied(true);
          setTimeout(() => setCopied(false), 1500);
        });
      }}
    >
      {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
    </button>
  );
}

export type RailItem = { label: string; value: string; copy?: boolean };

export function SettingsRailCard({
  title,
  items,
  children,
}: {
  title: string;
  items?: RailItem[];
  children?: ReactNode;
}) {
  return (
    <div className="rounded-xl border bg-card p-4 text-card-foreground">
      <div className="mb-3 font-medium text-sm">{title}</div>
      {items?.length ? (
        <dl className="space-y-3">
          {items.map((item) => (
            <div key={item.label} className="min-w-0">
              <dt className="text-muted-foreground text-xs">{item.label}</dt>
              <dd className="flex items-center gap-1">
                <span className="truncate font-mono text-xs">{item.value}</span>
                {item.copy ? <CopyButton value={item.value} /> : null}
              </dd>
            </div>
          ))}
        </dl>
      ) : null}
      {children}
    </div>
  );
}

/* ---------- Activity heatmap (GitHub-style, 53 week columns) ---------- */

export type HeatmapDay = { date: string; count: number };

function level(count: number, max: number) {
  if (count <= 0) return 0;
  if (max <= 4) return Math.min(4, count);
  return Math.min(4, Math.ceil((count / max) * 4));
}

const levelClass = [
  "bg-muted",
  "bg-emerald-200 dark:bg-emerald-900",
  "bg-emerald-400 dark:bg-emerald-700",
  "bg-emerald-500 dark:bg-emerald-500",
  "bg-emerald-700 dark:bg-emerald-300",
];

export function computeStreaks(days: HeatmapDay[]) {
  const active = new Set(days.filter((d) => d.count > 0).map((d) => d.date));
  let longest = 0;
  let run = 0;
  const sorted = [...active].sort();
  let prev: number | null = null;
  for (const date of sorted) {
    const t = Date.parse(`${date}T00:00:00Z`);
    run = prev !== null && t - prev === 86_400_000 ? run + 1 : 1;
    longest = Math.max(longest, run);
    prev = t;
  }
  return { activeDays: active.size, longestStreak: longest };
}

export function ActivityHeatmap({
  year,
  days,
}: {
  year: number;
  days: HeatmapDay[];
}) {
  const counts = new Map(days.map((d) => [d.date, d.count]));
  const max = days.reduce((m, d) => Math.max(m, d.count), 0);
  const start = new Date(Date.UTC(year, 0, 1));
  const startDow = start.getUTCDay();
  const end = new Date(Date.UTC(year + 1, 0, 1));
  const cells: ({ date: string; count: number } | null)[] = Array.from(
    { length: startDow },
    () => null,
  );
  for (let t = start.getTime(); t < end.getTime(); t += 86_400_000) {
    const date = new Date(t).toISOString().slice(0, 10);
    cells.push({ date, count: counts.get(date) ?? 0 });
  }
  const weeks: (typeof cells)[] = [];
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));
  const months = Array.from({ length: 12 }, (_, m) =>
    new Date(Date.UTC(year, m, 1)).toLocaleString("en", { month: "short", timeZone: "UTC" }),
  );

  return (
    <div className="overflow-x-auto" data-testid="activity-heatmap">
      <div className="inline-flex min-w-full flex-col gap-1.5">
        <div className="grid grid-cols-12 pl-0 text-muted-foreground text-[10px]">
          {months.map((m) => (
            <span key={m}>{m}</span>
          ))}
        </div>
        <div className="flex gap-0.75">
          {weeks.map((week, wi) => (
            <div key={wi} className="flex flex-col gap-0.75">
              {week.map((cell, di) =>
                cell ? (
                  <span
                    key={cell.date}
                    title={`${cell.count} event${cell.count === 1 ? "" : "s"} on ${cell.date}`}
                    className={cn("size-2.5 rounded-[2px]", levelClass[level(cell.count, max)])}
                  />
                ) : (
                  <span key={`e${di}`} className="size-2.5" />
                ),
              )}
            </div>
          ))}
        </div>
        <div className="flex items-center justify-end gap-1 text-muted-foreground text-[10px]">
          Less
          {levelClass.map((c) => (
            <span key={c} className={cn("size-2.5 rounded-[2px]", c)} />
          ))}
          More
        </div>
      </div>
    </div>
  );
}

export function StatChip({ label, value }: { label: string; value: ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs">
      <span className="font-semibold tabular-nums">{value}</span>
      <span className="text-muted-foreground">{label}</span>
    </span>
  );
}
