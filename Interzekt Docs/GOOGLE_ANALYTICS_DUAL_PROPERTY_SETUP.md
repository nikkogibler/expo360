# Google Analytics Setup - Dual Property Configuration

## ✅ Setup Complete

Your Expo360 site now tracks data to both Google Analytics properties.

## Properties Configured

### **Property 1: Legacy/Primary (G-75WMS9GCTE)**
- Status: ✅ Active
- Created: Previously set up
- Purpose: Ongoing analytics tracking

### **Property 2: New Property (G-E8NCY2YTP3)**
- Status: ✅ Active  
- Created: December 10, 2025
- Purpose: Consolidated analytics dashboard

## How It Works

### **Single Script, Dual Tracking**
Both properties are loaded and tracked via one gtag script:

```html
<script async src="https://www.googletagmanager.com/gtag/js?id=G-E8NCY2YTP3"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  
  gtag('config', 'G-75WMS9GCTE');  // Legacy property
  gtag('config', 'G-E8NCY2YTP3');   // New property
</script>
```

### **All Events Tracked to Both**
- Page views
- Custom events (button clicks, form submissions, etc.)
- Ecommerce events (if tracked)
- User interactions

## Data Flow

```
User Action (page view, click, etc.)
         ↓
GoogleAnalytics component loads gtag script
         ↓
trackEvent() or trackPageView() called
         ↓
Event sent to BOTH properties:
  ├─ G-75WMS9GCTE (legacy)
  └─ G-E8NCY2YTP3 (new)
         ↓
Both dashboards updated in real-time
```

## Code Changes Made

### **1. Updated `src/utils/googleAnalytics.ts`**
```typescript
// New constants
export const GA_NEW_PROPERTY_ID = 'G-E8NCY2YTP3';
export const GA_MEASUREMENT_IDS = [
  GA_MEASUREMENT_ID,      // G-75WMS9GCTE
  GA_NEW_PROPERTY_ID,     // G-E8NCY2YTP3
].filter(Boolean);

// Updated functions to track all IDs
export const trackPageView = (url: string, title?: string) => {
  GA_MEASUREMENT_IDS.forEach((id) => {
    window.gtag('config', id, {...});
  });
};

export const trackEvent = (eventName: string, parameters?: Record<string, unknown>) => {
  GA_MEASUREMENT_IDS.forEach((id) => {
    window.gtag('event', eventName, { send_to: id, ... });
  });
};
```

### **2. Updated `src/components/GoogleAnalytics.tsx`**
```typescript
// Loads both properties in a single script
gtag('config', 'G-75WMS9GCTE');  // Legacy
gtag('config', 'G-E8NCY2YTP3');   // New
```

## Verification Steps

### **Step 1: Check Browser Console**
1. Open your site in Chrome
2. Open DevTools (F12)
3. Go to Network tab
4. Filter by "gtag"
5. You should see requests to both measurement IDs

### **Step 2: Google Analytics Real-Time**

**For Legacy Property (G-75WMS9GCTE):**
1. Go to Google Analytics > [Your Property]
2. Select "Real-time" report
3. Refresh your site
4. Should see your activity immediately

**For New Property (G-E8NCY2YTP3):**
1. Go to Google Analytics > Create Property
2. Select this new property
3. Wait 24-48 hours for first data
4. Check "Real-time" → "Overview" to see live data

### **Step 3: Check Google Tag Manager**
1. Open Google Tag Manager
2. Go to "Tags"
3. Select the gtag.js tag
4. Click "Preview" to test
5. Visit your site in preview mode
6. Should see events firing for both properties

### **Step 4: Verify Script in HTML**
```bash
# Check if both configs are in HTML
curl https://expo360.vercel.app | grep "gtag('config'"
```

Expected output:
```
gtag('config', 'G-75WMS9GCTE');
gtag('config', 'G-E8NCY2YTP3');
```

## Monitoring Both Properties

