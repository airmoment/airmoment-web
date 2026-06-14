"use client"

import { User, Calendar, PlaneTakeoff, ChevronDown } from "lucide-react"
import { useRouter, useSearchParams, usePathname } from "next/navigation"
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover"
import { Calendar as CalendarPicker } from "@/components/ui/calendar"
import { toast } from "@/hooks/use-toast"
import type { SearchParams } from "@/lib/mock-data"
import type { InterestBody } from "@/lib/api"
import {
  DESTINATIONS,
  formatDateDisplay,
  parseISODate,
  toISODate,
  type Destination,
} from "@/lib/destinations"
import { BookmarkButton } from "@/components/bookmark-button"
import { AlertButton } from "@/components/alert-button"

interface SearchSummaryBarProps {
  searchParams: SearchParams
  /** 현재 검색 조건을 InterestBody 형태로. 관심노선/알림 API 호출에 사용. */
  route: InterestBody
}

/**
 * 비행기 좌석 아이콘 (side view) — lucide에 없어서 직접 만든 SVG.
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
      <path d="M8 17V6a2 2 0 0 1 2-2h0a2 2 0 0 1 2 2v11" />
      <path d="M8 17h11l-1 3H9l-1-3z" />
    </svg>
  )
}

/** 잠긴 옵션 클릭 시 띄우는 안내 토스트. 메인 검색바와 같은 패턴. */
function showLocked(field: string, support: string) {
  toast({
    title: `${field}은(는) 아직 선택할 수 없어요`,
    description: `현재 ${support}만 지원됩니다.`,
  })
}

export function SearchSummaryBar({ searchParams, route }: SearchSummaryBarProps) {
  const router = useRouter()
  const pathname = usePathname()
  const urlParams = useSearchParams()
  const currentArrivalCode = searchParams.arrival.code
  const currentDate = parseISODate(searchParams.date)

  // 공통: 쿼리 한 키를 갱신하고 페이지 이동.
  function updateQuery(key: string, value: string | null) {
    const next = new URLSearchParams(urlParams.toString())
    if (value === null) next.delete(key)
    else next.set(key, value)
    router.push(`${pathname}?${next.toString()}`)
  }

  function selectArrival(dest: Destination) {
    if (dest.code === currentArrivalCode) return
    updateQuery("arrivalCode", dest.code)
  }

  function selectDate(d: Date | undefined) {
    if (!d) return
    const iso = toISODate(d)
    if (iso === searchParams.date) return
    updateQuery("departureAt", iso)
  }

  return (
    <div className="flex items-center justify-between gap-4 overflow-x-auto rounded-xl bg-white px-4 py-3 shadow-sm">
      {/* 검색 조건 */}
      <div className="flex items-center gap-2 whitespace-nowrap">
        {/* 출발 — 잠금 */}
        <button
          type="button"
          onClick={() => showLocked("출발지", "인천(ICN)")}
          title="출발지는 현재 인천(ICN)만 지원돼요"
          className="flex cursor-not-allowed items-center gap-2 rounded-lg border border-dashed border-border px-3 py-2 opacity-70"
        >
          <span className="text-sm font-medium text-primary">출발</span>
          <span className="text-sm text-foreground">
            {searchParams.departure.city} ({searchParams.departure.code})
          </span>
        </button>

        {/* 도착 — 팝오버로 재선택 */}
        <Popover>
          <PopoverTrigger asChild>
            <button
              type="button"
              className="flex items-center gap-2 rounded-lg border border-primary bg-primary/5 px-3 py-2 transition-colors hover:bg-primary/10"
            >
              <span className="text-sm font-medium text-primary">도착</span>
              <span className="text-sm text-foreground">
                {searchParams.arrival.city} ({currentArrivalCode})
              </span>
              <ChevronDown className="h-3.5 w-3.5 text-primary" />
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-64 p-1" align="start" sideOffset={6}>
            {DESTINATIONS.map((dest) => (
              <button
                key={dest.code}
                type="button"
                onClick={() => selectArrival(dest)}
                className={`flex w-full flex-col items-start rounded-md px-3 py-2 text-left transition-colors hover:bg-muted ${
                  dest.code === currentArrivalCode
                    ? "bg-muted font-medium text-primary"
                    : "text-foreground"
                }`}
              >
                <span className="text-sm">
                  {dest.city} ({dest.country}, {dest.code})
                </span>
                <span className="mt-0.5 text-sm text-muted-foreground">
                  {dest.airport}
                </span>
              </button>
            ))}
          </PopoverContent>
        </Popover>

        {/* 날짜 — 달력 팝오버로 재선택 */}
        <Popover>
          <PopoverTrigger asChild>
            <button
              type="button"
              className="flex items-center gap-2 rounded-lg border border-border px-3 py-2 transition-colors hover:bg-muted/50"
            >
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-foreground">
                {currentDate ? formatDateDisplay(currentDate) : searchParams.date}
              </span>
              <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start" sideOffset={6}>
            <CalendarPicker
              mode="single"
              selected={currentDate ?? undefined}
              // 현재 검색된 날짜의 달부터 보이도록 (없으면 오늘이 속한 달)
              defaultMonth={currentDate ?? undefined}
              onSelect={selectDate}
              disabled={{ before: new Date() }}
              autoFocus
            />
          </PopoverContent>
        </Popover>

        {/* 승객 — 잠금 */}
        <button
          type="button"
          onClick={() => showLocked("승객 수", "1명")}
          title="승객 수는 아직 선택할 수 없어요"
          className="flex cursor-not-allowed items-center gap-2 rounded-lg border border-dashed border-border px-3 py-2 opacity-70"
        >
          <User className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm text-foreground">
            승객 {searchParams.passengers}명
          </span>
        </button>

        {/* 좌석 — 잠금 */}
        <button
          type="button"
          onClick={() => showLocked("좌석", "일반석")}
          title="좌석 선택은 아직 지원하지 않아요"
          className="flex cursor-not-allowed items-center gap-2 rounded-lg border border-dashed border-border px-3 py-2 opacity-70"
        >
          <PlaneSeatIcon className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm text-foreground">{searchParams.seatClass}</span>
        </button>

        {/* 편도/왕복 — 잠금 */}
        <button
          type="button"
          onClick={() => showLocked("왕복 여부", "편도")}
          title="왕복은 아직 지원하지 않아요"
          className="flex cursor-not-allowed items-center gap-2 rounded-lg border border-dashed border-border px-3 py-2 opacity-70"
        >
          <PlaneTakeoff className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm text-foreground">{searchParams.tripType}</span>
        </button>

        {/* 직항만 토글은 항공권 리스트의 필터/정렬과 함께 하단에서 처리 */}
      </div>

      {/* 버튼 그룹 */}
      <div className="flex flex-shrink-0 items-center gap-3 whitespace-nowrap">
        <BookmarkButton route={route} variant="compact" />
        <AlertButton route={route} />
      </div>
    </div>
  )
}
