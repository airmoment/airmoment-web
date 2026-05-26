// Mock Data for AirMoment Search Results
// 나중에 실제 API와 연결하기 쉽도록 분리된 데이터 객체

export interface Flight {
  id: string
  airline: {
    name: string
    code: string
    logo: string
    color: string
  }
  departure: {
    time: string
    airport: string
    code: string
  }
  arrival: {
    time: string
    airport: string
    code: string
  }
  date: string
  duration: string
  price: number
  tripType: "편도" | "왕복"
}

export interface PricePrediction {
  score: number // 0-100, 낮을수록 지금 구매 권장
  status: "buy" | "wait" | "hold"
  message: string
  dropProbability: number // 가격 하락 확률 (%)
  maxSavings: number // 예상 절감 금액
  priceRange: {
    min: number
    max: number
  }
}

export interface PredictionFactors {
  daysUntilDeparture: number // 출발까지 남은 기간 (%)
  recentPriceChange: number // 최근 가격 변동 (%)
  explanation: string
}

export interface PriceDropPeriod {
  period: string
  percentage: number
  label: string
}

export interface DailyPrice {
  date: string
  displayDate: string
  price: number
  isLowest: boolean
}

export interface SearchParams {
  departure: {
    city: string
    country: string
    code: string
  }
  arrival: {
    city: string
    country: string
    code: string
  }
  passengers: number
  date: string
  seatClass: string
  tripType: string
  directOnly: boolean
}

export interface FavoriteRoute {
  id: string
  departure: string
  arrival: string
  tripType: "편도" | "왕복"
  directOnly: boolean
  date: string
  passengers: number
  seatClass: string
  isFavorite: boolean
  alertEnabled: boolean
  priceHistory: {
    date: string
    price: number
  }[]
}

// 검색 조건 Mock Data
export const mockSearchParams: SearchParams = {
  departure: {
    city: "인천",
    country: "대한민국",
    code: "ICN",
  },
  arrival: {
    city: "시드니",
    country: "호주",
    code: "SYD",
  },
  passengers: 1,
  date: "6.10.수",
  seatClass: "일반석",
  tripType: "편도",
  directOnly: true,
}

// 가격 예측 Mock Data (확장)
export const mockPricePrediction: PricePrediction = {
  score: 35,
  status: "wait",
  message: "기다리세요!",
  dropProbability: 78,
  maxSavings: 146000,
  priceRange: {
    min: 250000,
    max: 310000,
  },
}

// 예측 근거 Mock Data
export const mockPredictionFactors: PredictionFactors = {
  daysUntilDeparture: 35,
  recentPriceChange: 5,
  explanation:
    "출발일까지 남은 기간이 40일 이상으로 넉넉하고, 최근 해당 노선의 가격 변동이 있었기에 단기적으로 가격이 하락할 가능성이 높습니다.",
}

// 가격 하락 예상 구간 Mock Data
export const mockPriceDropPeriods: PriceDropPeriod[] = [
  { period: "3일 이내", percentage: 25, label: "3일 이내 하락" },
  { period: "7일 이내", percentage: 82, label: "7일 이내 하락" },
  { period: "장기", percentage: 10, label: "장기 대기" },
]

// 일자별 최저가 Mock Data
export const mockDailyPrices: DailyPrice[] = [
  {
    date: "2026-06-09",
    displayDate: "6월 9일",
    price: 417000,
    isLowest: false,
  },
  {
    date: "2026-06-10",
    displayDate: "6월 10일",
    price: 396000,
    isLowest: false,
  },
  {
    date: "2026-06-11",
    displayDate: "6월 11일",
    price: 289000,
    isLowest: true,
  },
]

