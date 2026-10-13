-- Idempotent: rename OAuth client display names from Env Manager branding to Collidr.
-- Review and run manually against production (do not apply from CI/agents).
--
-- Affected column: oauth_client.name (client metadata / consent UI).
-- Does not change client_id, secrets, or redirect URIs.

BEGIN;

UPDATE oauth_client
SET
  name = 'Collidr',
  updated_at = COALESCE(updated_at, NOW())
WHERE
  name IS NOT NULL
  AND (
    name ILIKE '%Env Manager%'
    OR name ILIKE '%env-manager%'
    OR name ILIKE '%EnvManager%'
  )
  AND name IS DISTINCT FROM 'Collidr';

-- Optional: MCP server-style client names
UPDATE oauth_client
SET
  name = REPLACE(name, 'env-manager-mcp', 'collidr-mcp'),
  updated_at = COALESCE(updated_at, NOW())
WHERE
  name ILIKE '%env-manager-mcp%'
  AND name NOT ILIKE '%collidr-mcp%';

UPDATE oauth_client
SET
  name = REPLACE(name, 'Env Manager MCP', 'Collidr MCP'),
  updated_at = COALESCE(updated_at, NOW())
WHERE
  name ILIKE '%Env Manager MCP%'
  AND name NOT ILIKE '%Collidr MCP%';

COMMIT;
