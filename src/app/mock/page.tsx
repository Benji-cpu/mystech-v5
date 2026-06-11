import Link from "next/link";

export default function MockHub() {
  return (
    <div className="min-h-screen bg-background px-4 sm:px-6 py-8 sm:py-12">
      <div className="mx-auto max-w-2xl">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Mock Hub</h1>
        <p className="mt-2 text-sm sm:text-base text-muted-foreground">
          Approved reference implementations. Experimental prototypes were
          archived in the v5 simplification overhaul (recoverable from git
          history).
        </p>

        <Link
          href="/mock/approved"
          className="mt-8 block rounded-2xl border border-primary/30 bg-primary/5 p-6 transition-colors hover:border-primary/50 hover:bg-primary/10"
        >
          <h2 className="text-lg font-semibold">Approved Mocks</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Reference implementations approved for production — reading
            ceremony, background system, and card morph techniques.
          </p>
        </Link>
      </div>
    </div>
  );
}
