"use client"

import { useState } from "react"
import { User, Calendar, ChevronRight } from "lucide-react"
import Link from "next/link"
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover"
import { Calendar as CalendarPicker } from "@/components/ui/calendar"
import { toast } from "@/hooks/use-toast"

/** 비활성 옵션 공통 스타일 — 흐릿한 색 + 점선 테두리. */
const DISABLED_OPTION =
  "cursor-not-allowed border-dashed border-white/30 text-white/60 opacity-70"

/** 비활성 옵션 클릭 시 동일한 안내 토스트를 띄운다. */
function showLocked(field: string, support: string) {
  toast({
    title: `${field}은(는) 아직 선택할 수 없어요`,
    description: `현재 ${support}만 지원됩니다.`,
  })
}

const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"]

interface Destination {
  city: string
  country: string
  code: string
  /** 드롭다운에서만 보여주는 정식 공항명. 메인 알약엔 표시 X. */
  airport: string
}

const DESTINATIONS: Destination[] = [
  { city: "파리", country: "프랑스", code: "CDG", airport: "샤를 드골 국제공항" },
  { city: "뉴욕", country: "미국", code: "JFK", airport: "존 F. 케네디 국제공항" },
  { city: "시드니", country: "호주", code: "SYD", airport: "킹스포드 스미스 공항" },
]

function formatDateDisplay(date: Date): string {
  return `${date.getMonth() + 1}.${date.getDate()}.${WEEKDAYS[date.getDay()]}`
}

function toISODate(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, "0")
  const d = String(date.getDate()).padStart(2, "0")
  return `${y}-${m}-${d}`
}

