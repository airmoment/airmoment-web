"use client"

import { useEffect, useState } from "react"

interface PriceGaugeProps {
  score: number // 0-100
}

export function PriceGauge({ score }: PriceGaugeProps) {
  const [animatedScore, setAnimatedScore] = useState(0)

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedScore(score)
    }, 100)
    return () => clearTimeout(timer)
  }, [score])

  // 바늘 각도 계산 (0 = -90도, 100 = 90도)
  const needleAngle = -90 + (animatedScore / 100) * 180

  return (
    <div className="flex flex-col items-center">
      <div className="relative h-[120px] w-[220px]">
        {/* 반원형 게이지 SVG */}
        <svg viewBox="0 0 200 110" className="h-full w-full">
          {/* 게이지 배경 - 그라데이션 구간 */}
          <defs>
            <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#22c55e" />
              <stop offset="35%" stopColor="#eab308" />
              <stop offset="70%" stopColor="#f97316" />
              <stop offset="100%" stopColor="#ef4444" />
            </linearGradient>
          </defs>

          {/* 게이지 트랙 */}
          <path
            d="M 20 100 A 80 80 0 0 1 180 100"
            fill="none"
            stroke="#e5e7eb"
            strokeWidth="18"
            strokeLinecap="round"
          />

          {/* 초록 구간 (0-33) */}
          <path
            d="M 20 100 A 80 80 0 0 1 53 40"
            fill="none"
            stroke="#22c55e"
            strokeWidth="18"
            strokeLinecap="round"
          />

          {/* 노랑 구간 (33-66) */}
          <path
            d="M 53 40 A 80 80 0 0 1 147 40"
            fill="none"
            stroke="#eab308"
            strokeWidth="18"
          />

          {/* 빨강 구간 (66-100) */}
          <path
            d="M 147 40 A 80 80 0 0 1 180 100"
            fill="none"
            stroke="#ef4444"
            strokeWidth="18"
            strokeLinecap="round"
          />

          {/* 바늘 */}
          <g
            transform={`rotate(${needleAngle}, 100, 100)`}
            style={{ transition: "transform 1s ease-out" }}
          >
            <line
              x1="100"
              y1="100"
              x2="100"
              y2="35"
              stroke="#1f2937"
              strokeWidth="3"
              strokeLinecap="round"
            />
            {/* 바늘 끝 화살표 */}
            <polygon
              points="100,30 95,45 105,45"
              fill="#1f2937"
            />
          </g>

          {/* 중앙 원 */}
          <circle cx="100" cy="100" r="8" fill="#374151" />

          {/* 점수 표시 */}
          <text
            x="100"
            y="85"
            textAnchor="middle"
            className="fill-foreground text-2xl font-bold"
            style={{ fontSize: "24px", fontWeight: "bold" }}
          >
            {score}
          </text>
        </svg>
      </div>

      {/* 설명 텍스트 */}
      <p className="mt-2 text-center text-sm text-muted-foreground">
        수치가 0에 가까울수록 지금 구매해야하는 항공권입니다
      </p>
    </div>
  )
}
