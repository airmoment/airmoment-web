import { SearchSummaryBar } from "@/components/search-summary-bar"
import { DecisionCard } from "@/components/decision-card"
import { ForecastChartCard } from "@/components/forecast-chart-card"
import { ExplanationCard } from "@/components/explanation-card"
import { FlightList } from "@/components/flight-list"
import {
  mockFlights,
  totalResults as mockTotalResults,
  type Flight,
  type SearchParams,
} from "@/lib/mock-data"
import {
  searchFlights,
  formatDuration,
  formatTime,
  type ApiFlightItem,
  type ApiPredict,
  type PriceForecast,
} from "@/lib/api"

function mapApiItemToFlight(
  item: ApiFlightItem,
  index: number,
  departureCode: string,
  arrivalCode: string
): Flight {
  return {
    id: String(index),
    airline: {
      name: item.airlineName,
      code: item.airlineName,
      logo: "plane",
      color: "#4D85AA",
      photo: item.airlinePhoto || undefined,
    },
    departure: {
      time: formatTime(item.departureTime),
      airport: departureCode,
      code: departureCode,
    },
    arrival: {
      time: formatTime(item.arrivalTime),
      airport: arrivalCode,
      code: arrivalCode,
    },
    date: "",
    duration: formatDuration(item.duration),
    price: item.price,
    tripType: "편도",
  }
}

export default async function SearchResultsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>
}) {
  const params = await searchParams

  const departureCode = params.departureCode ?? "ICN"
  const arrivalCode = params.arrivalCode ?? "SYD"
  const departureAt = params.departureAt ?? "2026-06-10"
  const nonstopOnly = params.nonstopOnly === "true"
  const maxPrice = params.maxPrice ? Number(params.maxPrice) : undefined
  const sort = params.sort

  const token = process.env.API_TOKEN ?? ""

  let flights: Flight[] = mockFlights
  let totalResults = mockTotalResults
  let predict: ApiPredict = { decision: "WAIT" }
  let forecast: PriceForecast | undefined

  try {
    const result = await searchFlights(
      { departureCode, arrivalCode, departureAt, nonstopOnly, maxPrice, sort },
      token
    )
    flights = result.data.flightList.map((item, i) =>
      mapApiItemToFlight(item, i, departureCode, arrivalCode)
    )
    totalResults = result.data.totalCount
    predict = result.data.predict
    forecast = result.data.priceForecast
  } catch {
    // API 실패 시 mock 데이터/기본값 유지
  }

  const route = { departureCode, arrivalCode, departureAt, nonstopOnly }

  const displaySearchParams: SearchParams = {
    departure: {
      city: departureCode,
      country: "",
      code: departureCode,
    },
    arrival: {
      city: arrivalCode,
      country: "",
      code: arrivalCode,
    },
    passengers: 1,
    date: departureAt,
    seatClass: "일반석",
    tripType: "편도",
    directOnly: nonstopOnly,
  }

  return (
    <main className="min-h-screen bg-background pt-14">
      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
        {/* 검색 조건 요약 + 관심노선/알림 토글 */}
        <SearchSummaryBar searchParams={displaySearchParams} route={route} />

        {/* ① BUY/WAIT 구매 추천 + 예상 최저가 범위 */}
        <div className="mt-6">
          <DecisionCard predict={predict} forecast={forecast} />
        </div>

        {/* ② 가격 추이 예측 시각화 */}
        <div className="mt-6">
          <ForecastChartCard forecast={forecast} />
        </div>

        {/* ③ AI 판단 근거 자연어 설명 */}
        <div className="mt-6">
          <ExplanationCard predict={predict} forecast={forecast} />
        </div>

        {/* 항공권 리스트 */}
        <div className="mt-8">
          <FlightList flights={flights} totalResults={totalResults} />
        </div>
      </div>
    </main>
  )
}
