/**
 * GET /api/cron/nightly-routine
 *
 * Nightly maintenance + digest. Hit by GitHub Actions at 19:22 UTC daily
 * (≈03:22 Bali). Runs idempotent checks across feedback and project-specific
 * health, then optionally emails a digest to ADMIN_EMAIL.
 *
 * Auth: Authorization: Bearer ${CRON_SECRET}
 * Query: ?digest=true sends the email digest (CI uses this; dry runs omit it)
 */
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { feedback, readings, generationLogs, decks } from "@/lib/db/schema";
import { and, eq, gte, isNull, lt, sql } from "drizzle-orm";
import { getResend, EMAIL_FROM } from "@/lib/email/client";
import { ingestAndSummarise, type PipelineHealth } from "@/lib/deployment-events";

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const startedAt = new Date().toISOString();
  const errors: string[] = [];
  const now = new Date();
  const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const fiveMinAgo = new Date(now.getTime() - 5 * 60 * 1000);
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  async function safeCount<T>(label: string, fn: () => Promise<T>): Promise<T | null> {
    try {
      return await fn();
    } catch (err) {
      errors.push(`${label}: ${err instanceof Error ? err.message : String(err)}`);
      return null;
    }
  }

  const feedbackByStatus = await safeCount("feedbackByStatus", async () => {
    const rows = await db
      .select({ status: feedback.status, count: sql<number>`count(*)` })
      .from(feedback)
      .groupBy(feedback.status);
    return rows.reduce<Record<string, number>>((acc, r) => {
      acc[r.status] = Number(r.count);
      return acc;
    }, {});
  });

  const newFeedbackLast24h = await safeCount("newFeedbackLast24h", async () => {
    const [row] = await db
      .select({ count: sql<number>`count(*)` })
      .from(feedback)
      .where(and(eq(feedback.status, "new"), gte(feedback.createdAt, oneDayAgo)));
    return Number(row.count);
  });

  const stuckReadings = await safeCount("stuckReadings", async () => {
    const [row] = await db
      .select({ count: sql<number>`count(*)` })
      .from(readings)
      .where(and(isNull(readings.interpretation), lt(readings.createdAt, fiveMinAgo)));
    return Number(row.count);
  });

  const failedGenerationsLast24h = await safeCount("failedGenerationsLast24h", async () => {
    const [row] = await db
      .select({ count: sql<number>`count(*)` })
      .from(generationLogs)
      .where(and(eq(generationLogs.status, "error"), gte(generationLogs.createdAt, oneDayAgo)));
    return Number(row.count);
  });

  const idleSharedDecks = await safeCount("idleSharedDecks", async () => {
    const [row] = await db
      .select({ count: sql<number>`count(*)` })
      .from(decks)
      .where(and(eq(decks.isPublic, true), lt(decks.createdAt, sevenDaysAgo)));
    return Number(row.count);
  });

  const failedImageGensLast24h = await safeCount("failedImageGensLast24h", async () => {
    const [row] = await db
      .select({ count: sql<number>`count(*)` })
      .from(generationLogs)
      .where(
        and(
          eq(generationLogs.status, "error"),
          eq(generationLogs.operationType, "card_image_generation"),
          gte(generationLogs.createdAt, oneDayAgo)
        )
      );
    return Number(row.count);
  });

  const env = {
    stabilityKey: Boolean(process.env.STABILITY_AI_API_KEY),
    geminiKey: Boolean(process.env.GOOGLE_GENERATIVE_AI_API_KEY),
    blobToken: Boolean(process.env.BLOB_READ_WRITE_TOKEN),
  };

  let pipeline: PipelineHealth | null = null;
  if (process.env.VERCEL_TOKEN) {
    pipeline = await safeCount("pipelineIngest", () => ingestAndSummarise(48));
  }

  const payload = {
    project: "mystech-v5",
    startedAt,
    finishedAt: new Date().toISOString(),
    feedback: {
      byStatus: feedbackByStatus ?? {},
      newLast24h: newFeedbackLast24h ?? 0,
    },
    health: {
      stuckReadings: stuckReadings ?? 0,
      failedGenerationsLast24h: failedGenerationsLast24h ?? 0,
      failedImageGensLast24h: failedImageGensLast24h ?? 0,
      idleSharedDecks: idleSharedDecks ?? 0,
    },
    env,
    pipeline,
    errors,
  };

  const url = new URL(request.url);
  if (url.searchParams.get("digest") === "true" && process.env.ADMIN_EMAIL) {
    try {
      await sendDigest(payload, process.env.ADMIN_EMAIL);
    } catch (err) {
      payload.errors.push(`digest email: ${err instanceof Error ? err.message : String(err)}`);
    }
  }

  if (url.searchParams.get("commit") === "true" && process.env.GITHUB_TOKEN) {
    try {
      const result = await commitDigestJson(payload, process.env.GITHUB_TOKEN);
      (payload as Payload & { committedSha?: string }).committedSha = result.sha;
    } catch (err) {
      payload.errors.push(`github commit: ${err instanceof Error ? err.message : String(err)}`);
    }
  }

  return NextResponse.json(payload);
}