// 항공권 검색 결과 Mock Data
export const mockFlights: Flight[] = [
  {
    id: "1",
    airline: {
      name: "젯스타",
      code: "JQ",
      logo: "star",
      color: "#FF6B00",
    },
    departure: {
      time: "20:50",
      airport: "인천",
      code: "ICN",
    },
    arrival: {
      time: "09:05",
      airport: "시드니",
      code: "SYD",
    },
    date: "6월 10일 수요일",
    duration: "10시간 15분",
    price: 396054,
    tripType: "편도",
  },
  {
    id: "2",
    airline: {
      name: "아시아나",
      code: "OZ",
      logo: "plane",
      color: "#C62828",
    },
    departure: {
      time: "08:00",
      airport: "인천",
      code: "ICN",
    },
    arrival: {
      time: "19:25",
      airport: "시드니",
      code: "SYD",
    },
    date: "6월 10일 수요일",
    duration: "10시간 25분",
    price: 1012800,
    tripType: "편도",
  },
  {
    id: "3",
    airline: {
      name: "대한항공",
      code: "KE",
      logo: "plane",
      color: "#00256C",
    },
    departure: {
      time: "20:10",
      airport: "인천",
      code: "ICN",
    },
    arrival: {
      time: "06:20",
      airport: "시드니",
      code: "SYD",
    },
    date: "6월 10일 수요일",
    duration: "10시간 10분",
    price: 1126900,
    tripType: "편도",
  },
  {
    id: "4",
    airline: {
      name: "콴타스",
      code: "QF",
      logo: "plane",
      color: "#E40000",
    },
    departure: {
      time: "19:30",
      airport: "인천",
      code: "ICN",
    },
    arrival: {
      time: "07:45",
      airport: "시드니",
      code: "SYD",
    },
    date: "6월 10일 수요일",
    duration: "10시간 15분",
    price: 1245000,
    tripType: "편도",
  },
  {
    id: "5",
    airline: {
      name: "싱가포르항공",
      code: "SQ",
      logo: "plane",
      color: "#FDB913",
    },
    departure: {
      time: "09:15",
      airport: "인천",
      code: "ICN",
    },
    arrival: {
      time: "21:30",
      airport: "시드니",
      code: "SYD",
    },
    date: "6월 10일 수요일",
    duration: "12시간 15분",
    price: 892000,
    tripType: "편도",
  },
]

// 관심 노선 Mock Data
export const mockFavoriteRoutes: FavoriteRoute[] = [
  {
    id: "1",
    departure: "ICN",
    arrival: "SYD",
    tripType: "편도",
    directOnly: true,
    date: "2026.06.10 수",
    passengers: 1,
    seatClass: "일반석",
    isFavorite: true,
    alertEnabled: true,
    priceHistory: [
      { date: "4/20", price: 1121000 },
      { date: "4/23", price: 1123000 },
      { date: "4/26", price: 1122000 },
      { date: "4/29", price: 1122000 },
      { date: "5/2", price: 1122000 },
      { date: "5/5", price: 1122000 },
      { date: "5/8", price: 1122000 },
    ],
  },
  {
    id: "2",
    departure: "ICN",
    arrival: "CDG",
    tripType: "편도",
    directOnly: true,
    date: "2026.07.15 화",
    passengers: 1,
    seatClass: "일반석",
    isFavorite: false,
    alertEnabled: false,
    priceHistory: [
      { date: "4/20", price: 980000 },
      { date: "4/23", price: 975000 },
      { date: "4/26", price: 990000 },
      { date: "4/29", price: 1005000 },
      { date: "5/2", price: 998000 },
      { date: "5/5", price: 1010000 },
      { date: "5/8", price: 1015000 },
    ],
  },
]

// 총 검색 결과 수
export const totalResults = 19

// 가격 포맷팅 유틸리티
export function formatPrice(price: number): string {
  return new Intl.NumberFormat("ko-KR").format(price)
}

export function formatPriceShort(price: number): string {
  if (price >= 10000) {
    return `₩${(price / 10000).toFixed(1)}만`
  }
  return `₩${formatPrice(price)}`
}
