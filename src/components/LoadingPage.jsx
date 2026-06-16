import React from 'react'
import { DotLottieReact } from '@lottiefiles/dotlottie-react'

const LoadingPage = () => {
  return (
    <section className="relative min-h-screen overflow-hidden bg-[#f5f3f0] px-6 py-12">
      <div className="absolute -left-20 top-16 h-56 w-56 rounded-full bg-[rgba(118,183,197,0.28)] blur-2xl" aria-hidden="true" />
      <div className="absolute -right-20 bottom-12 h-64 w-64 rounded-full bg-[rgba(239,118,122,0.20)] blur-2xl" aria-hidden="true" />

      <div className="animate-fade-up relative mx-auto flex min-h-[calc(100vh-96px)] w-[min(720px,100%)] flex-col items-center justify-between text-center">
        <div className="pt-6 max-sm:pt-2">
          <p className="mb-3 mt-0 text-[10px] font-bold uppercase tracking-[0.22em] text-[#2e5f8a]">
            The Perfect Paw
          </p>
          <h1 className="m-0 max-w-[560px] font-serif text-[clamp(30px,7vw,54px)] leading-tight tracking-[-0.02em] text-[#0F2A44]">
            Getting tails wagging and biscuits baking
          </h1>
        </div>

        <div className="w-[min(260px,68vw)]" aria-hidden="true">
          <DotLottieReact
            src="https://lottie.host/05dbf12e-621b-4470-8387-328eeafa0aa5/lFmLr3ziuE.lottie"
            loop
            autoplay
            style={{ backgroundColor: 'transparent', mixBlendMode: 'multiply' }}
          />
        </div>

        <div className="mb-8 flex w-[min(260px,100%)] items-center gap-3 max-sm:mb-3">
          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-[#ede3e4]">
            <div className="h-full w-2/3 rounded-full bg-[#ef767a] animate-pulse" />
          </div>
          <img className="w-4 animate-heartbeat" src="/icons/heart.svg" alt="" aria-hidden="true" />
        </div>
      </div>
    </section>
  )
}

export default LoadingPage
