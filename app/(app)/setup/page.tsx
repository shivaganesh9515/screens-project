import Link from "next/link";

export default function SetupPage() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="mx-auto max-w-md text-center">
        <h1 className="text-2xl font-semibold tracking-tight">Organization Required</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Your account is not linked to an organization. Please contact admin or create an organization.
        </p>
        <div className="mt-6">
          <Link
            href="/overview"
            className="inline-flex h-10 items-center justify-center rounded-lg bg-primary px-6 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
