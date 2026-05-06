import fs from "node:fs";
import path from "node:path";
import { db } from "@/lib/db";
import { deploymentEvents } from "@/lib/db/schema";
import { desc, gt } from "drizzle-orm";

const TEAM_ID = "team_x4F7Q3Fuz3eKjGWMK6RR7z2l";
const PROJECT_NAME = "mystech-v5";
export const TEAM_OWNER_EMAIL = "profbenjo@gmail.com";

function readProjectId(): string {
  const envProjectId = process.env.VERCEL_PROJECT_ID;
  if (envProjectId) return envProjectId;

  try {
    const cfgPath = path.join(process.cwd(), ".vercel", "project.json");
    const raw = fs.readFileSync(cfgPath, "utf8");
    const parsed = JSON.parse(raw) as { projectId?: string };
    if (parsed.projectId) return parsed.projectId;
  } catch {
    // fall through
  }
  throw new Error(
    "Vercel projectId not found — set VERCEL_PROJECT_ID env or include .vercel/project.json"
  );
}

export type DeploymentEvent = {
  id: string;
  vercelDeploymentId: string;
  projectName: string;
  state: string;
  errorCode: string | null;
  errorMessage: string | null;
  commitSha: string | null;
  commitAuthorEmail: string | null;
  commitMessage: string | null;
  buildUrl: string | null;
  createdAt: Date;
  ingestedAt: Date;
};

export type NormalizedFailure = {
  vercelDeploymentId: string;
  projectName: string;
  state: string;
  errorCode: string | null;
  errorMessage: string | null;
  commitSha: string | null;
  commitAuthorEmail: string | null;
  commitMessage: string | null;
  buildUrl: string | null;
  createdAt: Date;
};

type VercelDeployment = {
  uid: string;
  url?: string;
  state?: string;
  readyState?: string;
  created: number;
  errorCode?: string;
  errorMessage?: string;
  meta?: {
    githubCommitSha?: string;
    githubCommitMessage?: string;
    githubCommitAuthorEmail?: string;
    githubCommitAuthorName?: string;
    gitlabCommitAuthorEmail?: string;
    bitbucketCommitAuthorEmail?: string;
  };
  creator?: {
    email?: string;
    username?: string;
  };
};

export async function fetchRecentVercelFailures(
  sinceMs: number
): Promise<NormalizedFailure[]> {
  const token = process.env.VERCEL_TOKEN;
  if (!token) throw new Error("VERCEL_TOKEN is not set");

  const projectId = readProjectId();
  const params = new URLSearchParams({
    projectId,
    teamId: TEAM_ID,
    state: "ERROR,CANCELED",
    since: String(sinceMs),
    limit: "50",
  });
  const url = `https://api.vercel.com/v6/deployments?${params}`;
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Vercel API ${res.status}: ${body.slice(0, 500)}`);
  }
  const json = (await res.json()) as { deployments?: VercelDeployment[] };
  const deployments = json.deployments ?? [];

  return deployments.map((d) => {
    const commitEmail =
      d.meta?.githubCommitAuthorEmail ??
      d.meta?.gitlabCommitAuthorEmail ??
      d.meta?.bitbucketCommitAuthorEmail ??
      d.creator?.email ??
      null;
    return {
      vercelDeploymentId: d.uid,
      projectName: PROJECT_NAME,
      state: (d.state ?? d.readyState ?? "UNKNOWN").toUpperCase(),
      errorCode: d.errorCode ?? null,
      errorMessage: d.errorMessage ?? null,
      commitSha: d.meta?.githubCommitSha ?? null,
      commitAuthorEmail: commitEmail,
      commitMessage: d.meta?.githubCommitMessage ?? null,
      buildUrl: d.url ? `https://${d.url}` : null,
      createdAt: new Date(d.created),
    };
  });
}

export async function ingestFailures(
  rows: NormalizedFailure[]
): Promise<{ inserted: number; skipped: number }> {
  if (rows.length === 0) return { inserted: 0, skipped: 0 };

  const result = await db
    .insert(deploymentEvents)
    .values(rows)
    .onConflictDoNothing({ target: deploymentEvents.vercelDeploymentId })
    .returning({ id: deploymentEvents.id });

  const inserted = result.length;
  return { inserted, skipped: rows.length - inserted };
}

export async function recentFailures(days: number): Promise<DeploymentEvent[]> {
  const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
  const rows = await db
    .select()
    .from(deploymentEvents)
    .where(gt(deploymentEvents.createdAt, cutoff))
    .orderBy(desc(deploymentEvents.createdAt))
    .limit(200);
  return rows;
}

export type PipelineHealth = {
  fetched: number;
  inserted: number;
  skipped: number;
  wrongAuthorCount: number;
  wrongAuthors: string[];
  buildErrorCount: number;
  recent: Array<{
    vercelDeploymentId: string;
    state: string;
    errorCode: string | null;
    commitAuthorEmail: string | null;
    commitMessage: string | null;
    createdAt: string;
  }>;
};

export async function ingestAndSummarise(sinceHours: number): Promise<PipelineHealth> {
  const sinceMs = Date.now() - sinceHours * 60 * 60 * 1000;
  const rows = await fetchRecentVercelFailures(sinceMs);
  const { inserted, skipped } = await ingestFailures(rows);
  const wrongAuthor = rows.filter(
    (r) =>
      r.commitAuthorEmail !== null &&
      r.commitAuthorEmail !== TEAM_OWNER_EMAIL
  );
  const buildErrors = rows.filter((r) => r.state === "ERROR");
  return {
    fetched: rows.length,
    inserted,
    skipped,
    wrongAuthorCount: wrongAuthor.length,
    wrongAuthors: Array.from(
      new Set(wrongAuthor.map((r) => r.commitAuthorEmail!).filter(Boolean))
    ),
    buildErrorCount: buildErrors.length,
    recent: rows.slice(0, 10).map((r) => ({
      vercelDeploymentId: r.vercelDeploymentId,
      state: r.state,
      errorCode: r.errorCode,
      commitAuthorEmail: r.commitAuthorEmail,
      commitMessage: r.commitMessage,
      createdAt: r.createdAt.toISOString(),
    })),
  };
}
