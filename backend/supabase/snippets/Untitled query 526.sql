-- Count pockets by folder
SELECT pf.name as folder_name, COUNT(p.id) as pocket_count
FROM pocket_folders pf
LEFT JOIN pockets p ON p.folder_id = pf.id
WHERE pf.owner_id = '4c81c558-2705-465c-b85e-3687c2bbe962'
GROUP BY pf.name;

-- Show all pockets with their folders and roles
SELECT 
  p.name as pocket_name,
  pf.name as folder_name,
  r.name as role_name,
  p.is_inbox,
  p.color,
  p.tags
FROM pockets p
LEFT JOIN pocket_folders pf ON p.folder_id = pf.id
LEFT JOIN feeds f ON f.pocket_id = p.id
LEFT JOIN roles r ON f.role_id = r.id
WHERE p.owner_id = '4c81c558-2705-465c-b85e-3687c2bbe962'
ORDER BY pf.name, p.name;

-- Show feeds with their card counts
SELECT 
  p.name as pocket_name,
  jsonb_array_length(f.cards) as card_count,
  f.dsl_version
FROM feeds f
JOIN pockets p ON f.pocket_id = p.id
WHERE p.owner_id = '4c81c558-2705-465c-b85e-3687c2bbe962';

-- Show desks
SELECT 
  p.name as pocket_name,
  d.name as desk_name,
  d.created_at
FROM desks d
JOIN pockets p ON d.pocket_id = p.id
WHERE p.owner_id = '4c81c558-2705-465c-b85e-3687c2bbe962';

-- Show generators
SELECT name, trigger_type, trigger_config, is_active
FROM generators
WHERE owner_id = '4c81c558-2705-465c-b85e-3687c2bbe962';

-- Show files in vault
SELECT f.name, f.mime_type, f.size, v.name as vault_name
FROM files f
JOIN vaults v ON f.vault_id = v.id
WHERE v.owner_id = '4c81c558-2705-465c-b85e-3687c2bbe962';