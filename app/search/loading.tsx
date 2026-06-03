import { Plane } from "lucide-react"

/**
 * Next.js가 app/search/page.tsx의 비동기 작업을 기다리는 동안 자동으로 표시.
 * 백엔드 응답이 느릴 때(외부 항공권 API 조회 등) 사용자에게 "진행 중" 신호를 준다.
 */
export default function SearchLoading() {
  return (
    <main className="min-h-screen bg-background pt-14">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-center px-4 py-24 sm:px-6 lg:px-8">
        {/* 비행기 아이콘 — 좌우로 둥둥 떠다님 */}
        <div className="relative">
          <Plane className="h-16 w-16 animate-bounce text-primary" strokeWidth={1.5} />
          <span className="absolute -bottom-2 left-1/2 h-2 w-12 -translate-x-1/2 rounded-full bg-primary/20 blur-sm" />
        </div>

        <h2 className="mt-8 text-xl font-semibold text-foreground">
          AI가 항공권을 분석하고 있어요
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          가격 추이와 구매 시점을 계산 중입니다.
          <br />
          최대 15초 정도 걸릴 수 있어요.
        </p>

        {/* 진행 단계 표시 (시각적 안내, 실제 진행률 X) */}
        <div className="mt-10 w-full max-w-md space-y-3">
          <Step active label="항공권 정보 수집" />
          <Step active label="가격 예측 모델 추론" />
          <Step active label="구매 시점 판단" />
        </div>

        {/* 진행 바 */}
        <div className="mt-8 h-1.5 w-full max-w-md overflow-hidden rounded-full bg-muted">
          <div className="h-full w-1/3 animate-[loadingBar_1.5s_ease-in-out_infinite] rounded-full bg-primary" />
        </div>

        <style>{`
          @keyframes loadingBar {
            0% { transform: translateX(-100%); }
            100% { transform: translateX(400%); }
          }
        `}</style>
      </div>
    </main>
  )
}

function Step({ label, active }: { label: string; active: boolean }) {
  return (
    <div className="flex items-center gap-3 text-sm">
      <div
        className={`h-2 w-2 rounded-full ${
          active ? "animate-pulse bg-primary" : "bg-muted"
        }`}
      />
      <span className={active ? "text-foreground" : "text-muted-foreground"}>{label}</span>
    </div>
  )
}
