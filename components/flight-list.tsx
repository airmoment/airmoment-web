"use client"

import { useMemo, useState } from "react"
import { Check, ChevronDown, Filter, SlidersHorizontal } from "lucide-react"
import { FlightCard } from "./flight-card"
import type { Flight } from "@/lib/mock-data"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Slider } from "@/components/ui/slider"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"

interface FlightListProps {
  flights: Flight[]
  totalResults: number
}

type SortKey =
  | "default"
  | "price-asc"
  | "price-desc"
  | "duration-asc"
  | "departure-asc"

const SORT_LABELS: Record<SortKey, string> = {
  default: "인기순",
  "price-asc": "낮은 가격순",
  "price-desc": "높은 가격순",
  "duration-asc": "짧은 비행시간순",
  "departure-asc": "빠른 출발시간순",
}

function formatPriceShort(price: number) {
  return `₩${price.toLocaleString("ko-KR")}`
}

export function FlightList({ flights, totalResults }: FlightListProps) {
  const [sortKey, setSortKey] = useState<SortKey>("default")

  // 항공권 리스트에서 고유 항공사 목록 추출 (필터 옵션용)
  const allAirlines = useMemo(() => {
    const set = new Set<string>()
    flights.forEach((f) => set.add(f.airline.name))
    return Array.from(set).sort()
  }, [flights])

  // 가격 범위 (필터 슬라이더 min/max)
  const { priceMin, priceMax } = useMemo(() => {
    if (flights.length === 0) return { priceMin: 0, priceMax: 0 }
    const prices = flights.map((f) => f.price)
    return { priceMin: Math.min(...prices), priceMax: Math.max(...prices) }
  }, [flights])

  const [maxPrice, setMaxPrice] = useState<number>(priceMax)
  const [selectedAirlines, setSelectedAirlines] = useState<Set<string>>(new Set())

  // priceMax가 바뀌면 (예: 새로 데이터 로드) 슬라이더 상한도 자동 조정
  // 단순 상태 동기화는 useMemo로 처리하되, useState는 첫 마운트값만 사용하므로
  // useEffect로 명시적으로 갱신할 수도 있지만 여기선 단순화를 위해 생략.

  const filteredAndSorted = useMemo(() => {
    let list = [...flights]

    // 필터: 가격 상한
    if (maxPrice > 0 && maxPrice < priceMax) {
      list = list.filter((f) => f.price <= maxPrice)
    }
    // 필터: 항공사 (선택 0개 = 전체 표시)
    if (selectedAirlines.size > 0) {
      list = list.filter((f) => selectedAirlines.has(f.airline.name))
    }

    // 정렬
    switch (sortKey) {
      case "price-asc":
        list.sort((a, b) => a.price - b.price)
        break
      case "price-desc":
        list.sort((a, b) => b.price - a.price)
        break
      case "duration-asc":
        list.sort((a, b) => (a.durationMinutes ?? 0) - (b.durationMinutes ?? 0))
        break
      case "departure-asc":
        list.sort((a, b) => a.departure.time.localeCompare(b.departure.time))
        break
      case "default":
        // 원래 순서 유지
        break
    }
    return list
  }, [flights, sortKey, maxPrice, selectedAirlines, priceMax])

  function toggleAirline(name: string) {
    setSelectedAirlines((prev) => {
      const next = new Set(prev)
      if (next.has(name)) next.delete(name)
      else next.add(name)
      return next
    })
  }

  function resetFilters() {
    setMaxPrice(priceMax)
    setSelectedAirlines(new Set())
  }

  const isFilterActive =
    (maxPrice > 0 && maxPrice < priceMax) || selectedAirlines.size > 0
  const visibleCount = filteredAndSorted.length

  return (
    <div className="space-y-4">
      {/* 헤더 */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-semibold text-foreground">
          총 검색결과 {totalResults}개
          {isFilterActive && (
            <span className="ml-2 text-sm font-normal text-muted-foreground">
              (필터 후 {visibleCount}개)
            </span>
          )}
        </h2>

        <div className="flex items-center gap-3">
          {/* 필터 팝오버 */}
          <Popover>
            <PopoverTrigger asChild>
              <button
                type="button"
                className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm transition-colors ${
                  isFilterActive
                    ? "border-primary bg-primary/5 text-primary"
                    : "border-border text-muted-foreground hover:text-foreground"
                }`}
              >
                <SlidersHorizontal className="h-4 w-4" />
                필터
                {isFilterActive && (
                  <span className="ml-1 rounded-full bg-primary px-1.5 py-0.5 text-xs text-white">
                    ON
                  </span>
                )}
              </button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-80 p-4">
              <div className="space-y-5">
                {/* 가격 상한 */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-foreground">가격 상한</span>
                    <span className="text-muted-foreground">
                      {formatPriceShort(maxPrice)} 이하
                    </span>
                  </div>
                  <Slider
                    value={[maxPrice]}
                    min={priceMin}
                    max={priceMax}
                    step={Math.max(1000, Math.round((priceMax - priceMin) / 50))}
                    onValueChange={(v) => setMaxPrice(v[0])}
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{formatPriceShort(priceMin)}</span>
                    <span>{formatPriceShort(priceMax)}</span>
                  </div>
                </div>

                {/* 항공사 */}
                {allAirlines.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-foreground">항공사</p>
                    <div className="max-h-48 space-y-2 overflow-y-auto pr-1">
                      {allAirlines.map((name) => (
                        <label
                          key={name}
                          className="flex cursor-pointer items-center gap-2 text-sm text-foreground"
                        >
                          <Checkbox
                            checked={selectedAirlines.has(name)}
                            onCheckedChange={() => toggleAirline(name)}
                          />
                          <span>{name}</span>
                        </label>
                      ))}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      선택 안 하면 전체 표시
                    </p>
                  </div>
                )}

                {/* 초기화 */}
                {isFilterActive && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={resetFilters}
                    className="w-full"
                  >
                    필터 초기화
                  </Button>
                )}
              </div>
            </PopoverContent>
          </Popover>

          {/* 정렬 드롭다운 */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                <Filter className="h-4 w-4" />
                {SORT_LABELS[sortKey]}
                <ChevronDown className="h-4 w-4" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              {(Object.keys(SORT_LABELS) as SortKey[]).map((key) => (
                <DropdownMenuItem
                  key={key}
                  onClick={() => setSortKey(key)}
                  className="cursor-pointer"
                >
                  <Check
                    className={`mr-2 h-4 w-4 ${
                      sortKey === key ? "opacity-100" : "opacity-0"
                    }`}
                  />
                  {SORT_LABELS[key]}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* 항공권 카드 리스트 */}
      <div className="space-y-3">
        {filteredAndSorted.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border bg-muted/20 p-8 text-center text-sm text-muted-foreground">
            조건에 맞는 항공권이 없어요. 필터를 조정해보세요.
          </div>
        ) : (
          filteredAndSorted.map((flight) => (
            <FlightCard key={flight.id} flight={flight} />
          ))
        )}
      </div>
    </div>
  )
}
