import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';

export async function GET(req: NextRequest) {
  // Vercel sets the real client IP in x-forwarded-for before its own proxy IPs.
  // Extract it here (server-side) and forward it explicitly so Railway sees the
  // actual visitor IP, not Vercel's server IP.
  const xff = req.headers.get('x-forwarded-for') ?? '';
  const realIp = xff.split(',')[0].trim() || req.headers.get('x-real-ip') || '';

  fetch(`${BACKEND_URL}/visit`, {
    method: 'GET',
    headers: {
      'X-Forwarded-For': realIp,
      'X-Real-IP': realIp,
      'User-Agent': req.headers.get('user-agent') ?? '',
      'Referer': req.headers.get('referer') ?? '',
    },
  }).catch(() => {});

  return new NextResponse(null, { status: 204 });
}
