# OASYS Content Manager — one-time setup

The site's Team, News, Services, Sectors and Partner logos now live in `/data/*.json`
and can be edited through a login-protected form at `yoursite.com/admin`, instead of
by editing code. This only needs to be set up once. It uses two free accounts —
GitHub (which you already have, since the site lives here) and Netlify (used only
to hand out logins — the site itself is **not** hosted on Netlify).

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
   - **Authorization callback URL**: `https://api.netlify.com/auth/done`
3. Click **Register application**, then **Generate a new client secret**.
4. Keep the **Client ID** and **Client Secret** visible — you'll paste them in step 3.

## 3. Create a free Netlify account (used only as the login relay)

Netlify is not hosting the site — it just runs the small, free service that
completes the "Login with GitHub" handshake for the CMS.

1. Sign up at **netlify.com** (free tier, no credit card needed) and create any
   one site there — even an empty placeholder site is fine; it's never linked
   to OASYS content.
2. Open that site's dashboard, then go to
   **Project configuration → Security → OAuth**.
3. Under **Authentication Providers**, click **Install Provider**, select
   **GitHub**, and paste in the Client ID and Client Secret from step 2. Save.
4. Still on that placeholder site, go to
   **Project configuration → Domain management**, and add
   **`wasabie-studio.github.io`** as a **Domain alias** (not a primary/custom
   domain — it never needs to actually resolve there). This step is required:
   when the CMS calls `api.netlify.com/auth`, Netlify identifies which site's
   OAuth provider to use by matching the CMS's own domain
   (`wasabie-studio.github.io`) against domains registered to a Netlify site —
   without this alias, that lookup fails with "Not Found".

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
- If you'd rather not depend on Netlify at all for login, the GitHub-backend
  OAuth handshake can instead be run through a small self-hosted proxy
  (e.g. a Cloudflare Worker) — ask a developer to swap `base_url` in
  `admin/config.yml` if that's preferred later.
