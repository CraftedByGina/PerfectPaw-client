import { Link } from 'react-router'
import { DotLottieReact } from '@lottiefiles/dotlottie-react'

const Home = () => {
  return (
    <>
      {/* Top section */}

      <section className="w-[min(1500px,calc(100%-96px))] mx-auto flex items-stretch gap-[72px] pt-[82px] pb-[44px] max-lg:flex-col max-lg:gap-12 max-sm:w-[calc(100%-32px)] max-sm:pt-7">
        <div className="flex-[1_1_560px]">
          <h1 className="animate-fade-up m-0 font-serif text-[clamp(56px,6vw,104px)] leading-[0.95] tracking-[-0.02em] text-[#0F2A44]">
            Find Your New Best Friend
          </h1>
          <p className="animate-fade-up-delay-1 mt-[26px] max-w-[540px] text-[#67686d] text-[20px] leading-[1.55] font-light max-lg:text-[18px] max-sm:mt-4">
          We connect adopters with trusted shelters and rescue partners to help dogs and cats find loving homes.
          Start your adoption journey with confidence.
          </p>
          <div className="animate-fade-up-delay-2 mt-7 flex flex-wrap gap-4 max-sm:flex-col">
            <button className="animate-heartbeat flex items-center justify-center gap-[14px] rounded-lg border-2 border-transparent bg-[#ef767a] px-[18px] py-[10px] text-base font-semibold text-[#f6f6f6] cursor-pointer max-lg:text-[16px] max-sm:w-full max-sm:text-[15px]">
              Adopt a Pet
              <img className="w-5" src="/icons/heart.svg" alt="" aria-hidden="true" />
            </button>
            <button className="rounded-lg border-2 border-[#45464a] bg-[#f6f6f7] px-[18px] py-[10px] text-base font-semibold text-[#333439] cursor-pointer max-lg:text-[16px] max-sm:w-full max-sm:text-[15px]">
              Learn About Adoption
            </button>
          </div>
          <div className="mt-5 w-[min(500px,100%)] max-lg:w-[min(420px,100%)] max-sm:mx-auto max-sm:w-[min(360px,92vw)]" aria-hidden="true">
            <DotLottieReact
              src="https://lottie.host/c1525885-a3f4-47a0-bc60-6c1641bad5dd/PyArX2iabK.lottie"
              loop
              autoplay
              style={{ backgroundColor: 'transparent', mixBlendMode: 'multiply' }}
            />
          </div>
        </div>
        <div className="flex-[0_1_48%] min-w-[360px] max-lg:min-w-0" aria-hidden="true">
          <div className="relative h-[560px] max-lg:h-[440px] max-sm:h-[420px]">
            <div className="absolute top-0 right-0 w-[min(520px,92%)] h-[220px] rounded-[32px] overflow-hidden shadow-[0_18px_40px_rgba(15,42,68,0.12)] border border-[rgba(46,95,138,0.22)] bg-gradient-to-br from-[rgba(118,183,197,0.45)] to-[rgba(76,162,181,0.10)] max-lg:h-[190px] max-lg:w-[min(520px,100%)] max-sm:h-[175px] max-sm:w-[82%] max-sm:rounded-[24px]">
              <img className="w-full h-full object-cover block" src="/images/woman.png" alt="" aria-hidden="true" />
            </div>
            <div className="absolute bottom-0 left-0 w-full h-[320px] rounded-[36px] overflow-hidden shadow-[0_18px_40px_rgba(15,42,68,0.12)] border border-[rgba(46,95,138,0.22)] bg-gradient-to-br from-[rgba(245,224,183,0.42)] to-[rgba(239,118,122,0.10)] max-lg:h-[260px] max-sm:h-[220px] max-sm:rounded-[28px]">
              <img className="w-full h-full object-cover block" src="/images/family.png" alt="" aria-hidden="true" />
            </div>
            <div className="animate-float absolute top-[18px] left-[18px] px-4 py-[14px] rounded-[18px] bg-[rgba(237,227,228,0.62)] border border-[rgba(239,118,122,0.18)] backdrop-blur-[10px] max-sm:top-4 max-sm:left-4 max-sm:px-3 max-sm:py-2 max-sm:rounded-[14px]">
              <span className="block text-[40px] font-extrabold tracking-[-0.02em] text-[#0F2A44] max-sm:text-[30px]">10k+</span>
              <span className="block mt-1 text-base text-[rgba(15,42,68,0.72)] max-sm:text-[13px]">Happy Adoptions</span>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Pets */}
      <section className="w-[min(1500px,calc(100%-96px))] mx-auto mt-11 max-sm:w-[calc(100%-32px)]">
        <header>
          <h2 className="m-0 mb-[22px] font-serif text-[clamp(34px,3.2vw,52px)] text-[#0F2A44]">Pets of the Week</h2>
        </header>
        <div className="flex flex-wrap gap-[22px]">
          {[
            { name: 'Buddy', age: '2 years', img: '/images/dog.png', blurb: 'Loves fetch, belly rubs, and stealing socks.' },
            { name: 'Luna', age: '1 year', img: '/images/cat.png', blurb: 'Will judge you silently, then fall asleep on you.' },
            { name: 'Max', age: '4 years', img: '/images/dog.png', blurb: 'Gentle giant who thinks he\'s a lap dog.' },
          ].map((pet) => (
            <article key={pet.name} className="pet-card flex-[1_1_300px] rounded-[20px] bg-white overflow-hidden flex flex-col shadow-[0_2px_12px_rgba(15,42,68,0.07)] max-sm:basis-auto">
              <div className="h-[180px] flex items-center justify-center bg-[#efeff0] max-lg:h-[160px]" aria-hidden="true">
                <img className="w-full h-full object-cover block" src={pet.img} alt="" aria-hidden="true" />
              </div>
              <div className="p-[18px_18px_20px]">
                <h3 className="m-0 font-serif text-[28px] text-[#0F2A44]">{pet.name}</h3>
                <p className="mt-[6px] mb-1 text-[#67686d] text-sm italic leading-snug">{pet.blurb}</p>
                <p className="mt-[6px] mb-4 text-[#6c6d72] text-base">Age: {pet.age}</p>
                <button className="flex items-center gap-[14px] rounded-lg border-2 border-transparent bg-[#ef767a] px-[14px] py-[9px] text-[14px] font-semibold text-[#f6f6f6] cursor-pointer">
                  I want to meet {pet.name}!
                </button>
              </div>
            </article>
          ))}
        </div>
        <div className="mt-8 flex justify-center">
          <Link
            to="/pets"
            className="inline-flex items-center gap-2 rounded-full border-2 border-[#0F2A44] px-7 py-3 text-base font-semibold text-[#0F2A44] no-underline hover:bg-[#0F2A44] hover:text-white transition-colors"
          >
            View all pets <span aria-hidden="true">→</span>
          </Link>
        </div>
      </section>

      {/* Rescue partners */}
      <section className="relative w-[min(1500px,calc(100%-96px))] mx-auto mt-10 rounded-[20px] border border-[rgba(15,42,68,0.12)] bg-[#f9fbfc] px-8 py-7 max-sm:w-[calc(100%-32px)] max-sm:px-5 max-sm:py-6">
        <p className="m-0 text-[#2e5f8a] text-xs font-semibold uppercase tracking-widest">Rescue partnerships</p>
        <h2 className="mt-3 mb-0 font-serif text-[clamp(30px,2.8vw,42px)] text-[#0F2A44]">Helping More Pets Find Homes</h2>
        <div className="mt-4">
          <p className="mb-0 max-w-[900px] pr-[250px] text-[#55585f] text-[17px] leading-[1.65] max-lg:pr-0">
            We bring adoptable pets from trusted local rescues like <strong>Lucky Dog Refuge</strong> and <strong>Muddy Paws Rescue</strong>{' '}
            into one easy-to-browse platform, making it simpler to find your match and connect directly with the rescue caring for them.
          </p>
          <div className="absolute right-5 top-1/2 flex -translate-y-1/2 flex-col items-center max-lg:static max-lg:mt-5 max-lg:translate-y-0 max-lg:flex-row max-lg:justify-center" aria-label="Rescue partner badges">
            <img
              className="translate-y-10 h-[120px] w-[120px] object-contain max-lg:translate-y-0 max-sm:h-[88px] max-sm:w-[88px]"
              src="/images/LDR.png"
              alt="Lucky Dog Refuge logo"
            />
            <img
              className="h-[200px] w-[200px] object-contain max-sm:h-[130px] max-sm:w-[130px]"
              src="/images/MPR.png"
              alt="Muddy Paws Rescue logo"
            />
          </div>
        </div>
      </section>

      {/* Steps */}
      <section className="mt-[48px] pb-20">
        <div className="w-[min(1500px,calc(100%-96px))] mx-auto max-sm:w-[calc(100%-32px)]">
          <h2 className="mt-[120px] mb-[72px] text-center font-serif text-[clamp(46px,4.4vw,78px)] text-[#0F2A44] max-lg:mt-[72px]">
            How Adoption Works
          </h2>
          <div className="flex flex-wrap gap-6 text-center max-lg:gap-y-11 max-sm:flex-col">
            {[
              { num: '01', title: 'Browse Cats and Dogs', desc: 'Find a dog or cat that matches you!' },
              { num: '02', title: 'Take Course', desc: 'Complete our short adoption education course.' },
              { num: '03', title: 'Apply', desc: 'Submit your application for review.' },
              { num: '04', title: 'Meet & Greet', desc: 'Meet your potential new family member.' },
            ].map((step) => (
              <article key={step.num} className="flex-[1_1_220px] max-lg:basis-[calc(50%-12px)] max-sm:basis-auto">
                <span className="step-badge-anim w-[68px] aspect-square rounded-[20px] mx-auto flex items-center justify-center bg-[#0F2A44] bg-opacity-90 text-[#f2f2f2] text-lg font-semibold shadow-[0_4px_14px_rgba(15,42,68,0.18)]">
                  {step.num}
                </span>
                <h3 className="mt-[18px] mb-0 font-serif text-[30px] text-[#0F2A44]">{step.title}</h3>
                <p className="mt-[14px] mx-auto max-w-[260px] text-[#67686d] text-lg leading-[1.35]">{step.desc}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Course */}
      <section className="w-[min(1500px,calc(100%-96px))] mx-auto mt-[34px] bg-[#2e5f8a] rounded-[24px] overflow-hidden flex items-stretch max-lg:flex-col max-sm:w-[calc(100%-32px)] max-sm:mt-5 max-sm:rounded-[20px]">
        <div className="text-[#f4f4f4] flex-[1_1_560px] flex flex-col justify-center px-[58px] py-[58px] max-sm:px-[22px] max-sm:py-[32px]">
          <p className="m-0 text-[#ef767a] text-sm font-semibold uppercase tracking-widest">
            Before you apply
          </p>
          <h2 className="mt-4 mb-0 font-serif text-[clamp(36px,3.6vw,62px)] leading-[1.12]">Adoption Education Course</h2>
          <p className="mt-5 text-[#cbcdd1] text-[18px] leading-[1.6] max-w-[540px]">
            Preview our free 15-minute course on responsible pet ownership. Your completion
            is recorded after you apply for a specific pet, so the shelter can review it with
            that animal's application.
          </p>
          <Link
            to="/course"
            className="mt-7 self-start rounded-lg border-2 border-[rgba(255,255,255,0.5)] bg-transparent px-[22px] py-[9px] text-base font-semibold text-white cursor-pointer hover:bg-white hover:text-[#2e5f8a] transition-colors no-underline"
          >
            Preview Course
          </Link>
        </div>
        <div className="flex-[0_1_40%] min-h-[320px] max-lg:min-h-[240px] max-sm:flex max-sm:h-[190px] max-sm:min-h-0 max-sm:items-center max-sm:justify-center max-sm:overflow-hidden" aria-hidden="true">
          <DotLottieReact
            className="h-full w-full max-sm:h-[190px] max-sm:w-[min(360px,92vw)] max-sm:scale-125"
            src="https://lottie.host/3ecaa3bc-dc2a-461f-987a-c57f926c363b/oOrzY3DWX9.lottie"
            loop
            autoplay
          />
        </div>
      </section>

      {/* Pet insurance */}
      {/* <section className="w-[min(1500px,calc(100%-96px))] mx-auto mt-7 mb-6 rounded-[20px] border border-[rgba(15,42,68,0.12)] bg-[#f9fbfc] px-8 py-7 max-sm:px-5 max-sm:py-6">
        <p className="m-0 text-[#2e5f8a] text-xs font-semibold uppercase tracking-widest">Pet care planning</p>
        <h3 className="mt-3 mb-0 font-serif text-[clamp(26px,2.5vw,36px)] text-[#0F2A44]">Why Pet Insurance Matters</h3>
        <p className="mt-3 mb-0 max-w-[900px] text-[#55585f] text-[17px] leading-[1.65]">
          Pet insurance helps families handle unexpected vet costs and make health decisions based on care,
          not price. Even a basic plan can offer peace of mind and support a more secure, lifelong home
          for your new companion.
        </p>
      </section> */}
    </>
  )
}

export default Home
