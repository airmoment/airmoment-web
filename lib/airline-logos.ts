/**
 * 항공사 한글 이름 → 메타데이터 매핑.
 *
 * - IATA: 2글자(또는 2글자+숫자) 항공사 코드. 로고 CDN 조회에 사용.
 * - color: 브랜드 메인 색상. FlightCard에서 항공사명 색상으로 사용.
 *
 * 로고는 Daisycon 무료 CDN을 1차, 백엔드의 airlinePhoto를 2차로 사용한다.
 * Daisycon CDN: https://images.daisycon.io/airline/?iata=XX (인증 불필요)
 *
 * 새 항공사 추가 시: 한글명 → IATA 코드 + 브랜드 컬러 추가하면 끝.
 */
export interface AirlineMeta {
  iata: string
  color: string
}

export const AIRLINE_META: Record<string, AirlineMeta> = {
  // ─────────────────────────────────────────────
  // 한국
  // ─────────────────────────────────────────────
  "대한항공": { iata: "KE", color: "#00256C" },
  "아시아나항공": { iata: "OZ", color: "#A50034" },
  "진에어": { iata: "LJ", color: "#0F50A4" },
  "티웨이항공": { iata: "TW", color: "#FF7700" },

  // ─────────────────────────────────────────────
  // 일본
  // ─────────────────────────────────────────────
  "일본항공": { iata: "JL", color: "#E60012" },
  "전일본공수": { iata: "NH", color: "#1B3893" },

  // ─────────────────────────────────────────────
  // 중국 본토 + 홍콩 + 대만
  // ─────────────────────────────────────────────
  "동방항공": { iata: "MU", color: "#C8102E" },
  "샤먼항공": { iata: "MF", color: "#1B3F89" },
  "상하이항공": { iata: "FM", color: "#003876" },
  "산둥항공": { iata: "SC", color: "#005B82" },
  "하이난항공": { iata: "HU", color: "#E40000" },
  "중국남방항공": { iata: "CZ", color: "#0066B3" },
  "에어차이나": { iata: "CA", color: "#E40523" },
  "중화항공": { iata: "CI", color: "#A02831" }, // China Airlines (대만)
  "홍콩항공": { iata: "HX", color: "#E60028" },
  "캐세이패시픽항공": { iata: "CX", color: "#006564" },

  // ─────────────────────────────────────────────
  // 동남아 / LCC
  // ─────────────────────────────────────────────
  "젯스타": { iata: "JQ", color: "#FF5115" },
  "비엣젯항공": { iata: "VJ", color: "#E2231A" },
  "스쿳항공": { iata: "TR", color: "#F9DA00" },
  "에어아시아": { iata: "AK", color: "#E5101D" },
  "에어아시아 X": { iata: "D7", color: "#E5101D" },
  "타이항공": { iata: "TG", color: "#56086C" },
  THAI: { iata: "TG", color: "#56086C" },
  "베트남항공": { iata: "VN", color: "#003C71" },
  "가루다항공": { iata: "GA", color: "#024A92" },
  "세부퍼시픽": { iata: "5J", color: "#FBA70C" },
  "필리핀항공": { iata: "PR", color: "#1F4E8C" },
  "말레이항공": { iata: "MH", color: "#006DB7" },
  "싱가포르항공": { iata: "SQ", color: "#1C2E5A" },
  "Batik Air": { iata: "ID", color: "#0D70B0" },

  // ─────────────────────────────────────────────
  // 중동
  // ─────────────────────────────────────────────
  "에티하드항공": { iata: "EY", color: "#BD8B13" },
  "카타르항공": { iata: "QR", color: "#5C0632" },
  "에미레이트항공": { iata: "EK", color: "#D71921" },
  "오만항공": { iata: "WY", color: "#008752" },
  "터키항공": { iata: "TK", color: "#E81932" },

  // ─────────────────────────────────────────────
  // 유럽
  // ─────────────────────────────────────────────
  "루프트한자": { iata: "LH", color: "#05164D" },
  "Lufthansa City Airlines": { iata: "CL", color: "#05164D" },
  "스위스항공": { iata: "LX", color: "#D2031B" },
  "에어프랑스": { iata: "AF", color: "#002157" },
  KLM: { iata: "KL", color: "#00A1DE" },
  "핀란드항공": { iata: "AY", color: "#003C7E" },
  "SAS항공": { iata: "SK", color: "#003B5C" },
  "LOT 폴란드항공": { iata: "LO", color: "#11397E" },
  "콘도르항공": { iata: "DE", color: "#FFA500" },
  ITA: { iata: "AZ", color: "#005687" }, // ITA Airways

  // ─────────────────────────────────────────────
  // 북미
  // ─────────────────────────────────────────────
  "아메리칸항공": { iata: "AA", color: "#0078D2" },
  "델타항공": { iata: "DL", color: "#003366" },
  "유나이티드항공": { iata: "UA", color: "#002E5D" },
  "알래스카항공": { iata: "AS", color: "#39477F" },
  "웨스트젯": { iata: "WS", color: "#16B96F" },
  "에어캐나다": { iata: "AC", color: "#D8261C" },

  // ─────────────────────────────────────────────
  // 오세아니아
  // ─────────────────────────────────────────────
  "콴타스항공": { iata: "QF", color: "#E40000" },
  "버진 오스트레일리아": { iata: "VA", color: "#E40015" },

  // ─────────────────────────────────────────────
  // 기타
  // ─────────────────────────────────────────────
  "에바항공": { iata: "BR", color: "#0F8F00" }, // EVA Air (대만)
  "에어인디아": { iata: "AI", color: "#E83C16" },
  "에티오피아항공": { iata: "ET", color: "#1B7F3B" },
  "MIAT 몽골항공": { iata: "OM", color: "#0033A0" },
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