async function commitDigestJson(payload: Payload, token: string): Promise<{ sha: string }> {
  const date = payload.startedAt.slice(0, 10);
  const path = `digests/${date}.json`;
  const repo = "Benji-cpu/mystech-v5";
  const url = `https://api.github.com/repos/${repo}/contents/${path}`;
  const headers = {
    Authorization: `Bearer ${token}`,
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
    "User-Agent": "mystech-v5-cron",
  };

  const existing = await fetch(`${url}?ref=main`, { headers });
  let existingSha: string | undefined;
  if (existing.status === 200) {
    const json = (await existing.json()) as { sha?: string };
    existingSha = json.sha;
  } else if (existing.status !== 404) {
    throw new Error(`GET contents returned ${existing.status}: ${await existing.text()}`);
  }

  const content = Buffer.from(JSON.stringify(payload, null, 2) + "\n", "utf8").toString("base64");
  const body = {
    message: `digest(json): ${date}`,
    content,
    branch: "main",
    committer: { name: "MysTech Cron", email: "hello@mystech.app" },
    author: { name: "MysTech Cron", email: "hello@mystech.app" },
    ...(existingSha ? { sha: existingSha } : {}),
  };

  const put = await fetch(url, {
    method: "PUT",
    headers: { ...headers, "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!put.ok) {
    throw new Error(`PUT contents returned ${put.status}: ${await put.text()}`);
  }
  const putJson = (await put.json()) as { content?: { sha?: string }; commit?: { sha?: string } };
  return { sha: putJson.commit?.sha ?? putJson.content?.sha ?? "" };
}

type Payload = {
  project: string;
  startedAt: string;
  finishedAt: string;
  feedback: { byStatus: Record<string, number>; newLast24h: number };
  health: {
    stuckReadings: number;
    failedGenerationsLast24h: number;
    failedImageGensLast24h: number;
    idleSharedDecks: number;
  };
  env: { stabilityKey: boolean; geminiKey: boolean; blobToken: boolean };
  pipeline: PipelineHealth | null;
  errors: string[];
};

async function sendDigest(payload: Payload, to: string) {
  const resend = getResend();
  if (!resend) return;

  const { feedback: f, health, env, errors } = payload;
  const date = new Date(payload.startedAt).toISOString().slice(0, 10);
  const total = Object.values(f.byStatus).reduce((a, b) => a + b, 0);
  const subject = `MysTech nightly — ${f.newLast24h} new feedback · ${health.stuckReadings} stuck`;

  const envFlag = (ok: boolean) => (ok ? "configured" : "<strong style='color:#c00'>MISSING</strong>");

  const html = `
    <h2>MysTech nightly digest — ${date}</h2>
    <h3>Feedback</h3>
    <ul>
      <li><strong>${f.newLast24h}</strong> new in last 24h</li>
      <li>${f.byStatus.new ?? 0} new (open) · ${f.byStatus.reviewed ?? 0} reviewed · ${(f.byStatus.actioned ?? 0) + (f.byStatus.resolved ?? 0)} actioned · ${f.byStatus.dismissed ?? 0} dismissed (${total} total)</li>
    </ul>
    <h3>Health</h3>
    <ul>
      <li>Stuck readings (interpretation null > 5min): <strong>${health.stuckReadings}</strong></li>
      <li>Failed AI text generations (last 24h): <strong>${health.failedGenerationsLast24h}</strong></li>
      <li>Failed AI image generations (last 24h): <strong>${health.failedImageGensLast24h}</strong></li>
      <li>Public shared decks idle > 7d: ${health.idleSharedDecks}</li>
    </ul>
    <h3>Environment</h3>
    <ul>
      <li>Stability AI: ${envFlag(env.stabilityKey)}</li>
      <li>Gemini: ${envFlag(env.geminiKey)}</li>
      <li>Vercel Blob: ${envFlag(env.blobToken)}</li>
    </ul>
    ${errors.length > 0 ? `<h3>Errors</h3><ul>${errors.map((e) => `<li>${escape(e)}</li>`).join("")}</ul>` : ""}
    <p style="font-size:12px;color:#888">Cron ran ${payload.startedAt} → ${payload.finishedAt}</p>
  `;

  await resend.emails.send({ from: EMAIL_FROM, to, subject, html });
}

function escape(s: string): string {
  return s.replace(/[&<>]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" })[c]!);
}