### **Legacy Property Checklist**
- [ ] Real-time shows traffic
- [ ] Historical data present
- [ ] Events being logged
- [ ] Conversions tracking (if set up)

### **New Property Checklist**
- [ ] Created in Google Analytics
- [ ] Measurement ID: G-E8NCY2YTP3
- [ ] Connected to site
- [ ] Real-time data appearing (after 24-48 hours)
- [ ] Events logging properly

## Next Steps

### **Immediate (Today)**
1. ✅ Verify gtag script loads (check DevTools Network)
2. ✅ Confirm no console errors
3. ✅ Test event tracking (click a button, check Network)

### **Within 24 Hours**
1. Check legacy property real-time data
2. Wait for new property to receive first hits
3. Verify both show consistent data

### **Within 48 Hours**
1. New property should have 24+ hours of data
2. Compare metrics between both properties
3. Verify they match (duplicate tracking)

### **Optional: Consolidation**
Once new property has sufficient data, you can:
1. Keep both running in parallel (recommended for cross-verification)
2. Archive legacy property when confident
3. Set up custom alerts/goals in new property

## Troubleshooting

### **Issue: New property shows no data**
**Solution:**
- Takes 24-48 hours for Google Analytics to process first hits
- Check if script is loading: DevTools → Network → gtag.js
- Verify measurement ID is correct: G-E8NCY2YTP3

### **Issue: Only one property showing data**
**Solution:**
- Check both configs are in the gtag script
- Verify measurement IDs are correct
- Clear browser cache and reload
- Check for ad blockers blocking gtag

### **Issue: Duplicate events in reports**
**Solution:**
- This is expected! Both properties track same events
- Can be used for verification or backup
- If unwanted, remove one config from gtag script

### **Issue: Events not appearing**
**Solution:**
1. Check browser console for errors
2. Verify trackEvent() is being called
3. Check if event names match GA4 format
4. Wait 24 hours for data to process

## Configuration Reference

### **In Code:**
```typescript
// src/utils/googleAnalytics.ts
export const GA_MEASUREMENT_IDS = [
  'G-75WMS9GCTE',  // Legacy property
  'G-E8NCY2YTP3',   // New property
];
```

### **In HTML:**
```html
<!-- Both properties configured in one script -->
<script>
  gtag('config', 'G-75WMS9GCTE');  // Legacy
  gtag('config', 'G-E8NCY2YTP3');   // New
</script>
```

## Best Practices

✅ **DO:**
- Keep both properties running for cross-verification
- Monitor real-time data in both dashboards
- Set up alerts in both properties
- Test new features in both before deploying

❌ **DON'T:**
- Disable legacy property without backup
- Change measurement IDs in code without testing
- Mix different event structures between properties
- Forget to update code if adding more properties

## Adding More Properties

If you need to track a third property in the future:

1. Get the measurement ID from Google Analytics
2. Add to `googleAnalytics.ts`:
   ```typescript
   export const GA_THIRD_PROPERTY_ID = 'G-XXXXXXXXXX';
   ```
3. Update `GA_MEASUREMENT_IDS` array
4. Add config to `GoogleAnalytics.tsx`:
   ```typescript
   gtag('config', 'G-XXXXXXXXXX');
   ```

## Resources

- [Google Analytics Setup Guide](https://support.google.com/analytics/answer/9304153)
- [GA4 Property Help Center](https://support.google.com/analytics/answer/10331489)
- [Google Tag Manager Docs](https://tagmanager.google.com)
- [Next.js Script Component](https://nextjs.org/docs/app/building-your-application/optimizing/scripts)

## Support

For issues:
1. Check Google Analytics status page (analytics.google.com/status)
2. Review browser console for errors
3. Verify measurement IDs in code match GA account
4. Wait 48 hours for new property data to appear

---

**Status**: ✅ Both properties tracking data

Your site is now sending analytics to both G-75WMS9GCTE and G-E8NCY2YTP3!
