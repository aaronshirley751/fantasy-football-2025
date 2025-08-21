-- Check current leagues table structure and data
SELECT 
  column_name, 
  data_type, 
  is_nullable, 
  column_default
FROM information_schema.columns 
WHERE table_name = 'leagues'
ORDER BY ordinal_position;

-- Check current league data
SELECT * FROM leagues WHERE id = 'd06f0672-2848-4b5d-86f5-9ab559605b4f';

-- Check all leagues
SELECT * FROM leagues;
