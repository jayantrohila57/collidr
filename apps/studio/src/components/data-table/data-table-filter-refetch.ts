/** Resolve a row/result count from a table refetch (e.g. TanStack Query `refetch()`). */
export function getDataTableFilterResultCount(
  result: unknown,
): number | undefined {
  if (result == null || typeof result !== "object") {
    return undefined;
  }

  const payload =
    "data" in result && result.data !== undefined
      ? (result as { data: unknown }).data
      : result;

  if (payload == null || typeof payload !== "object") {
    return undefined;
  }

  if ("total" in payload && typeof payload.total === "number") {
    return payload.total;
  }

  if ("count" in payload && typeof payload.count === "number") {
    return payload.count;
  }

  if ("data" in payload && Array.isArray(payload.data)) {
    return payload.data.length;
  }

  if (Array.isArray(payload)) {
    return payload.length;
  }

  return undefined;
}

export function formatAppliedFiltersSuccess(count: number | undefined): string {
  if (count === undefined) {
    return "Filters applied";
  }
  const label = count === 1 ? "result" : "results";
  return `Filters applied (${count} ${label})`;
}

export function waitForClientTableRefresh(): Promise<void> {
  return new Promise((resolve) => {
    requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
  });
}
