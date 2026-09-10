export default function HowItWorks() {
  return (
    <section id="how" className="py-20 px-4 md:px-12 bg-[#101010] border-t border-b border-[#1e1e1e]">
      <div className="max-w-6xl mx-auto">
        <div className="text-xs font-semibold uppercase tracking-wider text-[#35be35] mb-2">
          How It Works
        </div>
        <h2 className="font-display text-3xl sm:text-4xl font-bold text-[#f2f2f2] leading-tight">
          From sign-up to first paycheck<br className="hidden sm:inline" /> in under 24 hours
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-0.5 mt-12 border border-[#1e1e1e] rounded-3xl overflow-hidden shadow-xl">
          {/* Step 1 */}
          <div className="p-8 sm:p-10 bg-[#161616] relative group hover:bg-[#1a1a1a] transition-colors">
            <div className="font-display text-5xl font-bold text-[#0d2b0d] group-hover:text-[#164516] transition-colors absolute top-6 right-8 select-none">
              01
            </div>
            <div className="w-12 h-12 rounded-2xl bg-[#35be35]/10 border border-[#35be35]/25 flex items-center justify-center text-2xl mb-6 shadow-sm">
              📍
            </div>
            <h3 className="font-display text-lg font-bold text-[#f2f2f2] mb-2">
              Share your location
            </h3>
            <p className="text-xs sm:text-sm text-[#999999] leading-relaxed">
              We use GPS spatial queries to discover jobs within 1–10 km of you. Set your distance preference and see what's available right now.
            </p>
          </div>

          {/* Step 2 */}
          <div className="p-8 sm:p-10 bg-[#161616] relative group hover:bg-[#1a1a1a] transition-colors border-t md:border-t-0 md:border-l border-[#1e1e1e]">
            <div className="font-display text-5xl font-bold text-[#0d2b0d] group-hover:text-[#164516] transition-colors absolute top-6 right-8 select-none">
              02
            </div>
            <div className="w-12 h-12 rounded-2xl bg-[#35be35]/10 border border-[#35be35]/25 flex items-center justify-center text-2xl mb-6 shadow-sm">
              🤖
            </div>
            <h3 className="font-display text-lg font-bold text-[#f2f2f2] mb-2">
              Get matched by AI
            </h3>
            <p className="text-xs sm:text-sm text-[#999999] leading-relaxed">
              Our Gemini AI reads your skills and schedule, then surfaces jobs with the highest compatibility score — not just the newest postings.
            </p>
          </div>

          {/* Step 3 */}
          <div className="p-8 sm:p-10 bg-[#161616] relative group hover:bg-[#1a1a1a] transition-colors border-t md:border-t-0 md:border-l border-[#1e1e1e]">
            <div className="font-display text-5xl font-bold text-[#0d2b0d] group-hover:text-[#164516] transition-colors absolute top-6 right-8 select-none">
              03
            </div>
            <div className="w-12 h-12 rounded-2xl bg-[#35be35]/10 border border-[#35be35]/25 flex items-center justify-center text-2xl mb-6 shadow-sm">
              💸
            </div>
            <h3 className="font-display text-lg font-bold text-[#f2f2f2] mb-2">
              Work and get paid
            </h3>
            <p className="text-xs sm:text-sm text-[#999999] leading-relaxed">
              Apply in one tap, chat directly with employers, complete the job, and receive payment instantly directly to your UPI ID or bank account.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
