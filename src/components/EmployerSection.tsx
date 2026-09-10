interface EmployerSectionProps {
  onOpenPostJob: () => void;
}

export default function EmployerSection({ onOpenPostJob }: EmployerSectionProps) {
  return (
    <section id="employers" className="py-20 px-4 md:px-12 bg-[#101010] border-t border-b border-[#1e1e1e]">
      <div className="max-w-6xl mx-auto">
        <div className="text-center max-w-xl mx-auto mb-14">
          <div className="text-xs font-semibold uppercase tracking-wider text-[#35be35] mb-2">
            For Employers & Local Businesses
          </div>
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-[#f2f2f2]">
            Hire verified part-time workers in minutes
          </h2>
          <p className="text-sm text-[#999999] mt-3 leading-relaxed">
            Post a work, set your hourly rate, and receive matched candidates within hours — zero recruiter fees.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-0.5 border border-[#1e1e1e] rounded-3xl overflow-hidden shadow-xl mb-12">
          <div className="p-7 bg-[#161616] relative hover:bg-[#1a1a1a] transition-colors">
            <div className="font-display text-4xl font-bold text-[#0d2b0d] absolute top-5 right-6 select-none">
              01
            </div>
            <div className="w-10 h-10 rounded-xl bg-[#35be35]/10 flex items-center justify-center text-xl mb-4">
              📝
            </div>
            <h4 className="font-display text-base font-bold text-[#f2f2f2] mb-1.5">
              Post your job
            </h4>
            <p className="text-xs text-[#999999] leading-relaxed">
              Describe the shift, pay, hours, and address. Takes under 2 minutes.
            </p>
          </div>

          <div className="p-7 bg-[#161616] relative hover:bg-[#1a1a1a] transition-colors border-t sm:border-t-0 sm:border-l border-[#1e1e1e]">
            <div className="font-display text-4xl font-bold text-[#0d2b0d] absolute top-5 right-6 select-none">
              02
            </div>
            <div className="w-10 h-10 rounded-xl bg-[#35be35]/10 flex items-center justify-center text-xl mb-4">
              👥
            </div>
            <h4 className="font-display text-base font-bold text-[#f2f2f2] mb-1.5">
              Review applicants
            </h4>
            <p className="text-xs text-[#999999] leading-relaxed">
              See verified profiles with ratings, past completed works, and skills.
            </p>
          </div>

          <div className="p-7 bg-[#161616] relative hover:bg-[#1a1a1a] transition-colors border-t lg:border-t-0 lg:border-l border-[#1e1e1e]">
            <div className="font-display text-4xl font-bold text-[#0d2b0d] absolute top-5 right-6 select-none">
              03
            </div>
            <div className="w-10 h-10 rounded-xl bg-[#35be35]/10 flex items-center justify-center text-xl mb-4">
              💬
            </div>
            <h4 className="font-display text-base font-bold text-[#f2f2f2] mb-1.5">
              Chat & confirm
            </h4>
            <p className="text-xs text-[#999999] leading-relaxed">
              Message candidates directly in-app, share location details, and confirm the shift.
            </p>
          </div>

          <div className="p-7 bg-[#161616] relative hover:bg-[#1a1a1a] transition-colors border-t sm:border-t-0 sm:border-l border-[#1e1e1e]">
            <div className="font-display text-4xl font-bold text-[#0d2b0d] absolute top-5 right-6 select-none">
              04
            </div>
            <div className="w-10 h-10 rounded-xl bg-[#35be35]/10 flex items-center justify-center text-xl mb-4">
              ⭐
            </div>
            <h4 className="font-display text-base font-bold text-[#f2f2f2] mb-1.5">
              Rate the worker
            </h4>
            <p className="text-xs text-[#999999] leading-relaxed">
              Leave a review and build a reliable trusted roster for recurring weekly shifts.
            </p>
          </div>
        </div>

        <div className="text-center">
          <button
            onClick={onOpenPostJob}
            className="px-6 py-3 rounded-xl bg-[#35be35] hover:bg-[#5cd65c] text-[#080808] font-bold text-sm transition-all shadow-lg shadow-[#35be35]/15 cursor-pointer font-sans"
          >
            Post a Job for Free →
          </button>
        </div>
      </div>
    </section>
  );
}
