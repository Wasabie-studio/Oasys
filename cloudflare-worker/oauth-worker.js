/**
 * Self-hosted OAuth relay for the Decap CMS "github" backend.
 *
 * Deploy this as a Cloudflare Worker (free tier). It replaces
 * api.netlify.com as the CMS's `base_url` — see admin/SETUP.md.
 *
 * Required environment variables (set in the Worker's Settings > Variables):
 *   GITHUB_CLIENT_ID     - the GitHub OAuth App's Client ID
 *   GITHUB_CLIENT_SECRET - the GitHub OAuth App's Client Secret (encrypt this one)
 *
 * The GitHub OAuth App's "Authorization callback URL" must be set to
 * this worker's own URL + "/callback", e.g.:
 *   https://oasys-cms-oauth.<your-subdomain>.workers.dev/callback
 *
 * Protocol implemented here (the postMessage handshake Decap CMS expects)
 * is adapted from the community reference implementation at
 * https://github.com/i40west/netlify-cms-cloudflare-pages
 */

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === "/auth") {
      const redirectUrl = new URL("https://github.com/login/oauth/authorize");
      redirectUrl.searchParams.set("client_id", env.GITHUB_CLIENT_ID);
      redirectUrl.searchParams.set("redirect_uri", url.origin + "/callback");
      redirectUrl.searchParams.set("scope", "repo user");
      redirectUrl.searchParams.set(
        "state",
        crypto.getRandomValues(new Uint8Array(12)).join("")
      );
      return Response.redirect(redirectUrl.href, 302);
    }

    if (url.pathname === "/callback") {
      const code = url.searchParams.get("code");
      try {
        const tokenRes = await fetch(
          "https://github.com/login/oauth/access_token",
          {
            method: "POST",
            headers: {
              "content-type": "application/json",
              "user-agent": "oasys-cms-oauth-worker",
              accept: "application/json",
            },
            body: JSON.stringify({
              client_id: env.GITHUB_CLIENT_ID,
              client_secret: env.GITHUB_CLIENT_SECRET,
              code,
            }),
          }
        );
        const result = await tokenRes.json();

        if (result.error) {
          return new Response(renderBody("error", result), {
            headers: { "content-type": "text/html;charset=UTF-8" },
            status: 401,
          });
        }

        const body = renderBody("success", {
          token: result.access_token,
          provider: "github",
        });
        return new Response(body, {
          headers: { "content-type": "text/html;charset=UTF-8" },
          status: 200,
        });
      } catch (error) {
        return new Response(error.message, { status: 500 });
      }
    }

    return new Response("Not found", { status: 404 });
  },
};

function renderBody(status, content) {
  return `
    <script>
      const receiveMessage = (message) => {
        window.opener.postMessage(
          'authorization:github:${status}:${JSON.stringify(content)}',
          message.origin
        );
        window.removeEventListener("message", receiveMessage, false);
      }
      window.addEventListener("message", receiveMessage, false);
      window.opener.postMessage("authorizing:github", "*");
    </script>
  `;
}
