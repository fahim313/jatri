import heroBg from "../../assets/images/hero-bg.png";

function HeroSection() {
  return (
    <section
      className="relative flex min-h-[480px] items-center overflow-hidden bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: `url(${heroBg})` }}
    >
      <div className="absolute inset-0 bg-gradient-to-r from-white via-white/90 to-white/10" />

      <div className="relative z-10 mx-auto w-full max-w-7xl px-6 py-20">
        <div className="max-w-xl">
          <h1 className="text-4xl font-bold leading-tight text-blue-950 md:text-5xl">
            Your Trusted Partner for{" "}
            <span className="text-blue-600">
              Overseas Journey
            </span>
          </h1>

          <p className="mt-5 max-w-lg text-base leading-7 text-gray-700 md:text-lg">
            Find verified overseas jobs, check agencies,
            and get expert migration guidance — all in one place.
          </p>

          <div className="mt-8 flex flex-wrap gap-4">
            <a
              href="/jobs"
              className="rounded-lg bg-blue-600 px-7 py-3 font-semibold text-white shadow-md transition hover:bg-blue-700"
            >
              Find Jobs →
            </a>

            <a
              href="#services"
              className="rounded-lg border border-blue-200 bg-white px-7 py-3 font-semibold text-blue-950 transition hover:bg-blue-50"
            >
              Learn More
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

export default HeroSection;
