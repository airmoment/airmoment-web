"use client"

import { usePathname, useSearchParams } from "next/navigation"
import { useEffect, useRef, useState } from "react"

/**
 * 페이지 상단의 진행바 + 우상단 작은 라벨.
 *
 * 라우트 또는 query 파라미터가 바뀌면 잠시 켜졌다가 자동으로 꺼진다.
 * 새 RSC 응답이 도착하는 정확한 시점을 client에서 알 수 없어 타임아웃 기반.
 * 검색 API 응답이 평균 6~7초이므로 8초 후 자동 종료. 그 사이에 새 변경이
 * 일어나면 타이머가 리셋된다.
 *
 * 시연 영상에서 잘 보이도록:
 * - 바 두께 4px + 그림자
 * - 우상단에 "재검색 중..." 작은 알약 (시선 잡기용)
 */
export function NavigationProgress() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [active, setActive] = useState(false)
  const isFirstRender = useRef(true)

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false
      return
    }
    setActive(true)
    const t = setTimeout(() => setActive(false), 1000)
    return () => clearTimeout(t)
  }, [pathname, searchParams])

  if (!active) return null

  return (
    <>
      {/* 상단 진행 바 — 4px, 살짝 그림자로 콘텐츠와 분리 */}
      <div
        aria-hidden="true"
        className="fixed left-0 right-0 top-0 z-[100] h-1 overflow-hidden bg-primary/15 shadow-sm"
      >
        <div className="nav-progress-bar h-full w-1/3 rounded-r-full bg-primary" />
      </div>

      {/* 상단 가운데에 떠 있는 라벨 — 헤더 바로 아래, 화면 중앙 */}
      <div
        aria-live="polite"
        className="fixed left-1/2 top-20 z-[100] flex -translate-x-1/2 items-center gap-2 rounded-full border border-border bg-white px-4 py-2 text-sm font-medium text-foreground shadow-md"
      >
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
        </span>
        검색 결과 갱신 중
      </div>
    </>
  )
}
