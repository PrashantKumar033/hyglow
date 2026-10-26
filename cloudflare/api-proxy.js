// Wrangler routes /api/* through this worker and serves the built SPA assets
// for all other paths.
export default {
  async fetch(request, env) {
    let apiOrigin;
    try {
      apiOrigin = new URL(env.API_ORIGIN);
    } catch {
      return Response.json({ error: "API_ORIGIN is not configured" }, { status: 500 });
    }

    if (
      apiOrigin.protocol !== "https:" ||
      apiOrigin.username ||
      apiOrigin.password ||
      apiOrigin.pathname !== "/" ||
      apiOrigin.search ||
      apiOrigin.hash
    ) {
      return Response.json({ error: "API_ORIGIN must be an HTTPS origin without a path" }, { status: 500 });
    }

    const requestUrl = new URL(request.url);
    requestUrl.protocol = apiOrigin.protocol;
    requestUrl.host = apiOrigin.host;

    try {
      return await fetch(new Request(requestUrl, request));
    } catch {
      return Response.json({ error: "API unreachable" }, { status: 502 });
    }
  },
};
