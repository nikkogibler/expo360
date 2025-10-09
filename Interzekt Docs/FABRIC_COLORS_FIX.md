# Fabric Colors Bug Fix

## Problem
When adding a new product in the admin panel, selecting fabric colors did not populate the `available_fabric_colors` field in the database. This caused the fabric color options to not appear on the product detail page, even when "Aplica Color de Tela" was enabled.

## Root Cause
The issue was in the product creation form state management and database insertion logic:

1. **Wrong Field Mapping**: The fabric color selections in the UI were being stored in `estructuras_disponibles` instead of a dedicated field
2. **Empty Array on Save**: The `available_fabric_colors` field was being set to an empty array `[]` instead of the selected fabric color names
3. **Missing State Field**: There was no separate state field to track selected fabric colors

## Solution

### 1. Added New State Field
Added `colores_tela_disponibles` to track selected fabric colors separately from structure/frame colors:

```typescript
const [newProduct, setNewProduct] = useState({
  // ... other fields
  estructuras_disponibles: [] as string[], // Legacy field for structure names
  colores_tela_disponibles: [] as string[], // NEW: Fabric color names
  colores_estructura_disponibles: [] as string[], // Frame finish names
  // ... other fields
});
```

### 2. Updated UI Checkbox Logic
Changed the fabric color checkboxes to update the correct field:

**Before:**
```typescript
checked={newProduct.estructuras_disponibles.includes(fabric.name)}
onChange={(e) => {
  // Updates estructuras_disponibles - WRONG!
}}
```

**After:**
```typescript
checked={newProduct.colores_tela_disponibles.includes(fabric.name)}
onChange={(e) => {
  // Updates colores_tela_disponibles - CORRECT!
}}
```

### 3. Fixed Database Insertion
Updated the product insertion to use the selected fabric colors:

**Before:**
```typescript
available_fabric_colors: newProduct.aplica_color_tela ? [] : null, // Always empty!
```

**After:**
```typescript
available_fabric_colors: newProduct.colores_tela_disponibles.length > 0 
  ? newProduct.colores_tela_disponibles 
  : null,
```

### 4. Updated has_fabric_colors Logic
Made the flag conditional on both the checkbox AND having selected colors:

**Before:**
```typescript
has_fabric_colors: !!newProduct.aplica_color_tela,
```

**After:**
```typescript
has_fabric_colors: !!newProduct.aplica_color_tela && newProduct.colores_tela_disponibles.length > 0,
```

## Database Schema
The products table uses these fields:
- `available_fabric_colors`: `string[]` - Array of fabric color names
- `available_frame_finishes`: `string[]` - Array of frame finish names
- `has_fabric_colors`: `boolean` - Whether product supports fabric colors
- `has_frame_finish`: `boolean` - Whether product supports frame finishes

## Testing
To verify the fix:
1. Go to Admin → Catálogo
2. Click "Añadir Producto Nuevo"
3. Fill in product details
4. Select fabric colors from "Colores de Tela Disponibles"
5. Enable "Aplica Color de Tela" checkbox
6. Save the product
7. View the product on the customer-facing catalog page
8. Verify fabric color options appear correctly

## Related Files
- `/src/app/admin/catalogo/page.tsx` - Admin product creation form
- `/src/app/kusam/catalogo/[sku]/page.tsx` - Product detail page that displays fabric options

## Date
Fixed: October 7, 2025
