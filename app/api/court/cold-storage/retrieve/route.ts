import { type NextRequest, NextResponse } from 'next/server'
import { get } from '@vercel/blob'

/**
 * Cold Storage Retrieval — streams a Tier 2 evidence bundle back from PRIVATE
 * Vercel Blob object storage. The bundle bytes live off local disk; this route
 * is the controlled read path. Case: CUD-26-682107.
 *
 * NOTE: private blob URLs are never exposed to the client. Retrieval always
 * goes through this server route by pathname.
 */
export async function GET(request: NextRequest) {
  const pathname = request.nextUrl.searchParams.get('pathname')
  if (!pathname) {
    return NextResponse.json({ ok: false, error: 'Missing pathname' }, { status: 400 })
  }

  // Restrict retrieval to this case's cold-storage namespace.
  if (!pathname.startsWith('cold-storage/CUD-26-682107/')) {
    return NextResponse.json({ ok: false, error: 'Forbidden pathname' }, { status: 403 })
  }

  try {
    const result = await get(pathname, {
      access: 'private',
      ifNoneMatch: request.headers.get('if-none-match') ?? undefined,
    })

    if (!result) {
      return new NextResponse('Not found', { status: 404 })
    }

    if (result.statusCode === 304) {
      return new NextResponse(null, {
        status: 304,
        headers: { ETag: result.blob.etag, 'Cache-Control': 'private, no-cache' },
      })
    }

    const filename = pathname.split('/').pop() || 'cold_storage_bundle.json'
    return new NextResponse(result.stream, {
      headers: {
        'Content-Type': result.blob.contentType || 'application/json',
        'Content-Disposition': `attachment; filename="${filename}"`,
        ETag: result.blob.etag,
        'Cache-Control': 'private, no-cache',
      },
    })
  } catch (error) {
    console.error('[v0] cold-storage retrieve error:', error)
    return NextResponse.json({ ok: false, error: 'Failed to retrieve bundle' }, { status: 500 })
  }
}
