export default function ConsentPage() {
  return (
    <div className="mx-auto flex min-h-svh max-w-lg flex-col justify-center px-4 py-12">
      <h1 className="font-semibold text-xl">Authorize application</h1>
      <p className="mt-2 text-muted-foreground text-sm">
        MCP / OAuth consent is handled by the Better Auth MCP plugin. If you
        reached this page without a client request, return to your application.
      </p>
    </div>
  );
}
