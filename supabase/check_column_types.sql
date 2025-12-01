-- Check actual column types in database
SELECT 
  table_name,
  column_name,
  data_type
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name IN ('clients', 'products', 'customers', 'variable_types', 'variable_values', 'user_clients')
  AND column_name IN ('id', 'user_id', 'client_id', 'variable_type_id')
ORDER BY table_name, column_name;
