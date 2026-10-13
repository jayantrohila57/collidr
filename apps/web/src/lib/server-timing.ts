import "server-only";

import { after } from "next/server";

export type ServerTimingSpan = {
  name: string;
  durationMs: number;
};

export class ServerTiming {
  private readonly spans: ServerTimingSpan[] = [];
  private readonly route: string;

  constructor(route: string) {
    this.route = route;
  }

  async measure<T>(name: string, fn: () => Promise<T>): Promise<T> {
    const start = performance.now();
    try {
      return await fn();
    } finally {
      this.spans.push({
        name,
        durationMs: performance.now() - start,
      });
    }
  }

  toHeaderValue(): string {
    return this.spans
      .map((span) => `${span.name};dur=${Math.round(span.durationMs)}`)
      .join(", ");
  }

  logInAfter(): void {
    after(() => {
      const totalMs = this.spans.reduce(
        (sum, span) => sum + span.durationMs,
        0,
      );
      console.info(
        JSON.stringify({
          type: "Server-Timing",
          route: this.route,
          totalMs: Math.round(totalMs),
          header: this.toHeaderValue(),
          spans: this.spans.map((span) => ({
            name: span.name,
            dur: Math.round(span.durationMs),
          })),
        }),
      );
    });
  }
}
