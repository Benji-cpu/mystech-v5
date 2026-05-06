import { requireAdminPanel } from "@/lib/auth/helpers";
import {
  recentFailures,
  TEAM_OWNER_EMAIL,
  type DeploymentEvent,
} from "@/lib/deployment-events";
import { Badge } from "@/components/ui/badge";

export const dynamic = "force-dynamic";

export default async function AdminDeploymentsPage() {
  await requireAdminPanel();

  const rows = await recentFailures(30);
  const wrongAuthor = rows.filter(
    (r) =>
      r.commitAuthorEmail !== null &&
      r.commitAuthorEmail !== TEAM_OWNER_EMAIL
  );

  return (
    <div className="space-y-6">
      <div className="flex items-baseline justify-between gap-4 flex-wrap">
        <h1 className="text-2xl font-bold">Deployment failures</h1>
        <p className="text-sm text-muted-foreground">
          {rows.length} in last 30 days
          {wrongAuthor.length > 0 && (
            <>
              {" · "}
              <span className="text-amber-600 dark:text-amber-400 font-medium">
                {wrongAuthor.length} from non-team author
              </span>
            </>
          )}
        </p>
      </div>

      {rows.length === 0 ? (
        <div className="rounded-lg border p-6 text-sm text-muted-foreground space-y-2">
          <p>No deployment failures recorded yet. Trigger an ingest:</p>
          <pre className="text-xs bg-muted/30 rounded p-2 overflow-x-auto">
{`curl -X POST -H "Content-Type: application/json" \\
  -b cookies.txt \\
  https://mystech-v5.vercel.app/api/admin/deployments \\
  -d '{"action":"ingest","sinceHours":336}'`}
          </pre>
        </div>
      ) : (
        <ul className="divide-y divide-border rounded-lg border">
          {rows.map((row) => (
            <DeploymentRow key={row.id} row={row} />
          ))}
        </ul>
      )}
    </div>
  );
}

function DeploymentRow({ row }: { row: DeploymentEvent }) {
  const isWrongAuthor =
    row.commitAuthorEmail !== null &&
    row.commitAuthorEmail !== TEAM_OWNER_EMAIL;

  return (
    <li className="p-4 grid gap-2">
      <div className="flex flex-wrap items-baseline gap-3 text-xs text-muted-foreground">
        <span className="font-mono">
          {new Date(row.createdAt).toLocaleString()}
        </span>
        <Badge
          variant="outline"
          className={
            row.state === "ERROR"
              ? "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/30"
              : "bg-muted/50"
          }
        >
          {row.state}
        </Badge>
        {row.errorCode && (
          <span className="font-mono text-[11px]">{row.errorCode}</span>
        )}
        {row.buildUrl && (
          <a
            href={row.buildUrl}
            target="_blank"
            rel="noreferrer"
            className="underline hover:text-foreground"
          >
            build
          </a>
        )}
      </div>

      {row.errorMessage && (
        <p className="text-sm whitespace-pre-wrap text-red-700 dark:text-red-400">
          {row.errorMessage}
        </p>
      )}

      {row.commitMessage && (
        <p className="text-sm whitespace-pre-wrap">{row.commitMessage}</p>
      )}

      <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
        {row.commitSha && (
          <span className="font-mono">{row.commitSha.slice(0, 7)}</span>
        )}
        {row.commitAuthorEmail && (
          <span
            className={
              isWrongAuthor
                ? "text-amber-600 dark:text-amber-400 font-medium"
                : ""
            }
          >
            {row.commitAuthorEmail}
            {isWrongAuthor && " ⚠ not on team"}
          </span>
        )}
      </div>
    </li>
  );
}
