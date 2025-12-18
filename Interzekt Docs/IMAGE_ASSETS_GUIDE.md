# 📸 Image Assets Checklist for Expo360 Landing Page

## What You Need to Provide

### 1. HERO DASHBOARD IMAGE (PRIORITY: 🔴 HIGH)
**Purpose**: Show the power of MyExpo360 platform
**Dimensions**: 1920 x 1080px
**Format**: PNG or WebP
**File Size**: Under 500KB (use compression)
**Location**: Save as `public/hero-dashboard.png`

**What to show:**
- Option A: Admin dashboard with sample data visible
- Option B: Laptop mockup showing the dashboard
- Option C: Split-screen (landing page + customer view)
- Option D: Booth experience with customer on phone

**Style**: Modern, clean, professional
**Colors**: Dark background preferred (matches design)

**Current Placeholder**: 
```
Location in code: src/app/page.tsx, line 146
Placeholder text: "Hero Image / Dashboard Preview"
Replace with actual image in <Image> component or background
```

---

### 2. COMPANY LOGOS (PRIORITY: 🟡 MEDIUM)
**Purpose**: Social proof - "Trusted by companies"
**Quantity**: 3-4 logos
**Dimensions**: 200 x 100px each
**Format**: PNG with transparency (no white background)
**File Size**: 20-50KB each
**Location**: Save to `public/logos/` folder

**What companies to use:**
- Your existing clients/customers
- Partner companies
- Featured brands using Expo360
- If none available, use placeholder brand logos

**Style Requirements:**
- Grayscale/Black (colored versions will be desaturated at 60% opacity)
- High resolution (min 2x size for retina displays)
- Logo should be on transparent background
- No website text, just the mark/logo

**Suggested names:**
- `company-a.png`
- `company-b.png`
- `company-c.png`
- `company-d.png`

**Current Placeholder**:
```
Location in code: src/app/page.tsx, line 730
Shows: ['Company A', 'Company B', 'Company C', 'Company D']
Replace with actual logo images in <Image> components
```

---

## How to Add Images to the Landing Page

### For Hero Image:

1. Save your dashboard image to: `public/hero-dashboard.png`

2. In `src/app/page.tsx`, find the hero image section (around line 146)

3. Replace the placeholder with:
```tsx
<Image
  src="/hero-dashboard.png"
  alt="Expo360 MyExpo360 Admin Dashboard"
  width={1920}
  height={1080}
  priority
  className="w-full h-auto rounded-xl"
/>
```

Or use as background image:
```tsx
<div 
  className="w-full h-full bg-cover bg-center rounded-xl"
  style={{ backgroundImage: 'url(/hero-dashboard.png)' }}
/>
```

### For Company Logos:

1. Create folder: `public/logos/`
2. Save 4 logos as:
   - `public/logos/company-a.png`
   - `public/logos/company-b.png`
   - `public/logos/company-c.png`
   - `public/logos/company-d.png`

3. In `src/app/page.tsx`, find the social proof section (around line 730)

4. Replace:
```tsx
{['Company A', 'Company B', 'Company C', 'Company D'].map((company, idx) => (
  <div key={idx} className="text-gray-400 font-semibold text-lg">
    {company}
  </div>
))}
```

With:
```tsx
{[
  { name: 'Company A', logo: '/logos/company-a.png' },
  { name: 'Company B', logo: '/logos/company-b.png' },
  { name: 'Company C', logo: '/logos/company-c.png' },
  { name: 'Company D', logo: '/logos/company-d.png' }
].map((company, idx) => (
  <div key={idx} className="opacity-60 grayscale hover:grayscale-0 transition">
    <Image
      src={company.logo}
      alt={company.name}
      width={200}
      height={100}
      className="h-10 w-auto"
    />
  </div>
))}
```

---

## Image Optimization Tips

### Before uploading:
1. **Compress images**: Use https://tinypng.com or similar
   - Hero image: Aim for < 500KB
   - Logos: Aim for < 50KB each

2. **Use modern formats**: WebP instead of PNG (if supported)
   ```tsx
   src="/hero-dashboard.webp"
   // Or use multiple formats:
   <picture>
     <source srcSet="/image.webp" type="image/webp" />
     <img src="/image.png" alt="..." />
   </picture>
   ```

3. **Responsive images**: Use `srcSet` for different screen sizes
   ```tsx
   src="/hero-dashboard.png"
   srcSet="/hero-dashboard-sm.png 640w, /hero-dashboard.png 1920w"
   ```

### Next.js Image optimization:
The page uses Next.js `<Image>` component which automatically:
- Optimizes on-the-fly
- Serves correct size for device
- Lazy-loads below the fold
- No cumulative layout shift (CLS)

---

## Budget-Friendly Image Solutions

### If you don't have company logos:
1. **Use placeholder logos** (temporarily)
   - Figma logo, Stripe logo, etc.
   - Later update with real customers

2. **Generic placeholder**:
   - Simple circles with initials
   - Company name in text
   - Update when real logos available

### If you don't have dashboard screenshot:
1. **Use a mockup**:
   - Figma mockup of expected dashboard
   - Laptop mockup with placeholder
   - Design a clean hero illustration

2. **Video as background** (optional):
   - Auto-playing background video of dashboard
   - Set `muted` and `autoPlay` attributes
   - Falls back to static image

3. **Placeholder with branding**:
   - Your logo + headline
   - Gradient background
   - "Dashboard Preview Coming Soon"

---

## File Structure After Adding Images

```
public/
├── hero-dashboard.png          (1920x1080px)
├── hero-dashboard.webp         (optional, optimized)
├── logos/
│   ├── company-a.png           (200x100px)
│   ├── company-b.png           (200x100px)
│   ├── company-c.png           (200x100px)
│   └── company-d.png           (200x100px)
├── expo360_logo.png            (existing)
├── interzekt_logo_...          (existing)
└── ... (other existing files)
```

---

## Testing Your Images

After adding images:

1. **Local testing**:
   ```bash
   npm run dev
   # Visit http://localhost:3000
   # Check if images load correctly
   ```

2. **Production build test**:
   ```bash
   npm run build
   npm run start
   # Verify images still load
   ```

3. **Lighthouse audit**:
   - Open DevTools → Lighthouse
   - Check "Performance" score
   - Target: 90+ for images
   - Goal: Fast page load

4. **Mobile testing**:
   - Test on real phone
   - Check image sizes look good
   - Verify responsive behavior

---

## Image Requirements Summary Table

| Asset | Size | Format | Location | Priority |
|-------|------|--------|----------|----------|
| Hero Dashboard | 1920x1080 | PNG/WebP | public/ | 🔴 HIGH |
| Company Logo A | 200x100 | PNG | public/logos/ | 🟡 MEDIUM |
| Company Logo B | 200x100 | PNG | public/logos/ | 🟡 MEDIUM |
| Company Logo C | 200x100 | PNG | public/logos/ | 🟡 MEDIUM |
| Company Logo D | 200x100 | PNG | public/logos/ | 🟡 MEDIUM |

---

## Questions About Image Specs?

Check these resources:
- **Next.js Image docs**: https://nextjs.org/docs/app/api-reference/components/image
- **Image compression**: https://tinypng.com
- **Image mockups**: https://figma.com or https://mockup.cssninja.io

---

**Note**: The page will work without these images (showing placeholders), but it will look significantly better with high-quality visuals. 

**Suggested timeline**:
- Get hero dashboard image ready within 1 week
- Add company logos within 2 weeks
- Everything should be live within 1 month

Good luck! 🚀
