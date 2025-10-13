# Edit Product Variables Fix

## Issue
In the admin catalog's "Editar Producto" (Edit Product) section, admins were seeing only a text write-out of currently selected telas (fabrics) and estructura (structure) options, but couldn't see checkboxes to select or deselect variables.

## Root Cause
The checkbox UI was already properly implemented in the code, but the variables (`availableFabricColors` and `availableFinishes`) were not being loaded when the edit product modal opened. The `reloadVariables()` function was only being called when the "Add Product" modal opened, not the "Edit Product" modal.

## Solution
Added a `useEffect` hook that calls `reloadVariables()` when `showEditProductModal` state changes to `true`. This ensures that the available fabric colors and structure finishes are fetched from the `global_product_options` table whenever the edit modal opens.

### Code Change
**File:** `src/app/admin/catalogo/page.tsx`

**Location:** After the existing useEffect for `showAddProductModal` (around line 1150)

**Added:**
```tsx
// Load available variables when edit modal opens
useEffect(() => {
  if (showEditProductModal) {
    reloadVariables();
  }
}, [showEditProductModal]);
```

## Functionality
Now when an admin opens the "Editar Producto" modal:

1. **Telas (Fabrics)**: 
   - Shows all available fabric color options as checkboxes
   - Previously selected fabrics are checked
   - Admin can check/uncheck to add or remove fabric options
   - Only shows when "Aplica Color de Tela" checkbox is enabled

2. **Estructuras (Structure Finishes)**:
   - Shows all available frame finish options as checkboxes
   - Previously selected finishes are checked
   - Admin can check/uncheck to add or remove finish options
   - Always visible

3. **Visual Feedback**:
   - Shows count of currently selected items above each section
   - Hover effects on checkbox options
   - Grid layout for easy scanning

## Testing
To test the fix:
1. Go to `/admin/catalogo`
2. Click on a product card to edit it
3. Verify that checkboxes appear for both "Colores de Tela Disponibles" and "Acabados de Estructura Disponibles"
4. Verify that currently selected options are checked
5. Toggle checkboxes to add/remove options
6. Save the product and verify changes persist

## Related Files
- `src/app/admin/catalogo/page.tsx` - Main catalog admin page with edit functionality

## Date
January 13, 2025
