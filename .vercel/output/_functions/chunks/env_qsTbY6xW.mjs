let cloudflareEnv = {};
try {
  const mod = await import('cloudflare:workers');
  cloudflareEnv = mod.env ?? {};
} catch {
}
function getRuntimeEnv() {
  return cloudflareEnv;
}
function jsonResponse(data, init) {
  return new Response(JSON.stringify(data), {
    ...init,
    headers: {
      "content-type": "application/json; charset=utf-8",
      ...init?.headers
    }
  });
}

export { getRuntimeEnv as g, jsonResponse as j };
