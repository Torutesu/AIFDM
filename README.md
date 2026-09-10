# AIFDM

An AI marketing operator for your website. It researches your site, builds a
knowledge base, proposes opportunities against a goal you set, drafts content,
scores that content against your own facts, opens a GitHub PR to publish it,
and feeds measured results back into the next round of proposals.

The loop, end to end:

```
site → crawl → knowledge base → connect Search Console → set a goal
  → AI proposes opportunities → you approve or dismiss
  → AI drafts content → a second AI scores it → you review
  → publish as a GitHub PR → log an experiment → record the result
  → those results steer the next round of proposals
```

Every AI step stops at a human decision. Nothing publishes on its own.

## Stack

| Concern | Choice |
|---|---|
| Framework | Next.js 16 (App Router, Turbopack) |
| Database | Neon Postgres via Prisma 7 + `@prisma/adapter-neon` |
| Auth | Clerk (organizations required) |
| Background jobs | Inngest |
| AI | OpenAI via the Vercel AI SDK (`gpt-4o`, `gpt-4o-mini`) |
| Crawling | Firecrawl |
| Publishing | GitHub REST API (branch → commit → PR) |

## Local development

```bash
pnpm install
cp .env.example .env.local     # then fill in every value
pnpm db:deploy                 # apply migrations to your database
pnpm dev
```

In a second terminal, run the Inngest dev server so background jobs execute:

```bash
npx inngest-cli@latest dev -u http://localhost:3000/api/inngest
```

Without it, crawls, knowledge-base builds, Search Console syncs, opportunity
generation, content generation and publishing will all sit queued and never run.

### Scripts

| Script | What it does |
|---|---|
| `pnpm dev` | Dev server |
| `pnpm build` | `prisma generate` then `next build` |
| `pnpm start` | Production server |
| `pnpm lint` | ESLint |
| `pnpm db:generate` | Regenerate the Prisma client into `src/generated/prisma` |
| `pnpm db:migrate` | Create + apply a migration (development) |
| `pnpm db:deploy` | Apply pending migrations (production) |
| `pnpm db:status` | Show migration state against the current database |

The generated Prisma client is **not** committed — `pnpm build` regenerates it,
so any clean checkout builds correctly.

## Deploying to production

### 1. Provision the services

| Service | What to create | What you get |
|---|---|---|
| [Neon](https://neon.tech) | A project + database | `DATABASE_URL` — use the **pooled** string (`-pooler`) |
| [Clerk](https://clerk.com) | A production instance, **Organizations enabled** | `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY` |
| [OpenAI](https://platform.openai.com) | An API key with billing | `OPENAI_API_KEY` |
| [Firecrawl](https://firecrawl.dev) | An API key | `FIRECRAWL_API_KEY` |
| [Inngest](https://inngest.com) | An app, production environment | `INNGEST_EVENT_KEY`, `INNGEST_SIGNING_KEY` |
| Google Cloud | OAuth client (Web application) + Search Console API enabled | `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` |
| GitHub | A token with write access to the target repos | `GITHUB_TOKEN` |

Generate the credential-encryption key yourself:

```bash
openssl rand -base64 32     # → ENCRYPTION_KEY
```

Clerk **Organizations must be turned on**. `requireOrg()` rejects every request
that has no active organization, so with organizations off the dashboard is
unusable for all users.

### 2. Deploy the app

Import the repository on Vercel (or any Node host). Defaults are correct — the
`build` script already runs `prisma generate`.

Set every variable from `.env.example` in the host's environment. Clerk's keys
and `DATABASE_URL` are read during the build, not only at runtime, so a missing
value fails the build rather than the first request.

`GOOGLE_REDIRECT_URI` is optional — see step 4. Everything else is required.

### 3. Apply migrations

Migrations do **not** run automatically on deploy. Run them against production
explicitly, from your machine or CI:

```bash
DATABASE_URL="<production url>" pnpm db:deploy
```

Verify with `DATABASE_URL="<production url>" pnpm db:status`.

If you would rather have migrations run on every deploy, change the Vercel build
command to `prisma migrate deploy && pnpm build` — but note preview deployments
would then migrate the production database too.

### 4. Register the Google OAuth redirect URI

In Google Cloud → Credentials → your OAuth client, add the authorised redirect
URI for whatever host the app ended up on — the Vercel-assigned one is fine:

```
https://<your-host>/api/integrations/google/callback
```

You do **not** need to set `GOOGLE_REDIRECT_URI`. Left unset, the app derives
the redirect URI from the host each request arrives on, so it keeps working
when you add a custom domain later — register the new host's URI alongside the
old one and nothing else changes. Set the variable only if you want to pin one
specific URI.

While the OAuth consent screen is in *Testing*, only the accounts listed as test
users can connect Search Console. Publish the consent screen before onboarding
anyone else.

### 5. Register the Inngest app

In the Inngest dashboard, add the production app with the URL:

```
https://<your-domain>/api/inngest
```

Until this sync succeeds, no background job runs — the UI will accept every
action and then appear to do nothing.

### 6. Smoke test the loop

1. Sign up, create an organization.
2. Add a website → its status should move `Queued → Crawling… → Ready`.
3. Check the knowledge base filled in with facts.
4. Connect Search Console and select a property.
5. Set a goal → opportunities should appear.
6. Approve one → a draft with a rubric score should appear.
7. Configure owner/repo/path, approve a draft, publish → a PR should open.

If step 2 never leaves `Queued`, Inngest is not connected (step 5 above).

## Roles

Membership roles are enforced in `requireOrg()`, which every query and mutation
goes through. Reads are open to the whole organization; writes name the role
they need, so a check cannot be forgotten silently.

| | VIEWER | MEMBER | ADMIN | OWNER |
|---|:---:|:---:|:---:|:---:|
| See everything: facts, opportunities, drafts, experiments, spend | ✅ | ✅ | ✅ | ✅ |
| Add a website, set a goal, edit facts | | ✅ | ✅ | ✅ |
| Approve or dismiss an opportunity | | ✅ | ✅ | ✅ |
| Approve, reject or regenerate a draft | | ✅ | ✅ | ✅ |
| Publish a draft as a GitHub PR | | ✅ | ✅ | ✅ |
| Start an experiment, record a result | | ✅ | ✅ | ✅ |
| Sync Search Console now | | ✅ | ✅ | ✅ |
| Set the GitHub repository to publish to | | | ✅ | ✅ |
| Connect a Google account, choose a Search Console property | | | ✅ | ✅ |

The UI follows the same rules — a viewer sees the data with the action buttons
gone, not buttons that fail when clicked. The server check is the one that
matters; the UI is a courtesy.

Roles come from the `Membership` row, not from Clerk. New members default to
`MEMBER`.

## Known limitations

Read these before putting real customers on it.

- **GitHub publishing uses one global token.** `GITHUB_TOKEN` is shared by every
  workspace, so a workspace can only publish to repositories that token can
  reach. Multi-tenant publishing needs a GitHub App instead.
- **Nothing is scheduled.** There are no cron jobs. Re-crawls, Search Console
  syncs and opportunity refreshes only happen when someone clicks.
- **The digest is on-screen only.** No email or Slack delivery.
- **Experiment values are entered by hand**, even though Search Console metrics
  are already stored in the `Metric` table.
- **There are no tests and no CI.**
