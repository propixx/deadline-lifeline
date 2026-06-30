const baseUrl = process.env.SMOKE_URL || "http://localhost:8787";

async function assertOk(path, init) {
  const response = await fetch(`${baseUrl}${path}`, init);
  if (!response.ok) {
    throw new Error(`${path} returned ${response.status}`);
  }
  return response;
}

await assertOk("/api/health");
await assertOk("/api/tasks");
await assertOk("/api/plan", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ userMessage: "Smoke test the planning endpoint." })
});

console.log(`Smoke test passed for ${baseUrl}`);
