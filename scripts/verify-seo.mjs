// Local integration check. Uses an isolated mock API; never writes to Supabase.
// Run with: node scripts/verify-seo.mjs (stop other Next dev servers first).
import assert from "node:assert/strict";
import http from "node:http";
import path from "node:path";
import { spawn, spawnSync } from "node:child_process";
import { chromium } from "playwright";

const origin = "https://www.ginergetica.com";
const port = Number(process.env.SEO_TEST_PORT || 3100);
const base = `http://localhost:${port}`;
const appDirectory = process.env.SEO_TEST_APP_DIR || process.cwd();
const freeId = "11111111-1111-4111-8111-111111111111";
const premiumId = "22222222-2222-4222-8222-222222222222";
const privateId = "33333333-3333-4333-8333-333333333333";
const missingId = "44444444-4444-4444-8444-444444444444";
const resources = [
  { id: freeId, titulo: "Audio público de prueba", tipo_suscripcion: "gratuito" },
  { id: premiumId, titulo: "Práctica premium de prueba", tipo_suscripcion: ["mensual", "anual"] },
  { id: privateId, titulo: "Práctica privada de prueba", tipo_suscripcion: "mensual" },
].map(resource => ({ ...resource, activo: true, tipo: "audio", descripcion: "Un recurso para explorar tu ciclo y acompañar tu práctica.", url: "https://files.example.test/premium-secret.wav", imagen_url: null, fase: "Menguante", elemento: "Tierra", arquetipo: "Sabia" }));
// The live schema may not have these optional columns yet.
for (const key of ["imagen_url", "fase", "elemento", "arquetipo"]) delete resources[0][key];

const api = http.createServer((req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", req.headers["access-control-request-headers"] || "authorization,apikey,content-type,x-client-info,range,accept-profile,prefer");
  res.setHeader("Content-Type", "application/json");
  if (req.method === "OPTIONS") { res.end(); return; }
  const url = new URL(req.url, "http://localhost");
  if (url.pathname === "/auth/v1/user") { res.end(JSON.stringify({ id: "test-user", aud: "authenticated" })); return; }
  if (url.pathname === "/rest/v1/perfiles") { res.end(JSON.stringify([{ suscripcion_activa: true, avatar_url: null }])); return; }
  if (url.pathname !== "/rest/v1/recursos") { res.statusCode = 404; res.end("{}"); return; }
  const authenticated = req.headers.authorization && req.headers.authorization !== "Bearer test-anon-key";
  const id = url.searchParams.get("id")?.replace(/^eq\./, "");
  let rows = resources.filter(resource => (!id || resource.id === id) && (authenticated || resource.id !== privateId));
  const offset = Number(url.searchParams.get("offset") || 0);
  const limit = Number(url.searchParams.get("limit") || 500);
  rows = rows.slice(offset, offset + limit);
  const select = url.searchParams.get("select");
  if (select && select !== "*") rows = rows.map(resource => Object.fromEntries(select.split(",").map(key => [key, resource[key]])));
  res.end(JSON.stringify(rows));
});
await new Promise(resolve => api.listen(0, "127.0.0.1", resolve));
const apiUrl = `http://127.0.0.1:${api.address().port}`;

let server;
let browser;
let logs = "";
const failures = [];
const html = async path => {
  const response = await fetch(`${base}${path}`, { redirect: "manual" });
  return { status: response.status, headers: response.headers, body: await response.text() };
};
const check = async (name, fn) => {
  if (process.env.SEO_CHECK_FILTER && !new RegExp(process.env.SEO_CHECK_FILTER).test(name)) return;
  try { await fn(); console.log(`PASS ${name}`); }
  catch (error) { failures.push(name); console.error(`FAIL ${name}: ${error.message}`); }
};

