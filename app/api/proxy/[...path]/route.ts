/**
 * 백엔드 HTTP API를 위한 동형(同形) 프록시.
 *
 * 왜 필요한가:
 *   - 백엔드가 http:// (HTTPS 미지원)인데, Vercel 배포는 https://.
 *   - 브라우저에서 HTTPS 페이지가 HTTP API로 요청하면 Mixed Content로 차단됨.
 *   - 이 라우트는 Next.js 서버 사이드에서 실행되므로 HTTP 호출 가능.
 *   - 클라이언트는 동일 출처의 /api/proxy/* 로 요청 → 여기서 백엔드로 그대로 전달.
 *
 * 호출 예:
 *   브라우저:  GET /api/proxy/api/v1/mypage
 *   여기서:   GET http://15.165.123.108:8080/api/v1/mypage
 *
 * Authorization 헤더, 쿼리스트링, body는 그대로 패스스루.
 */

import { NextRequest, NextResponse } from "next/server"

const BACKEND_URL = "http://15.165.123.108:8080"

async function handler(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params
  const pathStr = path.join("/")
  const targetUrl = `${BACKEND_URL}/${pathStr}${req.nextUrl.search}`

  // 백엔드로 보낼 헤더 — 인증/콘텐츠타입만 전달.
  const outHeaders: Record<string, string> = {}
  const auth = req.headers.get("authorization")
  if (auth) outHeaders.Authorization = auth
  const ct = req.headers.get("content-type")
  if (ct) outHeaders["Content-Type"] = ct

  // 본문 — GET/HEAD가 아니면 그대로 전달.
  const hasBody = req.method !== "GET" && req.method !== "HEAD"
  const body = hasBody ? await req.text() : undefined

  try {
    const upstream = await fetch(targetUrl, {
      method: req.method,
      headers: outHeaders,
      body,
      cache: "no-store",
    })

    const responseText = await upstream.text()
    return new NextResponse(responseText, {
      status: upstream.status,
      headers: {
        "content-type":
          upstream.headers.get("content-type") ?? "application/json",
      },
    })
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "backend fetch failed"
    return NextResponse.json(
      {
        status: 502,
        message: `Proxy 호출 실패: ${message}`,
      },
      { status: 502 }
    )
  }
}

export const GET = handler
export const POST = handler
export const PUT = handler
export const PATCH = handler
export const DELETE = handler
