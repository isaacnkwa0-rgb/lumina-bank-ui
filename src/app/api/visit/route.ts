import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';

export async function GET(req: NextRequest) {
  // x-real-ip is set by Vercel's edge directly to the real client IP.
  // We forward it as X-Client-IP — a custom header Railway's proxy won't
  // prepend its own IP to, unlike X-Forwarded-For.
  const realIp = req.headers.get('x-real-ip')
    ?? req.headers.get('x-forwarded-for')?.split(',')[0].trim()
    ?? '';

  fetch(`${BACKEND_URL}/visit`, {
    method: 'GET',
    headers: {
      'X-Client-IP': realIp,
      'User-Agent': req.headers.get('user-agent') ?? '',
      'Referer': req.headers.get('referer') ?? '',
    },
  }).catch(() => {});

  return new NextResponse(null, { status: 204 });
}
