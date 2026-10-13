import Link from "next/link";

export default function ForbiddenPage() {
  return (
    <div className="mx-auto flex min-h-dvh max-w-lg flex-col justify-center gap-4 px-4 py-12">
      <h1 className="font-semibold text-2xl">Console access denied</h1>
      <p className="text-muted-foreground text-sm">
        This application requires a platform Admin role and an authorized
        operator email (Decision 11). Contact the platform owner if you believe
        this is an error.
      </p>
      <Link href="/" className="text-primary text-sm underline">
        Back to console home
      </Link>
    </div>
  );
}
