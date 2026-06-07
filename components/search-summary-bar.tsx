"use client"

import { User, Calendar, PlaneTakeoff, CheckSquare, Square } from "lucide-react"

/**
 * 비행기 좌석 아이콘 (side view).
 * 헤드레스트가 있는 높은 등받이 + 앞으로 약간 튀어나오는 좌석 쿠션.
 * lucide에 항공 좌석 전용 아이콘이 없어서 직접 만든 SVG.
 */
function PlaneSeatIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {/* 등받이 + 헤드레스트 (윗부분 둥글게) */}
      <path d="M8 17V6a2 2 0 0 1 2-2h0a2 2 0 0 1 2 2v11" />
      {/* 좌석 쿠션 (앞으로 확장, 살짝 사다리꼴) */}
      <path d="M8 17h11l-1 3H9l-1-3z" />
    </svg>
  )
}
import { useRouter, useSearchParams, usePathname } from "next/navigation"
import type { SearchParams } from "@/lib/mock-data"
import type { InterestBody } from "@/lib/api"
import { BookmarkButton } from "@/components/bookmark-button"
import { AlertButton } from "@/components/alert-button"

interface SearchSummaryBarProps {
  searchParams: SearchParams
  /** 현재 검색 조건을 InterestBody 형태로. 관심노선/알림 API 호출에 사용. */
  route: InterestBody
}

export function SearchSummaryBar({ searchParams, route }: SearchSummaryBarProps) {
  const router = useRouter()
  const pathname = usePathname()
  const urlParams = useSearchParams()
  // 토글 상태는 URL이 진실. prop으로 받은 directOnly가 곧 URL의 nonstopOnly 반영본.
  const directOnly = searchParams.directOnly

  function toggleDirectOnly() {
    const next = new URLSearchParams(urlParams.toString())
    if (directOnly) next.delete("nonstopOnly")
    else next.set("nonstopOnly", "true")
    router.push(`${pathname}?${next.toString()}`)
  }

  return (
    <div className="flex items-center justify-between gap-4 overflow-x-auto rounded-xl bg-white px-4 py-3 shadow-sm">
      {/* 검색 조건 */}
      <div className="flex items-center gap-2 whitespace-nowrap">
        {/* 출발 */}
        <div className="flex items-center gap-2 rounded-lg border border-border px-3 py-2">
          <span className="text-sm font-medium text-primary">출발</span>
          <span className="text-sm text-foreground">
            {searchParams.departure.city} ({searchParams.departure.code})
          </span>
        </div>

        {/* 도착 */}
        <div className="flex items-center gap-2 rounded-lg border border-primary bg-primary/5 px-3 py-2">
          <span className="text-sm font-medium text-primary">도착</span>
          <span className="text-sm text-foreground">
            {searchParams.arrival.city} ({searchParams.arrival.code})
          </span>
        </div>

        {/* 날짜 */}
        <div className="flex items-center gap-2 rounded-lg border border-border px-3 py-2">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm text-foreground">{searchParams.date}</span>
        </div>

        {/* 승객 수 */}
        <div className="flex items-center gap-2 rounded-lg border border-border px-3 py-2">
          <User className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm text-foreground">승객 {searchParams.passengers}명</span>
        </div>

        {/* 좌석 */}
        <div className="flex items-center gap-2 rounded-lg border border-border px-3 py-2">
          <PlaneSeatIcon className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm text-foreground">{searchParams.seatClass}</span>
        </div>

        {/* 편도/왕복 */}
        <div className="flex items-center gap-2 rounded-lg border border-border px-3 py-2">
          <PlaneTakeoff className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm text-foreground">{searchParams.tripType}</span>
        </div>

        {/* 직항만 체크박스 — 클릭 시 URL의 nonstopOnly 토글하고 페이지 재조회 */}
        <button
          type="button"
          onClick={toggleDirectOnly}
          className={`flex items-center gap-2 rounded-lg border px-3 py-2 transition-colors ${
            directOnly
              ? "border-primary bg-primary/5 hover:bg-primary/10"
              : "border-border hover:bg-muted/50"
          }`}
        >
          {directOnly ? (
            <CheckSquare className="h-4 w-4 text-primary" />
          ) : (
            <Square className="h-4 w-4 text-muted-foreground" />
          )}
          <span
            className={`text-sm ${directOnly ? "font-medium text-primary" : "text-foreground"}`}
          >
            직항만
          </span>
        </button>
      </div>

      {/* 버튼 그룹 */}
      <div className="flex flex-shrink-0 items-center gap-3 whitespace-nowrap">
        {/* 관심노선 버튼 */}
        <BookmarkButton route={route} variant="compact" />

        {/* 구매시기 알림받기 버튼 */}
        <AlertButton route={route} />
      </div>
    </div>
  )
}
