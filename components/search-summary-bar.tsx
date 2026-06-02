"use client"

import { User, Calendar, PlaneTakeoff, CheckSquare, Square } from "lucide-react"
import { useState } from "react"
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
  const [directOnly, setDirectOnly] = useState(searchParams.directOnly)

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
          <svg className="h-4 w-4 text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 18V9a2 2 0 0 1 2-2h1a2 2 0 0 1 2 2v9" />
            <path d="M4 13h5" />
            <path d="M15 18V9a2 2 0 0 1 2-2h1a2 2 0 0 1 2 2v9" />
            <path d="M15 13h5" />
            <path d="M2 18h20" />
          </svg>
          <span className="text-sm text-foreground">{searchParams.seatClass}</span>
        </div>

        {/* 편도/왕복 */}
        <div className="flex items-center gap-2 rounded-lg border border-border px-3 py-2">
          <PlaneTakeoff className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm text-foreground">{searchParams.tripType}</span>
        </div>

        {/* 직항만 체크박스 */}
        <button
          type="button"
          onClick={() => setDirectOnly(!directOnly)}
          className="flex items-center gap-2 rounded-lg border border-border px-3 py-2 transition-colors hover:bg-muted/50"
        >
          {directOnly ? (
            <CheckSquare className="h-4 w-4 text-primary" />
          ) : (
            <Square className="h-4 w-4 text-muted-foreground" />
          )}
          <span className="text-sm text-foreground">직항만</span>
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
