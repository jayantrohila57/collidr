export default function McpHomePage() {
  return (
    <main style={{ fontFamily: "system-ui", padding: "2rem" }}>
      <h1>Collidr MCP</h1>
      <p>
        Remote MCP endpoint: <code>POST /api/mcp</code> (OAuth Bearer token from{" "}
        <code>apps/auth</code>).
      </p>
    </main>
  );
}
