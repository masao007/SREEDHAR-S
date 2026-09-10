import { useState, FormEvent } from 'react';
import { EarningsSummary } from '../types';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import {
  TrendingUp,
  CreditCard,
  Download,
  Gift,
  CheckCircle2,
  ArrowUpRight,
  ShieldAlert,
  Wallet,
  Coins,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface EarningsTrackerProps {
  summary: EarningsSummary;
  onRequestPayout: (amount: number, upiId: string) => Promise<void>;
}

export default function EarningsTracker({
  summary,
  onRequestPayout,
}: EarningsTrackerProps) {
  const [showPayoutModal, setShowPayoutModal] = useState(false);
  const [payoutAmount, setPayoutAmount] = useState('2400');
  const [upiId, setUpiId] = useState('ravi@oksbi');
  const [isProcessing, setIsProcessing] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleWithdraw = async (e: FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    try {
      await onRequestPayout(Number(payoutAmount), upiId);
      setIsProcessing(false);
      setShowPayoutModal(false);
      setSuccessMessage(`₹${payoutAmount} transferred to ${upiId} instantly via UPI.`);
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.7 },
        colors: ['#10b981', '#34d399', '#6ee7b7'],
      });
      setTimeout(() => setSuccessMessage(null), 6000);
    } catch (err) {
      setIsProcessing(false);
    }
  };

  const chartData = summary.monthlyStats;

  return (
    <section id="earnings" className="py-12 px-4 md:px-8 bg-[#080808] border-b border-gray-800">
      <div className="max-w-7xl mx-auto">
        {/* Success Alert Banner */}
        {successMessage && (
          <div className="mb-6 p-3 rounded bg-emerald-950/40 border border-emerald-800 flex items-center justify-between text-emerald-300 text-xs font-semibold animate-in fade-in">
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>{successMessage}</span>
            </div>
            <button
              onClick={() => setSuccessMessage(null)}
              className="text-gray-400 hover:text-white"
            >
              ✕
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: High-Density Analytics Highlights (Col 5/12) */}
          <div className="lg:col-span-5 space-y-4">
            <div>
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-1 flex items-center gap-1.5">
                <Wallet className="w-3.5 h-3.5 text-emerald-500" />
                Disbursement & Wallet
              </h3>
              <h2 className="font-display text-2xl sm:text-3xl font-black uppercase tracking-tight text-white">
                Earnings Performance
              </h2>
              <p className="text-xs text-gray-400 mt-2 leading-relaxed">
                Automated shift reconciliation, daily UPI payouts, and verified tax deduction receipts.
              </p>
            </div>

            <div className="space-y-3 pt-1">
              <div className="bg-[#0c0c0c] border border-gray-800 p-3.5 rounded flex items-start space-x-3">
                <div className="w-8 h-8 rounded bg-[#141414] border border-gray-800 flex items-center justify-center text-sm shrink-0">
                  📊
                </div>
                <div>
                  <h4 className="font-bold text-white text-xs uppercase tracking-wide">
                    Real-time Ledger Sync
                  </h4>
                  <p className="text-[11px] text-gray-400 mt-0.5 leading-normal">
                    Interactive shifts breakdown with instantaneous UPI reconciliation.
                  </p>
                </div>
              </div>

              <div className="bg-[#0c0c0c] border border-gray-800 p-3.5 rounded flex items-start space-x-3">
                <div className="w-8 h-8 rounded bg-[#141414] border border-gray-800 flex items-center justify-center text-sm shrink-0">
                  ⚡
                </div>
                <div>
                  <h4 className="font-bold text-white text-xs uppercase tracking-wide">
                    24/7 UPI & IMPS Instant Payout
                  </h4>
                  <p className="text-[11px] text-gray-400 mt-0.5 leading-normal">
                    Direct transfer to PhonePe, Google Pay, Paytm, or BHIM UPI in under 30 seconds.
                  </p>
                </div>
              </div>

              <div className="bg-[#0c0c0c] border border-gray-800 p-3.5 rounded flex items-start space-x-3">
                <div className="w-8 h-8 rounded bg-[#141414] border border-gray-800 flex items-center justify-center text-sm shrink-0">
                  🎁
                </div>
                <div>
                  <h4 className="font-bold text-white text-xs uppercase tracking-wide">
                    ₹200 Worker Referral Credit
                  </h4>
                  <p className="text-[11px] text-gray-400 mt-0.5 leading-normal">
                    Earn credited rewards when peer workers sign up and verify their credentials.
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={() => setShowPayoutModal(true)}
                className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-500 text-black font-black text-xs uppercase tracking-wider px-4 py-2.5 rounded flex items-center justify-center space-x-2 transition-colors cursor-pointer"
              >
                <CreditCard className="w-3.5 h-3.5" />
                <span>Withdraw via UPI</span>
              </button>
            </div>
          </div>

          {/* Right Column: Recharts High-Density Chart Box (Col 7/12) */}
          <div className="lg:col-span-7 bg-[#0c0c0c] border border-gray-800 rounded-lg p-5 shadow-2xl relative overflow-hidden">
            {/* Header with Metrics */}
            <div className="flex items-start justify-between mb-5 pb-4 border-b border-gray-800">
              <div>
                <span className="text-[10px] text-gray-500 uppercase font-bold tracking-wider block">
                  Current Month Revenue (June)
                </span>
                <div className="font-display text-3xl sm:text-4xl font-black text-emerald-400 tracking-tight mt-0.5">
                  ₹{summary.currentMonthEarned.toLocaleString('en-IN')}
                </div>
                <div className="text-[11px] text-gray-400 mt-1 flex items-center space-x-1.5">
                  <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{summary.bestMonthLabel} record peak (+{summary.monthGrowthPercentage}%)</span>
                </div>
              </div>

              <div className="text-right">
                <span className="text-[10px] text-gray-500 uppercase font-bold tracking-wider block">
                  Lifetime Total
                </span>
                <div className="text-base font-bold text-white mt-0.5">
                  ₹{summary.totalEarned.toLocaleString('en-IN')}
                </div>
              </div>
            </div>

            {/* Recharts High-Density Bar Chart */}
            <div className="w-full h-40 mb-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <XAxis
                    dataKey="month"
                    stroke="#4b5563"
                    fontSize={10}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    stroke="#4b5563"
                    fontSize={9}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(val) => `₹${val / 1000}k`}
                  />
                  <Tooltip
                    cursor={{ fill: 'rgba(16,185,129,0.05)' }}
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="bg-[#0c0c0c] border border-gray-700 p-2 rounded shadow-xl text-xs font-sans">
                            <div className="font-bold text-white">{data.month} 2026</div>
                            <div className="text-emerald-400 font-black text-xs mt-0.5">
                              ₹{data.amount.toLocaleString('en-IN')}
                            </div>
                            <div className="text-gray-400 text-[10px] mt-0.5">
                              {data.jobsCount} completed shifts
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar dataKey="amount" radius={[3, 3, 0, 0]}>
                    {chartData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.isPeak ? '#10b981' : '#064e3b'}
                        stroke={entry.isPeak ? '#34d399' : '#047857'}
                        strokeWidth={1}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* High Density Metric Counter Grid */}
            <div className="grid grid-cols-3 gap-2.5 pt-2">
              <div className="bg-[#141414] border border-gray-800 rounded p-2.5">
                <div className="font-display text-base font-black text-white">
                  {summary.completedJobsCount}
                </div>
                <div className="text-[10px] text-gray-500 uppercase font-semibold mt-0.5">Works Done</div>
              </div>
              <div className="bg-[#141414] border border-gray-800 rounded p-2.5">
                <div className="font-display text-base font-black text-white">
                  {summary.averageRating} ★
                </div>
                <div className="text-[10px] text-gray-500 uppercase font-semibold mt-0.5">Worker Score</div>
              </div>
              <div className="bg-[#141414] border border-gray-800 rounded p-2.5">
                <div className="font-display text-base font-black text-emerald-400">
                  ₹{summary.referralBonus}
                </div>
                <div className="text-[10px] text-gray-500 uppercase font-semibold mt-0.5">Referral Bonus</div>
              </div>
            </div>

            {/* Category Breakdown Progress */}
            <div className="mt-4 pt-3 border-t border-gray-800">
              <div className="text-[10px] font-bold text-gray-500 uppercase mb-1.5 flex items-center justify-between">
                <span>Distribution by Vertical</span>
                <span className="text-emerald-400">Delivery 59%</span>
              </div>
              <div className="flex h-1.5 rounded overflow-hidden bg-gray-900 gap-0.5">
                <div className="bg-emerald-500" style={{ width: '59%' }} title="Delivery ₹8,400" />
                <div className="bg-emerald-600" style={{ width: '20%' }} title="Data Entry ₹2,800" />
                <div className="bg-emerald-700" style={{ width: '13%' }} title="Event Staff ₹1,800" />
                <div className="bg-emerald-800" style={{ width: '8%' }} title="Restaurant ₹1,200" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Instant UPI Payout Modal */}
      {showPayoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-[#0c0c0c] border border-gray-700 rounded-lg w-full max-w-md p-5 shadow-2xl relative">
            <h3 className="font-display text-base font-black uppercase text-white mb-1">
              Instant UPI Payout
            </h3>
            <p className="text-xs text-gray-400 mb-4">
              Available Balance: <strong className="text-emerald-400">₹{summary.currentMonthEarned.toLocaleString('en-IN')}</strong>
            </p>

            <form onSubmit={handleWithdraw} className="space-y-3.5">
              <div>
                <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                  Withdrawal Amount (₹)
                </label>
                <input
                  type="number"
                  min="100"
                  max={summary.currentMonthEarned}
                  value={payoutAmount}
                  onChange={(e) => setPayoutAmount(e.target.value)}
                  className="w-full px-3 py-2 rounded bg-[#141414] border border-gray-700 text-xs text-white focus:border-emerald-500 outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                  UPI ID / VPA
                </label>
                <input
                  type="text"
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                  placeholder="e.g. yourname@oksbi / mobile@paytm"
                  className="w-full px-3 py-2 rounded bg-[#141414] border border-gray-700 text-xs text-white focus:border-emerald-500 outline-none"
                  required
                />
              </div>

              <div className="p-2.5 bg-[#141414] rounded border border-gray-800 text-[10px] text-gray-400 leading-normal">
                ⚡ Powered by NPCI UPI Instant Settlement. Payout arrives in under 30 seconds.
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowPayoutModal(false)}
                  className="px-3 py-1.5 text-xs font-bold text-gray-400 hover:text-white uppercase tracking-wider cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isProcessing}
                  className="px-4 py-1.5 rounded bg-emerald-600 hover:bg-emerald-500 text-black font-black text-xs uppercase tracking-wider cursor-pointer transition-colors"
                >
                  {isProcessing ? 'Transferring...' : 'Transfer to UPI Now'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}
