import { Plane } from "lucide-react"

/**
 * Next.js가 app/search/page.tsx의 비동기 작업을 기다리는 동안 자동으로 표시.
 * 백엔드 응답이 느릴 때 사용자에게 "진행 중" 신호를 준다.
 */
export default function SearchLoading() {
  return (
    <main className="min-h-screen bg-background pt-14">
      <div className="mx-auto flex max-w-md flex-col items-center justify-center px-4 py-32 text-center">
        {/* 비행기 아이콘 (천천히 흔들흔들) */}
        <div className="relative mb-8">
          <Plane
            className="h-14 w-14 animate-pulse text-primary"
            strokeWidth={1.5}
          />
        </div>

        <h2 className="text-lg font-semibold text-foreground">
          AI가 항공권을 분석하고 있어요
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          가격 추이와 구매 시점을 계산 중입니다.
        </p>

        {/* 점 3개 펄스 (Tailwind 기본 animate-bounce 사용) */}
        <div className="mt-8 flex items-center gap-2">
          <span className="h-2 w-2 animate-bounce rounded-full bg-primary [animation-delay:-0.3s]" />
          <span className="h-2 w-2 animate-bounce rounded-full bg-primary [animation-delay:-0.15s]" />
          <span className="h-2 w-2 animate-bounce rounded-full bg-primary" />
        </div>

        <p className="mt-6 text-sm text-muted-foreground">
          외부 항공권 데이터 조회 중이라 시간이 걸릴 수 있어요.
          <br />
          잠시만 기다려주세요.
        </p>
      </div>
    </main>
  )
}
