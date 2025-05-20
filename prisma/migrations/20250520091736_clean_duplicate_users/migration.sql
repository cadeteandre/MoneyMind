-- Primeiro, adicionamos uma coluna para marcar os registros
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "is_duplicate" BOOLEAN DEFAULT FALSE;

-- Marcamos os registros duplicados (exceto o mais recente)
WITH DuplicateUsers AS (
  SELECT 
    email,
    MAX(id) as latest_id
  FROM "User"
  GROUP BY email
  HAVING COUNT(*) > 1
)
UPDATE "User"
SET "is_duplicate" = TRUE
WHERE id NOT IN (
  SELECT latest_id FROM DuplicateUsers
)
AND email IN (
  SELECT email FROM DuplicateUsers
);

-- Agora podemos remover com segurança os registros marcados
DELETE FROM "User"
WHERE "is_duplicate" = TRUE;

-- Por fim, removemos a coluna de marcação
ALTER TABLE "User" DROP COLUMN "is_duplicate"; 