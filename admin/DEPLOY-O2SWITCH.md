# Hosting the site on o2switch (with the CMS still working)

The CMS at `/admin` writes to **this GitHub repository**, not to the web
server. That is the one thing to hold on to, because everything below follows
from it:

- The CMS itself does **not** care where the site is hosted. Logging in and
  publishing works the same from `oasysgroupe.com/admin` as from GitHub Pages.
- But GitHub Pages used to *rebuild itself* on every commit. o2switch will
  not. Without a deploy step, Samba publishes, the commit lands in GitHub,
  and the live site never changes.

`.github/workflows/deploy-o2switch.yml` is that deploy step. It uploads the
site to o2switch over FTPS every time `main` changes — including the commits
the CMS makes — so publishing in `/admin` still updates the live site within
a minute or two.

---

## What we need from you

Three values, and **none of them should be pasted into a chat or an email**.
They go straight into GitHub, where the workflow reads them and nobody can
read them back out:

**GitHub → the `Wasabie-studio/Oasys` repo → Settings → Secrets and variables
→ Actions → New repository secret.** Add these three:

| Secret name | What it is | Where to find it |
|---|---|---|
| `O2SWITCH_FTP_HOST` | FTP server hostname | cPanel → **FTP Accounts** → *Configure FTP Client*. Usually your o2switch server name, e.g. `nomserveur.o2switch.net`, or `ftp.oasysgroupe.com` once DNS points there. |
| `O2SWITCH_FTP_USER` | FTP account username | Same screen. On o2switch it usually looks like `user@oasysgroupe.com`. |
| `O2SWITCH_FTP_PASSWORD` | That account's password | Set when the FTP account is created. Make a **dedicated** FTP account for deploys rather than reusing the main cPanel login. |

Then tell us **one** thing here in chat (it is not a secret):

- **Which folder on the server the site should go in.** `public_html` is the
  default and is right for a primary domain. An add-on or parked domain has
  its own folder, e.g. `public_html/oasys` or `oasysgroupe.com`. If it is not
  `public_html`, add a repository *variable* (same screen, **Variables** tab)
  named `O2SWITCH_REMOTE_DIR` with that path.

That is the whole list. Everything else is already done.

---

## What you also need to do on the o2switch side

1. **Point the domain at o2switch** (if it is not already) and wait for DNS.
2. **Turn on SSL** — cPanel → *SSL/TLS Status* → AutoSSL, or Let's Encrypt.
   This is not optional: the CMS login opens a popup that only works over
   **HTTPS**. On plain `http://` the login will fail.
3. **Create the FTP account** from the table above, scoped to the site folder.
4. Leave `public_html` empty, or be aware that the deploy adds files
   alongside whatever is already there (it does not delete — see below).

---

## What does NOT need to change

Worth knowing, because it is the part people expect to be hard:

- **`admin/config.yml`** — untouched. The backend still points at this repo.
- **The Cloudflare Worker** — untouched. It hands the token back to whatever
  origin asked for it, with no hardcoded allowlist, so it works from the new
  domain as-is.
- **The GitHub OAuth App** — untouched. Its callback points at the Worker,
  not at the website, so moving the website does not affect it. (Its
  "Homepage URL" field is cosmetic; update it if you like.)
- **The site's links** — all relative, so the site works at a domain root or
  in a subfolder.

If you would rather not depend on Cloudflare at all, o2switch runs PHP and the
relay could move onto the same domain later. That is optional and changes
nothing about the above.

---

## First run: test before trusting it

1. Add the three secrets.
2. GitHub → **Actions** → *Deploy to o2switch* → **Run workflow**, and tick
   **Dry run**. Nothing is uploaded; the log lists exactly what *would* be.
3. Read that list. If the target folder looks wrong, fix
   `O2SWITCH_REMOTE_DIR` and dry-run again.
4. Run it again with Dry run **unticked**. That is the real deploy.
5. From then on it runs by itself on every push to `main`, CMS publishes
   included.

## Deleting stale files

By default the deploy **never deletes anything** on the server. It adds and
overwrites only. This is deliberate: a first deploy into a folder that already
has files should not wipe them.

The cost is that a file removed from the repo stays on the server. Once you
are certain the folder holds nothing but this site, add a repository variable
`O2SWITCH_DELETE_REMOVED` = `true` and the deploy will mirror deletions too.

## If it fails

- **`Missing repository secret(s)`** — one of the three is missing or
  misspelled. The log names it.
- **Login fails** — check the username form. o2switch FTP usernames are
  normally `something@yourdomain`, not bare.
- **Certificate error** — the FTP hostname does not match the certificate.
  Setting the variable `O2SWITCH_VERIFY_CERT` = `false` gets you unblocked,
  but treat it as something to fix, not to leave: prefer the hostname
  o2switch gives you in *Configure FTP Client*.
- **The CMS login popup opens and closes doing nothing** — the admin page is
  being served over `http://`. Fix SSL (step 2 above).
