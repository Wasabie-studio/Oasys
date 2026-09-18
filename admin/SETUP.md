# OASYS Content Manager — one-time setup

The site's Team, News, Services, Sectors and Partner logos now live in `/data/*.json`
and can be edited through a login-protected form at `yoursite.com/admin`, instead of
by editing code. This only needs to be set up once. It uses two free accounts —
GitHub (which you already have, since the site lives here) and Cloudflare (used only
to run a tiny script that hands out logins — the site itself is **not** hosted on
Cloudflare).

## 1. Turn on GitHub Pages (hosts the site)

1. Go to **github.com/Wasabie-studio/Oasys → Settings → Pages**.
2. Under "Build and deployment", set **Source** to "Deploy from a branch".
3. Branch: `main`, folder: `/ (root)`. Save.
4. After a minute, the site is live at `https://wasabie-studio.github.io/Oasys/oasys-home.html`
   (GitHub shows the exact URL on that same Settings → Pages screen).

## 2. Create a GitHub OAuth App (lets staff log into /admin with GitHub)

1. Go to **github.com/settings/developers → OAuth Apps → New OAuth App**
   (use whichever GitHub account should own this — typically the org owner).
2. Fill in:
   - **Application name**: `OASYS CMS`
   - **Homepage URL**: `https://wasabie-studio.github.io/Oasys/`
   - **Authorization callback URL**: leave a placeholder for now
     (`https://example.com/callback`) — you'll come back and fix this to the
     real Worker URL in step 3.
3. Click **Register application**, then **Generate a new client secret**.
4. Keep the **Client ID** and **Client Secret** visible — you'll paste them below.

## 3. Deploy the login relay on Cloudflare Workers (free)

This repo already has the small script that does the login handshake, at
[`cloudflare-worker/oauth-worker.js`](../cloudflare-worker/oauth-worker.js).
It never touches OASYS content — it only exchanges a GitHub login code for an
access token and hands it back to the CMS.

1. Sign up free at **dash.cloudflare.com** (no credit card needed).
2. Go to **Workers & Pages → Create → Create Worker**. Give it any name
   (e.g. `oasys-cms-oauth`) and deploy the default "Hello World" script first.
3. Open the new Worker → **Edit code** (the online code editor). Delete the
   default code and paste in the full contents of
   `cloudflare-worker/oauth-worker.js` from this repo. Click **Deploy**.
4. Go to the Worker's **Settings → Variables and Secrets**. Add two:
   - `GITHUB_CLIENT_ID` — plain text, the Client ID from step 2.
   - `GITHUB_CLIENT_SECRET` — click **Encrypt**, paste the Client Secret from step 2.
   Save/redeploy after adding them.
5. Copy the Worker's URL shown at the top of its page — it looks like
   `https://oasys-cms-oauth.<your-subdomain>.workers.dev`.
6. Go back to the GitHub OAuth App from step 2 and set the
   **Authorization callback URL** to that URL + `/callback`, e.g.
   `https://oasys-cms-oauth.<your-subdomain>.workers.dev/callback`. Save.
7. In this repo, edit `admin/config.yml` and set `base_url` (under `backend:`)
   to the Worker's URL from step 5 (no trailing slash, no `/callback`).
   Commit and push — GitHub Pages picks it up within a minute or two.

## 4. Log in and start editing

1. Go to `https://wasabie-studio.github.io/Oasys/admin/`.
2. Click **Login with GitHub**, authorize the app once.
3. You'll see six sections: **Sectors**, **Services**, **Team — Full Roster**,
   **Team — Homepage Preview**, **Partner & Client Logos**, **News**.
4. Click a section, edit the fields or add/remove list items, upload photos
   directly in the form, then click **Publish**. Changes are committed straight
   to the `main` branch on GitHub and go live within a minute or two —
   no developer involved.

## Notes / limits

- Only people with **write access to the GitHub repo** (or added as
  collaborators) can log in and publish — GitHub is the source of truth for
  who's allowed to edit.
- We initially tried routing this through Netlify's built-in OAuth relay
  instead of a Worker (no code to maintain), but it requires the CMS's own
  domain to be registered to a Netlify site, and that path turned out to be
  unreliable for a domain Netlify doesn't otherwise know about (GitHub Pages,
  in our case) — it kept surfacing Netlify's own domain-verification flow
  instead of the GitHub login. The Cloudflare Worker above sidesteps that
  entirely since it's a plain OAuth exchange we control end to end.