try {
  server = spawn(process.execPath, [path.join(appDirectory, "node_modules/next/dist/bin/next"), "dev", "--port", String(port)], {
    cwd: appDirectory, windowsHide: true,
    env: { ...process.env, NEXT_PUBLIC_SUPABASE_URL: apiUrl, NEXT_PUBLIC_SUPABASE_ANON_KEY: "test-anon-key", GOOGLE_SITE_VERIFICATION: "" },
    stdio: ["ignore", "pipe", "pipe"],
  });
  await new Promise((resolve, reject) => {
    const timeout = setTimeout(() => reject(new Error("Next startup timed out")), 90000);
    const output = chunk => { logs += chunk.toString(); if (logs.includes("Ready in")) { clearTimeout(timeout); resolve(); } };
    server.stdout.on("data", output); server.stderr.on("data", output);
    server.once("error", reject);
    server.once("exit", code => { clearTimeout(timeout); reject(new Error(`Next exited: ${code}`)); });
  });
  console.log("Local Next server ready; checking rendered HTML and HTTP responses.");
  const titles = new Set();
  for (const path of ["/", "/manual", "/recursos", "/suscripcion"]) {
    await check(`public metadata: ${path}`, async () => {
      const { status, body } = await html(path);
      assert.equal(status, 200);
      assert.equal(new URL(body.match(/<link rel="canonical" href="([^"]+)"/)?.[1]).href, new URL(path, origin).href);
      assert.equal(new URL(body.match(/<meta property="og:url" content="([^"]+)"/)?.[1]).href, new URL(path, origin).href);
      assert.ok(!body.includes('name="robots" content="noindex'));
      assert.ok(!body.includes("tu-google-verification-code"));
      const title = body.match(/<title>(.*?)<\/title>/)?.[1];
      assert.ok(title); assert.ok(!titles.has(title)); titles.add(title);
      assert.equal([...body.matchAll(/<meta name="viewport"/g)].length, 1);
      if (path === "/") {
        assert.ok(!body.includes('href="/register"'));
        for (const link of ["/recursos", "/manual", "/suscripcion"]) assert.ok(body.includes(`href="${link}"`));
        const structured = JSON.parse(body.match(/<script type="application\/ld\+json">(.*?)<\/script>/)?.[1]);
        assert.equal(structured["@type"], "WebSite");
      }
      if (path === "/recursos") assert.ok(body.includes(resources[0].titulo));
      if (path === "/suscripcion") { assert.ok(body.includes("2,99")); assert.ok(body.includes("29,99")); }
    });
  }
  for (const path of ["/auth/login", "/admin", "/registros", "/setup", "/suscripcion/gestionar"]) {
    await check(`noindex: ${path}`, async () => {
      const { body } = await html(path);
      assert.match(body, /name="robots" content="noindex, nofollow"/);
      assert.ok(!body.includes('rel="canonical"'));
    });
  }
  await check("robots and sitemap only expose public URLs", async () => {
    const robots = await html("/robots.txt"); assert.equal(robots.status, 200);
    assert.ok(robots.body.includes(`Sitemap: ${origin}/sitemap.xml`));
    assert.ok(!robots.body.includes("Disallow: /admin"));
    const sitemap = await html("/sitemap.xml"); assert.equal(sitemap.status, 200);
    for (const id of [freeId, premiumId]) assert.ok(sitemap.body.includes(`/recursos/${id}`));
    for (const path of [privateId, "/admin", "/auth", "/registros"]) assert.ok(!sitemap.body.includes(path));
  });
  await check("permanent redirects preserve destination and query", async () => {
    const legacy = await html("/register?source=home"); assert.equal(legacy.status, 308);
    assert.equal(legacy.headers.get("location"), "/auth/register?source=home");
    // Node's fetch does not reliably forward a custom Host header; use HTTP directly.
    const domain = await new Promise((resolve, reject) => {
      http.get({ hostname: "localhost", port, path: "/manual?source=test", headers: { Host: "ginergetica.com" } }, response => {
        response.resume(); resolve({ status: response.statusCode, location: response.headers.location });
      }).on("error", reject);
    });
    assert.equal(domain.status, 308); assert.equal(domain.location, `${origin}/manual?source=test`);
  });
  for (const id of [freeId, premiumId]) {
    await check(`resource metadata and server-rendered description: ${id}`, async () => {
      const { status, body } = await html(`/recursos/${id}`); assert.equal(status, 200);
      assert.ok(body.includes(`<link rel="canonical" href="${origin}/recursos/${id}"`));
      assert.ok(body.includes(`<h1>${resources.find(resource => resource.id === id).titulo}</h1>`));
      assert.ok(!body.includes("premium-secret.wav"));
    });
  }
  await check("invalid IDs return HTTP 404", async () => {
    const response = await html("/recursos/no-disponible"); assert.equal(response.status, 404);
    assert.ok(response.body.includes('content="noindex"'));
  });
  for (const id of [privateId, missingId]) await check(`non-public resource is not indexed: ${id}`, async () => {
    const { body } = await html(`/recursos/${id}`); assert.match(body, /name="robots" content="noindex, nofollow"/);
    assert.ok(!body.includes("premium-secret.wav"));
  });

  browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ reducedMotion: "reduce" });
  await context.addCookies([{ name: "cookie_consent", value: "rejected", url: base }]);
  await context.route("https://files.example.test/**", route => route.fulfill({ status: 404, body: "Test file" }));
  const page = await context.newPage();
  await check("anonymous visitors can read plans without loading PayPal", async () => {
    await page.goto(`${base}/suscripcion`);
    await page.getByRole("link", { name: "Entrar para suscribirme" }).first().waitFor();
    assert.equal(new URL(page.url()).pathname, "/suscripcion");
    assert.equal(await page.locator('script[src*="paypal.com/sdk"]').count(), 0);
  });
  await check("missing resource navigates to the real 404", async () => {
    await page.goto(`${base}/recursos/${missingId}`);
    await page.waitForURL("**/recursos/no-disponible");
    await page.getByRole("heading", { name: "Este recurso no está disponible." }).waitFor();
  });
  await check("private subscriber resource remains accessible after hydration", async () => {
    const token = `test.${Buffer.from(JSON.stringify({ exp: Math.floor(Date.now() / 1000) + 3600 })).toString("base64url")}.test`;
    await context.addInitScript(token => localStorage.setItem("sb-127-auth-token", JSON.stringify({ access_token: token, refresh_token: "test", expires_at: Math.floor(Date.now() / 1000) + 3600, expires_in: 3600, token_type: "bearer", user: { id: "test-user", aud: "authenticated" } })), token);
    await page.goto(`${base}/recursos/${privateId}`);
    await page.getByRole("heading", { name: "Práctica privada de prueba", exact: true }).waitFor();
    await page.locator("audio").waitFor({ state: "attached" });
    assert.equal(new URL(page.url()).pathname, `/recursos/${privateId}`);
  });
  assert.equal(failures.length, 0, `Failed checks: ${failures.join(", ")}`);
} catch (error) {
  console.error(error);
  console.error(logs.slice(-6000));
  process.exitCode = 1;
} finally {
  await browser?.close();
  if (server?.pid) {
    if (process.platform === "win32") spawnSync("taskkill", ["/pid", String(server.pid), "/T", "/F"], { windowsHide: true, stdio: "ignore" });
    else server.kill("SIGTERM");
  }
  api.closeAllConnections();
  await new Promise(resolve => api.close(resolve));
}
