import { User, Calendar, ChevronRight } from "lucide-react"
import Link from "next/link"

export default function Home() {
  return (
    <main className="relative min-h-screen">
      {/* Background Image with Gradient Overlay */}
      <div className="absolute inset-0 z-0">
        <img
          src="/images/airplane-bg.jpg"
          alt=""
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#5a7d97]/60 via-[#7a9db7]/40 to-[#c9d5dc]/30" />
      </div>

      {/* Hero Content */}
      <section className="relative z-10 flex min-h-screen flex-col items-center justify-center px-4 pt-14">
        <div className="flex flex-col items-center text-center">
          {/* Slogan */}
          <p className="text-lg font-medium tracking-wide text-white/90 sm:text-xl md:text-2xl">
            여행의 타이밍을 계산하는 똑똑한 항공권
          </p>

          {/* Main Logo */}
          <h1 
            className="mt-4 text-5xl tracking-wider text-white sm:text-6xl md:text-7xl lg:text-8xl"
            style={{ fontFamily: "'Nico Moji', cursive" }}
          >
            AirMoment
          </h1>

          {/* Subtitle */}
          <p className="mt-8 text-base font-medium text-white/80 sm:text-lg md:text-xl">
            어디로 여행을 떠나볼까요?
          </p>

          {/* Search Bar */}
          <div className="mt-6 w-full max-w-2xl">
            <div className="flex overflow-hidden rounded-full bg-white shadow-xl shadow-black/10">
              {/* Departure */}
              <div className="flex flex-1 items-center gap-3 px-6 py-4 sm:px-8 sm:py-5">
                <span className="text-sm font-semibold text-[#4D85AA] sm:text-base">출발</span>
                <span className="text-sm text-foreground sm:text-base">인천 ( 대한민국, ICN )</span>
              </div>

              {/* Divider */}
              <div className="my-3 w-px bg-border" />

              {/* Arrival */}
              <div className="flex flex-1 items-center gap-3 px-6 py-4 sm:px-8 sm:py-5">
                <span className="text-sm font-semibold text-[#4D85AA] sm:text-base">도착</span>
                <span className="text-sm text-foreground sm:text-base">시드니 ( 호주, SYD)</span>
              </div>
            </div>

            {/* Floating Options Bar */}
            <div className="mx-auto mt-4 flex w-fit items-center gap-2 rounded-full bg-[#3d5a6e] px-4 py-2.5 text-white shadow-lg sm:gap-3 sm:px-6 sm:py-3">
              {/* Passengers */}
              <div className="flex items-center gap-1.5 sm:gap-2">
                <User className="h-4 w-4 sm:h-5 sm:w-5" />
                <span className="text-xs sm:text-sm">승객</span>
                <span className="flex h-5 w-5 items-center justify-center rounded-full border border-white/60 text-xs sm:h-6 sm:w-6 sm:text-sm">
                  1
                </span>
                <span className="text-xs sm:text-sm">명</span>
              </div>

              {/* Date */}
              <div className="flex items-center gap-1.5 sm:gap-2">
                <Calendar className="h-4 w-4 sm:h-5 sm:w-5" />
                <span className="text-xs sm:text-sm">가는 날</span>
                <span className="rounded-full border border-white/60 px-2 py-0.5 text-xs sm:px-3 sm:py-1 sm:text-sm">
                  6.10.수
                </span>
              </div>

              {/* Seat Class */}
              <span className="rounded-full border border-white/60 px-2 py-0.5 text-xs sm:px-3 sm:py-1 sm:text-sm">
                일반석
              </span>

              {/* Trip Type */}
              <span className="rounded-full border border-white/60 px-2 py-0.5 text-xs sm:px-3 sm:py-1 sm:text-sm">
                편도
              </span>

              {/* Search Button */}
              <Link
                href="/search"
                className="ml-1 flex h-7 w-7 items-center justify-center rounded-full bg-white/20 transition-colors hover:bg-white/30 sm:ml-2 sm:h-8 sm:w-8"
                aria-label="검색"
              >
                <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
