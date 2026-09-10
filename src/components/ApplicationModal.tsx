import { useState, FormEvent } from 'react';
import { Job, UserProfile } from '../types';
import { CheckCircle2, ShieldCheck, MapPin, DollarSign, Send, Zap } from 'lucide-react';
import confetti from 'canvas-confetti';

interface ApplicationModalProps {
  job: Job | null;
  user: UserProfile;
  isOpen: boolean;
  onClose: () => void;
  onSubmitApplication: (jobId: string, message: string) => Promise<void>;
}

export default function ApplicationModal({
  job,
  user,
  isOpen,
  onClose,
  onSubmitApplication,
}: ApplicationModalProps) {
  const [message, setMessage] = useState('I am available immediately and have direct experience with this role.');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen || !job) return null;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSubmitApplication(job.id, message);
      setIsSubmitting(false);
      setIsSuccess(true);
      confetti({
        particleCount: 60,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#35be35', '#5cd65c', '#cbf4cb'],
      });
      setTimeout(() => {
        setIsSuccess(false);
        onClose();
      }, 2500);
    } catch (err) {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in">
      <div className="bg-[#161616] border border-[#2a2a2a] rounded-3xl w-full max-w-lg p-6 sm:p-8 shadow-2xl relative">
        {/* Header */}
        <div className="flex items-start justify-between mb-5">
          <div>
            <span className="text-[11px] font-bold text-[#35be35] uppercase tracking-wider">
              1-Tap Fast Application
            </span>
            <h3 className="font-display text-xl font-bold text-[#f2f2f2] mt-0.5">
              {job.title}
            </h3>
            <p className="text-xs text-[#999999]">{job.employer_name} · {job.location_address}</p>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-[#999999] hover:text-[#f2f2f2] rounded-lg hover:bg-[#222222] cursor-pointer"
          >
            ✕
          </button>
        </div>

        {isSuccess ? (
          <div className="py-8 text-center space-y-3 animate-in zoom-in-95">
            <div className="w-16 h-16 rounded-full bg-[#164516] border border-[#35be35] flex items-center justify-center text-3xl mx-auto text-[#5cd65c]">
              ✓
            </div>
            <h4 className="font-display text-lg font-bold text-[#f2f2f2]">
              Application Dispatched!
            </h4>
            <p className="text-xs text-[#999999] max-w-xs mx-auto">
              {job.employer_name} received your profile with verified phone ({user.phone}) and {user.rating}★ rating.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Pay & Timing Card */}
            <div className="p-3.5 rounded-xl bg-[#101010] border border-[#222222] flex items-center justify-between text-xs">
              <div>
                <div className="text-[#999999]">Payout Rate</div>
                <div className="font-display text-base font-bold text-[#5cd65c] mt-0.5">
                  {job.pay_display}
                </div>
              </div>
              <div className="text-right">
                <div className="text-[#999999]">Distance</div>
                <div className="font-semibold text-[#f2f2f2] mt-0.5">
                  {job.distance_km ?? 1.2} km away
                </div>
              </div>
            </div>

            {/* Applicant Profile Confirmation */}
            <div className="p-3.5 rounded-xl bg-[#121212] border border-[#222222] space-y-2">
              <div className="text-[11px] font-semibold text-[#555555] uppercase">
                Sending As:
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-[#f2f2f2]">{user.name}</span>
                <span className="text-[#5cd65c] font-semibold">{user.rating} ★ Rating</span>
              </div>
              <div className="text-[11px] text-[#999999] flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-[#35be35]" />
                <span>Verified Contact: {user.phone}</span>
              </div>
            </div>

            {/* Custom Note */}
            <div>
              <label className="block text-xs font-semibold text-[#999999] mb-1.5">
                Quick Introduction Note (Optional)
              </label>
              <textarea
                rows={3}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#101010] border border-[#2a2a2a] text-xs text-[#f2f2f2] focus:border-[#35be35] outline-none resize-none leading-relaxed"
                placeholder="Mention vehicle availability or start timing..."
              />
            </div>

            {/* Submit Action */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs text-[#999999] hover:text-[#f2f2f2] cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2.5 rounded-xl bg-[#35be35] hover:bg-[#5cd65c] text-[#080808] font-bold text-xs flex items-center gap-1.5 transition-all shadow-lg shadow-[#35be35]/20 cursor-pointer"
              >
                {isSubmitting ? (
                  <span>Submitting...</span>
                ) : (
                  <>
                    <Zap className="w-3.5 h-3.5" />
                    <span>Confirm & Apply Now</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
