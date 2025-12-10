/**
 * On-Demand Revalidation API Route
 * Place in: src/app/api/revalidate-seo/route.ts
 * 
 * This allows you to trigger immediate cache invalidation for SEO metadata
 * without waiting for the ISR 60-second window.
 * 
 * Usage:
 * curl -X POST https://expo360.vercel.app/api/revalidate-seo \
 *   -H "Content-Type: application/json" \
 *   -d '{"secret": "YOUR_SECRET_TOKEN"}'
 * 
 * In Vercel environment:
 * 1. Add REVALIDATE_SECRET to Environment Variables
 * 2. Deploy
 * 3. Call API after updating seo-metadata.ts
 */

import { revalidateTag, revalidatePath } from 'next/cache'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  // Get secret from environment variable
  const secret = process.env.REVALIDATE_SECRET

  try {
    // Get request body
    const body = await request.json()

    // Verify secret token
    if (!secret || body.secret !== secret) {
      return NextResponse.json(
        { error: 'Invalid or missing secret' },
        { status: 401 }
      )
    }

    // Revalidate paths
    const pathsToRevalidate = [
      '/',
      '/porque-expo360',
      '/stripe-benefits',
      '/preguntas-frecuentes',
      '/onboarding',
      '/landing',
      '/signin',
      '/expo360',
      '/sitemap.xml',
    ]

    // Revalidate all paths
    for (const path of pathsToRevalidate) {
      revalidatePath(path)
    }

    // Also revalidate by tag if used
    revalidateTag('seo-metadata')

    return NextResponse.json(
      {
        revalidated: true,
        timestamp: new Date().toISOString(),
        paths: pathsToRevalidate,
        message: 'SEO metadata cache invalidated. Pages will regenerate on next request.',
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Revalidation error:', error)
    return NextResponse.json(
      { error: 'Revalidation failed' },
      { status: 500 }
    )
  }
}

/**
 * SETUP INSTRUCTIONS:
 * 
 * 1. In Vercel Dashboard:
 *    - Go to Settings → Environment Variables
 *    - Add: REVALIDATE_SECRET = (generate a strong random string)
 *    - Redeploy
 * 
 * 2. After updating seo-metadata.ts:
 *    - Run: npm run revalidate-seo
 *    - Or manually call the API
 * 
 * 3. Check results:
 *    - Sitemap regenerates within seconds
 *    - Pages with generateMetadata() pull new content
 *    - No need to redeploy or commit changes
 * 
 * BENEFITS:
 * - Marketing can update SEO without developer involvement
 * - Changes appear within seconds, not after full build
 * - No redeployment needed
 * - Cache busting is controllable and auditable
 */
