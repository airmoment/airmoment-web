"use client"

import { ChevronDown } from "lucide-react"
import { FlightCard } from "./flight-card"
import type { Flight } from "@/lib/mock-data"
import { useState } from "react"

interface FlightListProps {
  flights: Flight[]
  totalResults: number
}

export function FlightList({ flights, totalResults }: FlightListProps) {
  const [sortBy, setSortBy] = useState("인기순")

  return (
    <div className="space-y-4">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-foreground">
          총 검색결과 {totalResults}개
        </h2>

        <div className="flex items-center gap-4">
          {/* 필터 버튼 */}
          <button
            type="button"
            className="flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ChevronDown className="h-4 w-4" />
            필터
          </button>

          {/* 정렬 버튼 */}
          <button
            type="button"
            className="flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ChevronDown className="h-4 w-4" />
            {sortBy}
          </button>
        </div>
      </div>

      {/* 항공권 카드 리스트 */}
      <div className="space-y-3">
        {flights.map((flight) => (
          <FlightCard key={flight.id} flight={flight} />
        ))}
      </div>
    </div>
  )
}
