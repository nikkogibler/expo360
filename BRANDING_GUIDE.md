# Expo360 Branding Guide

## Logo Specifications

### Current Assets

#### 1. **Primary Logo: `logo.png`**
- **Dimensions:** 1500 x 500 pixels (3:1 aspect ratio)
- **Format:** PNG with RGBA (8-bit/color with transparency)
- **File Size:** ~221 KB
- **Type:** Horizontal lockup (logo with text)
- **Best Use:** Hero sections, main headers, marketing materials
- **Color:** Full color
- **Transparency:** Yes (RGBA)

#### 2. **Secondary Logo: `expo360.png`**
- **Dimensions:** 1500 x 500 pixels (3:1 aspect ratio)
- **Format:** PNG with RGBA (8-bit/color with transparency)
- **File Size:** ~540 KB
- **Type:** Horizontal lockup (logo with text)
- **Best Use:** Header navigation, onboarding, wizard
- **Color:** Full color
- **Transparency:** Yes (RGBA)

---

## Customer Logo Upload Specifications

### Onboarding Wizard - Step 2: Company Information

**Ideal Dimensions for Customer Logos:**
- **Width:** 1500 pixels
- **Height:** 500 pixels
- **Aspect Ratio:** 3:1 (horizontal lockup)
- **Format:** PNG or WEBP with transparency (RGBA)
- **Maximum File Size:** 500 KB
- **Color Space:** sRGB

**Why These Specifications?**
- Scalable to all breakpoints without loss of quality
- Transparent background allows flexible placement on any color
- Consistent with Expo360 brand logo dimensions
- 500 KB limit ensures fast loading across all devices
- PNG and WEBP support modern browser standards

**Upload Instructions for Customers:**
1. Prepare your logo in the recommended dimensions (1500 × 500 px)
2. Export as transparent PNG or WEBP
3. Ensure file size is under 500 KB
4. Upload via the wizard on Step 2

---

## Favicon Upload Specifications

### Onboarding Wizard - Step 3: Design Studio

**Ideal Dimensions for Favicon:**
- **Width:** 32 pixels
- **Height:** 32 pixels
- **Aspect Ratio:** 1:1 (square)
- **Format:** PNG, ICO, or WEBP
- **Color Space:** Any (auto-converted to compatible format)

**Favicon Standards:**
- Automatically placed at `/favicon.ico`
- Used in browser tabs, bookmarks, and history
- Displayed in address bar and browser UI
- Can be extracted from main logo for consistency

---

## Logo Usage Guidelines

### Recommended Sizing for Different Contexts

| Context | Width | Height | Aspect Ratio | Example |
|---------|-------|--------|--------------|---------|
| **Header/Navigation** | 120-160px | 45-60px | Auto (2.67:1) | App header, navigation bar |
| **Hero Section** | 300-400px | 112-150px | Auto (2.67:1) | Landing page, build wizard |
| **Favicon** | 32x32px | 32x32px | 1:1 | Browser tab (requires separate icon) |
| **Mobile Header** | 100-120px | 37-45px | Auto (2.67:1) | Mobile navigation |
| **Footer** | 80-120px | 30-45px | Auto (2.67:1) | Page footer |
| **Admin Dashboard** | 150-180px | 56-67px | Auto (2.67:1) | Dashboard header |
| **Email Header** | 200-240px | 75-90px | Auto (2.67:1) | Email templates |

---

## Implementation Examples

### Next.js Image Component Usage

```tsx
// Hero Section - Large
<Image
  src="/logo.png"
  alt="Expo360"
  width={400}
  height={150}
  priority
  className="object-contain"
/>

// Header Navigation - Medium
<Image
  src="/expo360.png"
  alt="Expo360"
  width={140}
  height={53}
  className="object-contain"
/>

// Mobile Header - Small
<Image
  src="/expo360.png"
  alt="Expo360"
  width={110}
  height={41}
  className="object-contain"
/>

// Footer - Extra Small
<Image
  src="/expo360.png"
  alt="Expo360"
  width={100}
  height={37}
  className="object-contain"
/>
```

### Tailwind CSS Sizing Classes

```tsx
// Using Tailwind with responsive sizing
<Image
  src="/expo360.png"
  alt="Expo360"
  width={140}
  height={53}
  className="w-32 md:w-40 lg:w-48 object-contain"
/>
```

---

## Color Specifications

### Primary Brand Colors

| Color | Hex Code | RGB | Use Case |
|-------|----------|-----|----------|
| **Primary Blue** | `#3B82F6` | 59, 130, 246 | Buttons, links, highlights |
| **Secondary Green** | `#10B981` | 16, 185, 129 | Success states, accents |
| **Dark Gray** | `#1F2937` | 31, 41, 55 | Text, backgrounds |
| **Light Gray** | `#F3F4F6` | 243, 244, 246 | Backgrounds, borders |

### Logo Color Usage

- **Primary**: Full color (as designed in PNG)
- **Transparency**: RGBA background allows overlay on colored sections
- **White Background**: Works on dark backgrounds
- **Dark Background**: Use with white or light gray backgrounds for contrast

---

## Current Implementation Locations

### BuildWizard Component (`src/components/BuildWizard.tsx`)

```tsx
// Current sizing:
<Image
  src="/expo360.png"
  alt="Expo360"
  width={40}
  height={40}
  className="object-contain"
/>
```

**Recommendation:** Increase to **120-140px width** for better visibility in header.

---

## Best Practices

✅ **Do:**
- Use full-color logo on light backgrounds
- Maintain aspect ratio (≈2.67:1)
- Provide sufficient whitespace around logo (minimum 20px)
- Use RGBA transparency for flexible backgrounds
- Scale logo proportionally

❌ **Don't:**
- Distort or stretch the logo
- Change colors without brand approval
- Use logo smaller than 100px width in headers
- Place logo on patterned backgrounds without contrast testing
- Rotate or skew the logo

---

## File Location Reference

All logo files are stored in:
```
expo360-template-app/public/
├── logo.png (1536 x 576 - Primary)
├── expo360.png (1348 x 582 - Secondary)
└── favicon.png (for browser tabs)
```

---

## Next Steps

1. **Create Icon-Only Variant** (optional)
   - Square format (1:1 ratio)
   - For app icons, favicons, avatars
   - Recommended: 512x512px or 256x256px

2. **Create Horizontal Logo Variants** (optional)
   - Left-aligned text (for left sidebars)
   - Centered (for hero sections)
   - Right-aligned (for RTL languages)

3. **Create Monochrome Variants** (optional)
   - White version (for dark backgrounds)
   - Black version (for light backgrounds)
   - For print and accessibility

---

## Accessibility Notes

- Both PNG files have transparent backgrounds (RGBA)
- Use sufficient contrast ratio (min 4.5:1) for text
- Always provide descriptive alt text: `alt="Expo360"`
- Test logo readability on different background colors
- Consider color-blind friendly variations if needed

---

*Last Updated: November 6, 2025*
