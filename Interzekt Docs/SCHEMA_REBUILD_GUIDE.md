# Rebuilt Schema - RLS Multi-Tenant Architecture

## Overview
Schema rebuilt from scratch with all-text IDs to eliminate PostgreSQL type casting issues in RLS policies. Full tenant isolation via Row Level Security.

## Key Changes
- **All IDs are now TEXT** (generated from `gen_random_uuid()::text`)
- **Foreign Keys removed** - referential integrity managed through RLS policies and application logic
- **Simplified RLS policies** - separate policies for service_role, JWT claims, and user mappings
- **Auth method**: `(SELECT auth.uid())::text` for proper type casting in RLS context

## Table Structure

### clients
Root tenant table
```
id (text PK)          - Tenant identifier
slug (text UNIQUE)    - URL-friendly tenant slug
name (text)           - Display name
theme (jsonb)         - Theme configuration
env_overrides (jsonb) - Environment overrides
metadata (jsonb)      - Arbitrary data
created_at (timestamptz)
```

### user_clients
Maps users to tenants (multi-tenant admin access)
```
user_id (text)     - Supabase auth.uid()
client_id (text)   - Reference to clients.id
created_at (timestamptz)
PK: (user_id, client_id)
```

### products
Per-tenant product catalog
```
id (text PK)
client_id (text)   - Tenant reference
sku (text)
name (text)
description (text)
price (numeric)
image_url (text)
is_active (boolean)
metadata (jsonb)
created_at (timestamptz)
updated_at (timestamptz)
```

### variable_types
Per-tenant variable configuration
```
id (text PK)
client_id (text)   - Tenant reference
key (text)         - Variable key (e.g., 'color', 'size')
label (text)       - Display label
metadata (jsonb)
created_at (timestamptz)
```

### variable_values
Variable value options per variable_type
```
id (text PK)
variable_type_id (text)  - Reference to variable_types.id
value (text)             - Value string
metadata (jsonb)
created_at (timestamptz)
```

### customers
Per-tenant customer data
```
id (text PK)
client_id (text)   - Tenant reference
name (text)
created_at (timestamptz)
```

## RLS Policy Architecture

### Access Control Hierarchy (in priority order)
1. **service_role** - Unrestricted access (for admin/system operations)
2. **JWT claims** - `current_setting('jwt.claims.client_id', true)` equals row client_id
3. **User mappings** - User exists in user_clients table for the tenant

### Policy Pattern
Each table has 3 policies:
- `{table}_service` - Unrestricted for service_role
- `{table}_jwt` - JWT-based tenant access
- `{table}_user_mapped` - User-mapped tenant access

### Key Implementation
All `auth.uid()` calls wrapped in subselect for type safety:
```sql
(SELECT auth.uid())::text
```

## Usage Examples

### Insert with proper tenant context
```sql
-- As authenticated user with JWT claim containing tenant ID
INSERT INTO public.products (id, client_id, sku, name)
VALUES (gen_random_uuid()::text, current_setting('jwt.claims.client_id', true), 'SKU-001', 'Product Name');
```

### Query with automatic tenant filtering
```sql
-- RLS automatically filters by JWT tenant or user mapping
SELECT id, name, sku FROM public.products;
-- Returns only products for the user's tenant(s)
```

### Service role bypass (admin operations)
```sql
-- Service role sees all data across all tenants
SET ROLE service_role;
SELECT COUNT(*) as total_products FROM public.products;
```

### User tenant mapping
```sql
-- Grant user access to a tenant
INSERT INTO public.user_clients (user_id, client_id)
VALUES ('user-uuid', 'tenant-uuid');
```

## Migration Files
- `6_rebuild_schema_clean.sql` - Initial failed attempt (uuid PKs)
- `7_rebuild_all_text_ids.sql` - **WORKING** - All text IDs with proper RLS
- `8_validate_rls.sql` - RLS validation test suite

## Testing RLS
See `8_validate_rls.sql` for comprehensive test cases covering:
- Single tenant data isolation
- Service role unrestricted access
- User-only access control
- INSERT/UPDATE/DELETE restrictions
- Nested RLS (variable_values through variable_types)

## Notes
- No traditional foreign keys - referential integrity relies on RLS + application logic
- All UUID generation still uses `gen_random_uuid()` but stored as text
- JWT must contain `client_id` claim for JWT-based access control
- user_clients table enables per-user tenant assignment (different from JWT-based access)

## Troubleshooting

**Error: "operator does not exist: text = uuid"**
- Ensure all `auth.uid()` calls are wrapped: `(SELECT auth.uid())::text`
- Avoid mixing uuid and text comparisons in WHERE clauses

**User can't see any data**
- Verify user has entry in `user_clients` table for their tenant, OR
- Verify JWT includes `client_id` claim with correct tenant ID

**Data appearing across tenants**
- Check RLS policies are enabled: `ALTER TABLE {table} ENABLE ROW LEVEL SECURITY;`
- Verify no unrestricted policies accidentally created

## Future Improvements
1. Add soft-delete support (deleted_at timestamps)
2. Add audit logging tables
3. Implement row versioning for data history
4. Add cascading delete triggers (currently managed by app)
