import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { GITHUB_BRANCH, GITHUB_REPO, GITHUB_TOKEN } from "astro:env/server";
import { siteSchema, type SiteContent } from "../contentSchema";

export const SITE_JSON_PATH = "src/data/site.json";

export type StorageMode = "github" | "local" | "unconfigured";

export interface FileChange {
  path: string;
  content: Buffer;
}

// Vercel's filesystem doesn't persist runtime writes, so in production the
// GitHub repo is the database: each save is a commit, which redeploys the
// static site. Local dev writes the files directly for a fast loop.
export function storageMode(): StorageMode {
  if (GITHUB_TOKEN) return "github";
  if (import.meta.env.DEV) return "local";
  return "unconfigured";
}

export class StorageError extends Error {
  constructor(
    message: string,
    readonly status?: number,
  ) {
    super(message);
  }
}

async function github<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`https://api.github.com/repos/${GITHUB_REPO}${path}`, {
    ...init,
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${GITHUB_TOKEN}`,
      "X-GitHub-Api-Version": "2022-11-28",
      "User-Agent": "drandrefelipe-admin",
      ...(init?.body ? { "Content-Type": "application/json" } : {}),
    },
  });
  if (!response.ok) {
    const detail = await response.text();
    throw new StorageError(`GitHub ${response.status}: ${detail.slice(0, 300)}`, response.status);
  }
  return response.json() as Promise<T>;
}

interface Snapshot {
  content: SiteContent;
  // Commit the content was read from; writes are based on it (GitHub only).
  commitSha?: string;
}

async function readSnapshot(): Promise<Snapshot> {
  const mode = storageMode();

  if (mode === "github") {
    const ref = await github<{ object: { sha: string } }>(`/git/ref/heads/${GITHUB_BRANCH}`);
    const commitSha = ref.object.sha;
    const file = await github<{ content: string }>(
      `/contents/${SITE_JSON_PATH}?ref=${commitSha}`,
    );
    const json = JSON.parse(Buffer.from(file.content, "base64").toString("utf8"));
    return { content: siteSchema.parse(json), commitSha };
  }

  const json = JSON.parse(await readFile(join(process.cwd(), SITE_JSON_PATH), "utf8"));
  return { content: siteSchema.parse(json) };
}

export async function readSite(): Promise<SiteContent> {
  return (await readSnapshot()).content;
}

async function commitToGitHub(parentSha: string, files: FileChange[], message: string) {
  const parent = await github<{ tree: { sha: string } }>(`/git/commits/${parentSha}`);
  const tree = await github<{ sha: string }>("/git/trees", {
    method: "POST",
    body: JSON.stringify({
      base_tree: parent.tree.sha,
      tree: await Promise.all(
        files.map(async (file) => {
          const blob = await github<{ sha: string }>("/git/blobs", {
            method: "POST",
            body: JSON.stringify({ content: file.content.toString("base64"), encoding: "base64" }),
          });
          return { path: file.path, mode: "100644", type: "blob", sha: blob.sha };
        }),
      ),
    }),
  });
  const commit = await github<{ sha: string; html_url: string }>("/git/commits", {
    method: "POST",
    body: JSON.stringify({ message, tree: tree.sha, parents: [parentSha] }),
  });
  // force: false makes GitHub reject this if the branch moved since we read it.
  await github(`/git/refs/heads/${GITHUB_BRANCH}`, {
    method: "PATCH",
    body: JSON.stringify({ sha: commit.sha, force: false }),
  });
  return commit.html_url;
}

/**
 * Applies `update` to the latest saved content and persists it together with
 * `extraFiles` (uploaded images) as one atomic change.
 */
export async function saveSite(
  update: (current: SiteContent) => SiteContent,
  extraFiles: FileChange[],
  message: string,
): Promise<{ content: SiteContent; commitUrl?: string }> {
  const mode = storageMode();
  if (mode === "unconfigured") {
    throw new StorageError("GITHUB_TOKEN não configurado: não é possível salvar em produção.");
  }

  // Retry once if someone else saved between our read and our write.
  for (let attempt = 0; ; attempt++) {
    const snapshot = await readSnapshot();
    const content = siteSchema.parse(update(snapshot.content));
    const siteFile = {
      path: SITE_JSON_PATH,
      content: Buffer.from(`${JSON.stringify(content, null, 2)}\n`),
    };

    if (mode === "local") {
      for (const file of [...extraFiles, siteFile]) {
        const target = join(process.cwd(), file.path);
        await mkdir(dirname(target), { recursive: true });
        await writeFile(target, file.content);
      }
      return { content };
    }

    try {
      const commitUrl = await commitToGitHub(snapshot.commitSha!, [...extraFiles, siteFile], message);
      return { content, commitUrl };
    } catch (error) {
      if (error instanceof StorageError && error.status === 422 && attempt === 0) continue;
      throw error;
    }
  }
}
