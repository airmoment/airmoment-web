/**
 * 항공사 한글 이름 → 메타데이터 매핑.
 *
 * - IATA: 2글자 항공사 코드 (로고 URL 조회용)
 * - color: 브랜드 메인 색상 (FlightCard에서 이름 색상으로 사용)
 *
 * 로고는 Daisycon 무료 CDN을 1차로, 백엔드의 airlinePhoto를 2차로 사용한다.
 * Daisycon CDN: https://images.daisycon.io/airline/?iata=XX (인증 불필요, IATA 기반)
 */
export interface AirlineMeta {
  iata: string
  color: string
}

export const AIRLINE_META: Record<string, AirlineMeta> = {
  // 한국
  "대한항공": { iata: "KE", color: "#00256C" },
  "아시아나항공": { iata: "OZ", color: "#A50034" },

  // 일본 (자주 검색됨)
  "일본항공": { iata: "JL", color: "#E60012" },
  "전일본공수": { iata: "NH", color: "#1B3893" },

  // 중국
  "동방항공": { iata: "MU", color: "#C8102E" },
  "샤먼항공": { iata: "MF", color: "#1B3F89" },

  // 동남아 / LCC
  "젯스타": { iata: "JQ", color: "#FF5115" },
  "비엣젯항공": { iata: "VJ", color: "#E2231A" },
  "스쿳항공": { iata: "TR", color: "#F9DA00" },
  "에어아시아": { iata: "AK", color: "#E5101D" },
  "타이항공": { iata: "TG", color: "#56086C" },
  "THAI": { iata: "TG", color: "#56086C" },

  // 홍콩
  "홍콩항공": { iata: "HX", color: "#E60028" },
  "캐세이패시픽항공": { iata: "CX", color: "#006564" },

  // 중동
  "에티하드항공": { iata: "EY", color: "#BD8B13" },
  "카타르항공": { iata: "QR", color: "#5C0632" },
  "에미레이트항공": { iata: "EK", color: "#D71921" },

  // 기타
  "말레이항공": { iata: "MH", color: "#006DB7" },
  "싱가포르항공": { iata: "SQ", color: "#1C2E5A" },
}

/** 폴백 색상 (매핑에 없는 항공사) */
export const FALLBACK_AIRLINE_COLOR = "#4a6d87"

/**
 * 항공사 한글명을 받아서 로고 URL을 만든다.
 * 매핑에 없으면 fallback(예: 백엔드의 airlinePhoto)을 반환.
 */
export function getAirlineLogoUrl(
  airlineName: string,
  fallback?: string
): string | undefined {
  const meta = AIRLINE_META[airlineName]
  if (meta) {
    // Daisycon 무료 CDN — IATA 기반
    return `https://images.daisycon.io/airline/?width=300&height=300&color=ffffff&iata=${meta.iata}`
  }
  return fallback
}

/** 항공사 브랜드 색상. 매핑에 없으면 사이트 기본 색상. */
export function getAirlineColor(airlineName: string): string {
  return AIRLINE_META[airlineName]?.color ?? FALLBACK_AIRLINE_COLOR
}
