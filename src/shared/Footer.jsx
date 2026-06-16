import { Link } from 'react-router'

const Footer = () => {
  return (
    <footer className="bg-[#edecea] pt-14 pb-9">
      <div className="w-[min(1500px,calc(100%-96px))] mx-auto flex items-start justify-between gap-12 flex-wrap max-sm:w-[calc(100%-32px)] max-sm:gap-8">
        <div className="flex-[1_1_280px] min-w-[220px]">
          <div className="flex items-center gap-2.5 font-serif text-[22px] font-bold text-[#2f3034]">
            <img className="w-[26px]" src="/icons/paw.svg" alt="" />
            <span>The Perfect Paw</span>
          </div>
          <p className="mt-4 max-w-[340px] text-[#7a7b80] text-[15px] leading-[1.6]">
            Connecting loving families with dogs and cats in need since 2026.
          </p>
        </div>

        <nav className="flex gap-14 flex-[2_1_560px] justify-end flex-wrap max-sm:justify-start max-sm:gap-8" aria-label="Footer">
          <div className="min-w-[130px]">
            <h3 className="m-0 text-[13px] uppercase tracking-widest text-[#0F2A44] font-semibold">Adopt</h3>
            <Link to="/pets" className="block mt-3 text-[#7a7b80] no-underline text-[15px] leading-snug hover:text-[#2f3034]">View Adoptable Pets</Link>
            <Link to="/course" className="block mt-3 text-[#7a7b80] no-underline text-[15px] leading-snug hover:text-[#2f3034]">Adoption Course</Link>
            <Link to="/applications" className="block mt-3 text-[#7a7b80] no-underline text-[15px] leading-snug hover:text-[#2f3034]">Applications</Link>
          </div>
          <div className="min-w-[130px]">
            <h3 className="m-0 text-[13px] uppercase tracking-widest text-[#0F2A44] font-semibold">Get Involved</h3>
            <a href="mailto:info@theperfectpaw.org?subject=Volunteer%20with%20The%20Perfect%20Paw" className="block mt-3 text-[#7a7b80] no-underline text-[15px] leading-snug hover:text-[#2f3034]">Volunteer</a>
            <a href="mailto:info@theperfectpaw.org?subject=Foster%20with%20The%20Perfect%20Paw" className="block mt-3 text-[#7a7b80] no-underline text-[15px] leading-snug hover:text-[#2f3034]">Foster</a>
            <a href="mailto:info@theperfectpaw.org?subject=Donate%20to%20The%20Perfect%20Paw" className="block mt-3 text-[#7a7b80] no-underline text-[15px] leading-snug hover:text-[#2f3034]">Donate</a>
          </div>
          <div className="min-w-[130px]">
            <h3 className="m-0 text-[13px] uppercase tracking-widest text-[#0F2A44] font-semibold">Contact</h3>
            <a href="mailto:info@theperfectpaw.org" className="block mt-3 text-[#7a7b80] no-underline text-[15px] leading-snug hover:text-[#2f3034]">info@theperfectpaw.org</a>
            <a href="tel:+15551234567" className="block mt-3 text-[#7a7b80] no-underline text-[15px] leading-snug hover:text-[#2f3034]">(555) 123-4567</a>
            <a href="https://www.google.com/maps/search/?api=1&query=123%20Rescue%20Lane" target="_blank" rel="noreferrer" className="block mt-3 text-[#7a7b80] no-underline text-[15px] leading-snug hover:text-[#2f3034]">123 Rescue Lane</a>
          </div>
        </nav>
      </div>

      <div className="w-[min(1500px,calc(100%-96px))] h-px bg-[#d4d4d6] mt-10 mx-auto max-sm:w-[calc(100%-32px)]" aria-hidden="true"></div>
      <p className="mt-6 text-center text-[#7a7b80] text-[13px]">© 2026 CraftedByGina. All rights reserved.</p>
    </footer>
  )
}

export default Footer

