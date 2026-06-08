"use client"

import { usePathname, useSearchParams } from "next/navigation"
import { useEffect, useRef, useState } from "react"

/**
 * 페이지 상단의 얇은 진행바 (YouTube/GitHub 스타일).
 *
 * 라우트 또는 query 파라미터가 바뀌면 잠시 켜졌다가 자동으로 꺼진다.
 * 새 RSC 응답이 도착하는 정확한 시점을 client에서 알 수 없어 타임아웃 기반.
 * 검색 API 응답이 평균 6~7초이므로 8초 후 자동 종료. 그 사이에 새 변경이
 * 일어나면 타이머가 리셋된다.
 */
export function NavigationProgress() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [active, setActive] = useState(false)
  // 첫 마운트(=페이지 첫 로드)에는 띄우지 않는다.
  // 그건 loading.tsx가 담당.
  const isFirstRender = useRef(true)

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false
      return
    }
    setActive(true)
    const t = setTimeout(() => setActive(false), 8000)
    return () => clearTimeout(t)
  }, [pathname, searchParams])

  if (!active) return null

  return (
    <div
      aria-hidden="true"
      className="fixed left-0 right-0 top-0 z-[100] h-0.5 overflow-hidden bg-primary/10"
    >
      <div className="nav-progress-bar h-full w-1/3 rounded-r-full bg-primary" />
    </div>
  )
}
