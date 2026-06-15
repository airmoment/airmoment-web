"use client"

import { Sparkles } from "lucide-react"

interface ExplanationCardProps {
  /** 백엔드의 SHAP+LLM 자연어 설명. undefined 또는 빈 배열이면 섹션 자체를 숨김. */
  reasons?: string[]
}

export function ExplanationCard({ reasons }: ExplanationCardProps) {
  // 백엔드가 빈 리스트를 반환하거나 explain 필드 자체가 없으면 카드를 표시하지 않음.
  if (!reasons || reasons.length === 0) {
    return null
  }

  return (
    <div className="rounded-xl border border-border bg-white p-6 shadow-sm">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold text-foreground">AI 판단 근거</h2>
          </div>
          <p className="mt-0.5 text-sm text-muted-foreground">
            SHAP 기반 요인 추출 + LLM 자연어 설명
          </p>
        </div>
      </div>

      <ul className="space-y-2.5">
        {reasons.map((reason, i) => (
          <li key={i} className="flex gap-2 text-sm leading-6 text-foreground">
            <span className="mt-2 inline-block h-1.5 w-1.5 flex-shrink-0 rounded-full bg-primary" />
            <span>{reason}</span>
          </li>
        ))}
      </ul>

      <p className="mt-4 text-sm text-muted-foreground">
        AI의 판단은 참고용입니다. 최종 구매 결정은 사용자가 직접 내려주세요.
      </p>
    </div>
  )
}