export function HomeSearchBar() {
  const [date, setDate] = useState<Date | undefined>(undefined)
  const [open, setOpen] = useState(false)
  // 도착지는 처음엔 미선택 상태. 사용자가 직접 골라야 함.
  const [arrival, setArrival] = useState<Destination | null>(null)
  const [arrivalOpen, setArrivalOpen] = useState(false)

  // 도착지 + 가는 날짜 둘 다 골라야 검색 가능
  const canSearch = Boolean(arrival && date)
  const searchHref = canSearch
    ? `/search?departureCode=ICN&arrivalCode=${arrival!.code}&departureAt=${toISODate(date!)}`
    : "#"

  // 비활성 상태에서 클릭 시 누락된 항목의 팝오버를 자동으로 열어준다.
  function handleDisabledClick() {
    if (!arrival) {
      setArrivalOpen(true)
    } else if (!date) {
      setOpen(true)
    }
  }

  const disabledTitle = !arrival
    ? "도착지를 먼저 선택해주세요"
    : !date
      ? "가는 날을 선택해주세요"
      : ""

  return (
    <div className="mt-5 w-full max-w-2xl">
      {/* 출발/도착 바 */}
      <div className="flex overflow-hidden rounded-full bg-white shadow-xl shadow-black/10">
        {/* 출발 (고정 — 인천만 지원) */}
        <button
          type="button"
          onClick={() => showLocked("출발지", "인천(ICN) 출발")}
          title="출발지는 현재 인천(ICN)만 지원돼요"
          className="flex flex-1 cursor-not-allowed items-center justify-center gap-5 px-2 py-2"
        >
          <span className="text-sm font-semibold text-[#4D85AA] sm:text-base">출발</span>
          <span className="text-sm text-foreground/60 sm:text-base">
            인천 ( 대한민국, ICN )
          </span>
        </button>

        <div className="my-2 w-px bg-border" />

        {/* 도착 (팝오버) */}
        <Popover open={arrivalOpen} onOpenChange={setArrivalOpen}>
          <PopoverTrigger asChild>
            <button
              type="button"
              className="flex flex-1 items-center justify-center gap-5 px-3 py-4 transition-colors hover:bg-muted/50"
            >
              <span className="text-sm font-semibold text-[#4D85AA] sm:text-base">도착</span>
              {arrival ? (
                <span className="text-sm text-foreground sm:text-base">
                  {arrival.city} ( {arrival.country}, {arrival.code} )
                </span>
              ) : (
                <span className="text-sm text-muted-foreground sm:text-base">
                  도착지를 선택해주세요
                </span>
              )}
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-64 p-1" align="end" sideOffset={12}>
            {DESTINATIONS.map((dest) => (
              <button
                key={dest.code}
                type="button"
                onClick={() => {
                  setArrival(dest)
                  setArrivalOpen(false)
                }}
                className={`flex w-full flex-col items-start rounded-md px-3 py-2 text-left text-sm transition-colors hover:bg-muted ${
                  arrival?.code === dest.code
                    ? "bg-muted font-medium text-[#4D85AA]"
                    : "text-foreground"
                }`}
              >
                <span className="text-sm">
                  {dest.city} ({dest.country}, {dest.code})
                </span>
                <span className="mt-0.5 text-xs text-muted-foreground">
                  {dest.airport}
                </span>
              </button>
            ))}
          </PopoverContent>
        </Popover>
      </div>

      {/* 옵션 바 */}
      <div className="mx-auto mt-4 flex w-fit items-center gap-2 rounded-full bg-[#3d5a6e] px-4 py-2.5 text-white shadow-lg sm:gap-5 sm:px-3 sm:py-3">
        {/* 승객 (비활성) */}
        <button
          type="button"
          onClick={() => showLocked("승객 수", "1명")}
          title="승객 수는 아직 선택할 수 없어요"
          className="flex cursor-not-allowed items-center gap-1.5 rounded-full opacity-70 sm:gap-2"
        >
          <User className="h-4 w-4 text-white/70 sm:h-5 sm:w-5" />
          <span className="text-xs text-white/70 sm:text-sm">승객</span>
          <span className="flex h-5 w-5 items-center justify-center rounded-full border border-dashed border-white/30 text-xs text-white/60 sm:h-6 sm:w-6 sm:text-sm">
            1
          </span>
          <span className="text-xs text-white/70 sm:text-sm">명</span>
        </button>

        {/* 날짜 달력 */}
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <button
              type="button"
              className="flex items-center gap-1.5 rounded-full transition-colors hover:bg-white/10 sm:gap-2"
            >
              <Calendar className="h-4 w-4 sm:h-5 sm:w-5" />
              <span className="text-xs sm:text-sm">가는 날</span>
              <span className="rounded-full border border-white/60 px-2 py-0.5 text-xs sm:px-3 sm:py-1 sm:text-sm">
                {date ? formatDateDisplay(date) : "날짜 선택"}
              </span>
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="center" sideOffset={12}>
            <CalendarPicker
              mode="single"
              selected={date}
              onSelect={(d) => {
                setDate(d)
                setOpen(false)
              }}
              disabled={{ before: new Date() }}
              autoFocus
            />
          </PopoverContent>
        </Popover>

        {/* 좌석 (비활성) */}
        <button
          type="button"
          onClick={() => showLocked("좌석", "일반석")}
          title="좌석 선택은 아직 지원하지 않아요"
          className={`rounded-full border px-2 py-0.5 text-xs sm:px-3 sm:py-1 sm:text-sm ${DISABLED_OPTION}`}
        >
          일반석
        </button>

        {/* 편도 (비활성) */}
        <button
          type="button"
          onClick={() => showLocked("왕복 여부", "편도")}
          title="왕복은 아직 지원하지 않아요"
          className={`rounded-full border px-2 py-0.5 text-xs sm:px-3 sm:py-1 sm:text-sm ${DISABLED_OPTION}`}
        >
          편도
        </button>

        {/* 검색 버튼 — 도착지가 없으면 비활성화 + 클릭 시 도착 팝오버 열기 */}
        {canSearch ? (
          <Link
            href={searchHref}
            className="ml-1 flex h-7 w-7 items-center justify-center rounded-full bg-white/20 transition-colors hover:bg-white/30 sm:ml-2 sm:h-8 sm:w-8"
            aria-label="검색"
          >
            <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5" />
          </Link>
        ) : (
          <button
            type="button"
            onClick={handleDisabledClick}
            title={disabledTitle}
            aria-label={disabledTitle}
            className="ml-1 flex h-7 w-7 cursor-not-allowed items-center justify-center rounded-full bg-white/10 opacity-60 sm:ml-2 sm:h-8 sm:w-8"
          >
            <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5" />
          </button>
        )}
      </div>
    </div>
  )
}
