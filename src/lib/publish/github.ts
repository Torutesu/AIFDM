const API = "https://api.github.com";

function headers() {
  return {
    Authorization: "Bearer " + process.env.GITHUB_TOKEN,
    Accept: "application/vnd.github+json",
    "Content-Type": "application/json",
  };
}

async function gh(path: string, init?: RequestInit) {
  const res = await fetch(API + path, { ...init, headers: headers() });
  if (!res.ok) {
    throw new Error("GitHub " + res.status + ": " + (await res.text()));
  }
  return res.json();
}

export async function publishToGithub(input: {
  owner: string;
  repo: string;
  path: string;
  branch: string;
  filename: string;
  content: string;
  title: string;
  bodyText: string;
}) {
  const repoInfo = await gh("/repos/" + input.owner + "/" + input.repo);
  const base = repoInfo.default_branch;

  const baseRef = await gh(
    "/repos/" + input.owner + "/" + input.repo + "/git/ref/heads/" + base
  );

  await gh("/repos/" + input.owner + "/" + input.repo + "/git/refs", {
    method: "POST",
    body: JSON.stringify({
      ref: "refs/heads/" + input.branch,
      sha: baseRef.object.sha,
    }),
  });

  const fullPath = input.path.replace(/^\/+|\/+$/g, "") + "/" + input.filename;

  await gh(
    "/repos/" + input.owner + "/" + input.repo + "/contents/" + fullPath,
    {
      method: "PUT",
      body: JSON.stringify({
        message: "Add " + input.filename,
        content: Buffer.from(input.content).toString("base64"),
        branch: input.branch,
      }),
    }
  );

  const pr = await gh("/repos/" + input.owner + "/" + input.repo + "/pulls", {
    method: "POST",
    body: JSON.stringify({
      title: input.title,
      head: input.branch,
      base,
      body: input.bodyText,
    }),
  });

  return { prUrl: pr.html_url as string };
}