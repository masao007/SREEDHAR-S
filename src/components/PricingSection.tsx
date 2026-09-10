import { Check } from 'lucide-react';

interface PricingSectionProps {
  onOpenPostJob: () => void;
  onOpenAIMatcher: () => void;
}

export default function PricingSection({ onOpenPostJob, onOpenAIMatcher }: PricingSectionProps) {
  return (
    <section id="pricing" className="py-20 px-4 md:px-12 bg-[#101010] border-t border-[#1e1e1e]">
      <div className="max-w-6xl mx-auto">
        <div className="text-center max-w-md mx-auto mb-14">
          <div className="text-xs font-semibold uppercase tracking-wider text-[#35be35] mb-2">
            Transparent Pricing
          </div>
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-[#f2f2f2]">
            Free to find work.<br />Simple plans for employers.
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Worker Plan */}
          <div className="p-7 bg-[#161616] border border-[#222222] rounded-3xl flex flex-col justify-between shadow-xl">
            <div>
              <h3 className="font-display text-lg font-bold text-[#f2f2f2]">Worker</h3>
              <p className="text-xs text-[#999999] mt-1 mb-5">
                For individuals seeking part-time, weekend, or daily work
              </p>
              <div className="flex items-baseline gap-1 mb-6">
                <span className="font-display text-4xl font-bold text-[#f2f2f2]">Free</span>
                <span className="text-xs text-[#999999]">always</span>
              </div>

              <ul className="space-y-3 mb-8 text-xs text-[#999999]">
                {[
                  'Unlimited nearby job applications',
                  'PostGIS GPS spatial job discovery',
                  'Gemini AI compatibility matching',
                  'Instant UPI & IMPS daily payouts',
                  'Earnings tracker & tax receipts',
                  '₹200 referral rewards per friend',
                ].map((f, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-[#35be35] shrink-0" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
            </div>

            <button
              onClick={onOpenAIMatcher}
              className="w-full py-3 rounded-xl border border-[#2a2a2a] hover:border-[#35be35] text-[#f2f2f2] hover:text-[#5cd65c] text-xs font-bold transition-all cursor-pointer"
            >
              Sign up as Worker (Free)
            </button>
          </div>

          {/* Employer Basic */}
          <div className="p-7 bg-[#071507] border border-[#1f6b1f] rounded-3xl flex flex-col justify-between relative shadow-[0_0_25px_rgba(53,190,53,0.1)]">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-[#35be35] text-[#080808] text-[10px] font-bold uppercase tracking-wider">
              Most Popular for Local Shops
            </div>

            <div>
              <h3 className="font-display text-lg font-bold text-[#f2f2f2]">Employer Basic</h3>
              <p className="text-xs text-[#999999] mt-1 mb-5">
                For small businesses, local retail shops, and restaurants
              </p>
              <div className="flex items-baseline gap-1 mb-6">
                <span className="font-display text-4xl font-bold text-[#5cd65c]">Free</span>
                <span className="text-xs text-[#999999]">forever free</span>
              </div>

              <ul className="space-y-3 mb-8 text-xs text-[#999999]">
                {[
                  'Post up to 10 active works per month',
                  'View all verified applicant profiles',
                  'In-app instant chat & shift booking',
                  'Verified worker ratings & history',
                  'Automated UPI payout distribution',
                  'Basic hiring analytics dashboard',
                ].map((f, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-[#35be35] shrink-0" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
            </div>

            <button
              onClick={onOpenPostJob}
              className="w-full py-3 rounded-xl bg-[#35be35] hover:bg-[#5cd65c] text-[#080808] text-xs font-bold transition-all shadow-lg shadow-[#35be35]/20 cursor-pointer"
            >
              Start Hiring for Free
            </button>
          </div>

          {/* Employer Pro */}
          <div className="p-7 bg-[#161616] border border-[#222222] rounded-3xl flex flex-col justify-between shadow-xl">
            <div>
              <h3 className="font-display text-lg font-bold text-[#f2f2f2]">Employer Pro</h3>
              <p className="text-xs text-[#999999] mt-1 mb-5">
                For large delivery fleets, event agencies & warehousing hubs
              </p>
              <div className="flex items-baseline gap-1 mb-6">
                <span className="font-display text-4xl font-bold text-[#f2f2f2]">₹99</span>
                <span className="text-xs text-[#999999]">/ month</span>
              </div>

              <ul className="space-y-3 mb-8 text-xs text-[#999999]">
                {[
                  'Unlimited job postings across all cities',
                  'AI-prioritized candidate ranking',
                  'Bulk applicant dispatch & SMS broadcast',
                  'Advanced analytics & attendance logs',
                  'Dedicated India account manager',
                  'REST API webhook access',
                ].map((f, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-[#35be35] shrink-0" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
            </div>

            <button
              onClick={onOpenPostJob}
              className="w-full py-3 rounded-xl border border-[#2a2a2a] hover:border-[#35be35] text-[#f2f2f2] hover:text-[#5cd65c] text-xs font-bold transition-all cursor-pointer"
            >
              Get Employer Pro (₹99/mo)
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
