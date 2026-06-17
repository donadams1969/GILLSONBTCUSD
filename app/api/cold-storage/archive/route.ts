import { NextRequest, NextResponse } from 'next/server'
import { get } from '@vercel/blob'

/**
 * Streams a privately-archived cold-storage bundle back from Vercel Blob.
 * Private blobs are never publicly reachable; they can only be retrieved
 * through this server route. The pathname comes from the seal ledger.
 */
export async function GET(req: NextRequest) {
  const pathname = req.nextUrl.searchParams.get('pathname')
  if (!pathname) {
    return NextResponse.json({ error: 'Missing pathname' }, { status: 400 })
  }

  // Only ever serve from the cold-storage namespace for this case.
  if (!pathname.startsWith('cold-storage/CUD-26-682107/')) {
    return NextResponse.json({ error: 'Forbidden path' }, { status: 403 })
  }

  try {
    const result = await get(pathname, {
      access: 'private',
      ifNoneMatch: req.headers.get('if-none-match') ?? undefined,
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

    return new NextResponse(result.stream, {
      headers: {
        'Content-Type': result.blob.contentType || 'application/json',
        ETag: result.blob.etag,
        'Cache-Control': 'private, no-cache',
        'Content-Disposition': `attachment; filename="${pathname.split('/').pop()}"`,
      },
    })
  } catch (error) {
    console.error('[v0] cold-storage archive fetch failed:', error)
    return NextResponse.json({ error: 'Failed to retrieve archive' }, { status: 500 })
  }
}
