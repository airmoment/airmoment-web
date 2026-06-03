"use client"

import { useState } from "react"
import { User, Calendar, ChevronRight } from "lucide-react"
import Link from "next/link"
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover"
import { Calendar as CalendarPicker } from "@/components/ui/calendar"

const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"]

interface Destination {
  city: string
  country: string
  code: string
}

const DESTINATIONS: Destination[] = [
  { city: "파리", country: "프랑스", code: "CDG" },
  { city: "뉴욕", country: "미국", code: "JFK" },
  { city: "시드니", country: "호주", code: "SYD" },
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

  const canSearch = Boolean(arrival)
  const searchHref =
    arrival && date
      ? `/search?departureCode=ICN&arrivalCode=${arrival.code}&departureAt=${toISODate(date)}`
      : arrival
        ? `/search?departureCode=ICN&arrivalCode=${arrival.code}`
        : "#"

  return (
    <div className="mt-6 w-full max-w-2xl">
      {/* 출발/도착 바 */}
      <div className="flex overflow-hidden rounded-full bg-white shadow-xl shadow-black/10">
        {/* 출발 (고정) */}
        <div className="flex flex-1 items-center gap-2 px-4 py-2.5">
          <span className="text-sm font-semibold text-[#4D85AA] sm:text-base">출발</span>
          <span className="text-sm text-foreground sm:text-base">인천 ( 대한민국, ICN )</span>
        </div>

        <div className="my-2 w-px bg-border" />

        {/* 도착 (팝오버) */}
        <Popover open={arrivalOpen} onOpenChange={setArrivalOpen}>
          <PopoverTrigger asChild>
            <button
              type="button"
              className="flex flex-1 items-center gap-2 px-4 py-2.5 text-left transition-colors hover:bg-muted/50"
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
          <PopoverContent className="w-56 p-1" align="end" sideOffset={12}>
            {DESTINATIONS.map((dest) => (
              <button
                key={dest.code}
                type="button"
                onClick={() => {
                  setArrival(dest)
                  setArrivalOpen(false)
                }}
                className={`flex w-full items-center justify-between rounded-md px-3 py-2 text-left text-sm transition-colors hover:bg-muted ${
                  arrival?.code === dest.code
                    ? "bg-muted font-medium text-[#4D85AA]"
                    : "text-foreground"
                }`}
              >
                <span>
                  {dest.city} ({dest.country}, {dest.code})
                </span>
              </button>
            ))}
          </PopoverContent>
        </Popover>
      </div>

      {/* 옵션 바 */}
      <div className="mx-auto mt-4 flex w-fit items-center gap-2 rounded-full bg-[#3d5a6e] px-4 py-2.5 text-white shadow-lg sm:gap-3 sm:px-6 sm:py-3">
        {/* 승객 */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          <User className="h-4 w-4 sm:h-5 sm:w-5" />
          <span className="text-xs sm:text-sm">승객</span>
          <span className="flex h-5 w-5 items-center justify-center rounded-full border border-white/60 text-xs sm:h-6 sm:w-6 sm:text-sm">
            1
          </span>
          <span className="text-xs sm:text-sm">명</span>
        </div>

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

        {/* 좌석 */}
        <span className="rounded-full border border-white/60 px-2 py-0.5 text-xs sm:px-3 sm:py-1 sm:text-sm">
          일반석
        </span>

        {/* 편도 */}
        <span className="rounded-full border border-white/60 px-2 py-0.5 text-xs sm:px-3 sm:py-1 sm:text-sm">
          편도
        </span>

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
            onClick={() => setArrivalOpen(true)}
            title="도착지를 먼저 선택해주세요"
            aria-label="도착지를 먼저 선택해주세요"
            className="ml-1 flex h-7 w-7 cursor-not-allowed items-center justify-center rounded-full bg-white/10 opacity-60 sm:ml-2 sm:h-8 sm:w-8"
          >
            <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5" />
          </button>
        )}
      </div>
    </div>
  )
}
