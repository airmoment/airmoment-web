import { SearchSummaryBar } from "@/components/search-summary-bar"
import { AIPredictionSection } from "@/components/ai-prediction-section"
import { FlightList } from "@/components/flight-list"
import {
  mockSearchParams,
  mockPricePrediction,
  mockPredictionFactors,
  mockPriceDropPeriods,
  mockFlights,
  totalResults,
} from "@/lib/mock-data"

export default function SearchResultsPage() {
  return (
    <main className="min-h-screen bg-background pt-14">
      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
        {/* 검색 조건 요약 바 */}
        <SearchSummaryBar searchParams={mockSearchParams} />

        {/* 가격 예측 섹션 */}
        <div className="mt-6">
          <AIPredictionSection
            prediction={mockPricePrediction}
            factors={mockPredictionFactors}
            dropPeriods={mockPriceDropPeriods}
          />
        </div>

        {/* 항공권 검색 결과 리스트 */}
        <div className="mt-6">
          <FlightList flights={mockFlights} totalResults={totalResults} />
        </div>
      </div>
    </main>
  )
}
