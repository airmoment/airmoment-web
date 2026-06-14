import { HomeSearchBar } from "@/components/home-search-bar"

export default function Home() {
  return (
    <main className="relative min-h-screen">
      {/* Background Image with Gradient Overlay */}
      <div className="absolute inset-0 z-0">
        <img
          src="/images/airplane-bg.png"
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

          <HomeSearchBar />
        </div>
      </section>
    </main>
  )
}
