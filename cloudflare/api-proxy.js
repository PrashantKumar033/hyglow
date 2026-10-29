// Runs only for /api/* (see run_worker_first in wrangler.jsonc).
// Everything else is served straight from the built frontend.
export default {
  async fetch(request, env) {
    if (!env.API_ORIGIN || env.API_ORIGIN.includes("CHANGE-ME")) {
      return Response.json({ error: "API_ORIGIN is not configured" }, { status: 500 });
    }
    const target = new URL(env.API_ORIGIN);
    const url = new URL(request.url);
    url.protocol = target.protocol;
    url.host = target.host;
    try {
      return await fetch(new Request(url, request));
    } catch {
      return Response.json({ error: "API unreachable" }, { status: 502 });
    }
  },
};
