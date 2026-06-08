import { Suspense } from "react"
import { SearchSummaryBar } from "@/components/search-summary-bar"
import { DecisionCard } from "@/components/decision-card"
import { ForecastChartCard } from "@/components/forecast-chart-card"
import { ExplanationCard } from "@/components/explanation-card"
import { FlightList } from "@/components/flight-list"
import SearchLoading from "./loading"
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

/**
 * 결과 셋의 비행시간 분포로 각 항공권의 직항/경유 추정.
 * - nonstopOnly 검색 결과면 모두 직항(백엔드가 직항만 보냄)
 * - 그 외엔 최단 비행시간 + 90분 이내면 직항으로 가정
 * - 백엔드가 항공권별 isDirect 필드 추가하면 이 함수는 제거하고 응답값 그대로 사용
 */
function inferDirectness(flights: Flight[], allDirect: boolean): Flight[] {
  if (allDirect) {
    return flights.map((f) => ({ ...f, isDirect: true }))
  }
  const durations = flights
    .map((f) => f.durationMinutes)
    .filter((d): d is number => d !== undefined)
  if (durations.length === 0) return flights
  const minDuration = Math.min(...durations)
  const directThreshold = minDuration + 90 // 1.5시간 이내면 직항으로 본다
  return flights.map((f) => ({
    ...f,
    isDirect:
      f.durationMinutes !== undefined && f.durationMinutes <= directThreshold,
  }))
}

function mapApiItemToFlight(
  item: ApiFlightItem,
  index: number,
  departureCode: string,
  arrivalCode: string,
  isDirect?: boolean
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
    durationMinutes: item.duration,
    price: item.price,
    tripType: "편도",
    isDirect,
  }
}

/**
 * 외부 페이지 컴포넌트 — Suspense 래퍼만 담당.
 *
 * 같은 라우트(/search) 내부에서 query 파라미터만 바뀌는 경우
 * Next.js의 route-level loading.tsx는 발동하지 않는다. 그래서
 * Suspense의 `key`를 검색 조건 문자열로 묶어, 조건이 달라질 때마다
 * 내부 컴포넌트가 다시 마운트되며 fallback(SearchLoading)이 뜨도록 한다.
 */
export default async function SearchResultsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>
}) {
  const params = await searchParams
  const key = [
    params.departureCode ?? "",
    params.arrivalCode ?? "",
    params.departureAt ?? "",
    params.maxPrice ?? "",
    params.sort ?? "",
  ].join("|")

  return (
    <Suspense key={key} fallback={<SearchLoading />}>
      <SearchResultsContent params={params} />
    </Suspense>
  )
}

async function SearchResultsContent({
  params,
}: {
  params: Record<string, string | undefined>
}) {
  const departureCode = params.departureCode ?? "ICN"
  const arrivalCode = params.arrivalCode ?? "SYD"
  const departureAt = params.departureAt ?? "2026-06-10"
  const maxPrice = params.maxPrice ? Number(params.maxPrice) : undefined
  const sort = params.sort
  // 직항만 필터는 클라이언트(FlightList)에서만 적용 — AI 분석 카드는 항상 전체
  // 데이터(직항+경유 모두) 기준으로 예측을 보여주므로 백엔드에 nonstopOnly를
  // 보내지 않는다. 북마크/알림에 들어가는 nonstopOnly는 기본 false.
  const nonstopOnly = false

  const token = process.env.API_TOKEN ?? ""

  let flights: Flight[] = mockFlights
  let totalResults = mockTotalResults
  let predict: ApiPredict = { decision: "WAIT" }
  let forecast: PriceForecast | undefined
  let apiError: string | null = null

  if (!token) {
    apiError = "API_TOKEN 환경변수가 비어있습니다. .env.local에 토큰을 넣고 dev 서버를 재시작해주세요."
    console.warn("[search/page] " + apiError)
  } else {
    try {
      const result = await searchFlights(
        { departureCode, arrivalCode, departureAt, maxPrice, sort },
        token
      )
      const rawFlights = result.data.flightList.map((item, i) =>
        mapApiItemToFlight(item, i, departureCode, arrivalCode)
      )
      flights = inferDirectness(rawFlights, nonstopOnly)
      totalResults = result.data.totalCount
      predict = result.data.predict
      forecast = result.data.priceForecast
    } catch (err) {
      apiError =
        err instanceof Error ? err.message : "항공권 조회 API 호출에 실패했습니다."
      console.error("[search/page] flight search failed:", err)
      // mock 데이터로 폴백 — 에러 메시지는 UI에 표시
    }
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
        {/* API 폴백 시 경고 배너 (mock 데이터 사용 중) */}
        {apiError && (
          <div className="mb-4 rounded-lg border border-yellow-300 bg-yellow-50 px-4 py-3 text-sm text-yellow-900">
            <strong className="font-semibold">⚠️ 항공권 조회 API 실패</strong> — mock
            데이터로 표시 중입니다. 원인: {apiError}
          </div>
        )}

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
