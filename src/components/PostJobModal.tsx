import { useState, FormEvent } from 'react';
import { JobCategory, PayType } from '../types';
import { PlusCircle, MapPin, Sparkles, Building2, DollarSign } from 'lucide-react';

interface PostJobModalProps {
  isOpen: boolean;
  onClose: () => void;
  onJobCreated: (newJobData: any) => Promise<void>;
  userCity: string;
  userLat: number;
  userLng: number;
}

const CATEGORIES: JobCategory[] = [
  'Delivery',
  'Data Entry',
  'Retail Assistant',
  'Restaurant Helper',
  'Event Staff',
  'Tutoring',
  'Warehouse',
  'Freelance Works',
  'Remote Part-Time',
];

export default function PostJobModal({
  isOpen,
  onClose,
  onJobCreated,
  userCity,
  userLat,
  userLng,
}: PostJobModalProps) {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<JobCategory>('Delivery');
  const [description, setDescription] = useState('');
  const [payAmount, setPayAmount] = useState('650');
  const [payType, setPayType] = useState<PayType>('daily');
  const [locationAddress, setLocationAddress] = useState(userCity || 'Anna Nagar, Chennai');
  const [isUrgent, setIsUrgent] = useState(true);
  const [hoursPerDay, setHoursPerDay] = useState('5-6 hrs');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onJobCreated({
        title,
        category,
        description,
        pay_amount: Number(payAmount),
        pay_type: payType,
        location_lat: userLat,
        location_lng: userLng,
        location_address: locationAddress,
        is_urgent: isUrgent,
        hours_per_day: hoursPerDay,
        requirements: ['Punctual', 'Verified Contact'],
        tags: [isUrgent ? 'Urgent Need' : 'Flexible', 'Direct Payout'],
      });
      setIsSubmitting(false);
      onClose();
    } catch (err) {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in">
      <div className="bg-[#161616] border border-[#2a2a2a] rounded-3xl w-full max-w-xl max-h-[90vh] overflow-y-auto p-6 sm:p-8 shadow-2xl relative">
        <div className="flex items-start justify-between mb-6">
          <div>
            <div className="text-[11px] font-bold text-[#35be35] uppercase tracking-wider">
              Employer Portal
            </div>
            <h3 className="font-display text-2xl font-bold text-[#f2f2f2] mt-0.5">
              Post a Work or Part-Time Job
            </h3>
            <p className="text-xs text-[#999999] mt-1">
              Reach thousands of verified workers in your locality within minutes.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-[#999999] hover:text-[#f2f2f2] rounded-lg hover:bg-[#222222] cursor-pointer"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#999999] mb-1">
              Job Title *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Express Delivery Partner / Store Inventory Staff"
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#101010] border border-[#2a2a2a] text-xs text-[#f2f2f2] focus:border-[#35be35] outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#999999] mb-1">
                Category *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as JobCategory)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#101010] border border-[#2a2a2a] text-xs text-[#f2f2f2] focus:border-[#35be35] outline-none"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#999999] mb-1">
                Shift Hours
              </label>
              <input
                type="text"
                value={hoursPerDay}
                onChange={(e) => setHoursPerDay(e.target.value)}
                placeholder="e.g. 4-6 hrs / Weekend only"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#101010] border border-[#2a2a2a] text-xs text-[#f2f2f2] focus:border-[#35be35] outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#999999] mb-1">
                Pay Amount (₹) *
              </label>
              <input
                type="number"
                required
                min="100"
                value={payAmount}
                onChange={(e) => setPayAmount(e.target.value)}
                placeholder="650"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#101010] border border-[#2a2a2a] text-xs text-[#f2f2f2] focus:border-[#35be35] outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#999999] mb-1">
                Pay Type *
              </label>
              <div className="flex gap-1.5 p-1 bg-[#101010] border border-[#2a2a2a] rounded-xl text-xs">
                {(['daily', 'hourly', 'fixed'] as PayType[]).map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setPayType(type)}
                    className={`flex-1 py-1.5 rounded-lg capitalize font-semibold transition-colors ${
                      payType === type
                        ? 'bg-[#1f6b1f] text-white'
                        : 'text-[#999999] hover:text-[#f2f2f2]'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#999999] mb-1">
              Location Address *
            </label>
            <input
              type="text"
              required
              value={locationAddress}
              onChange={(e) => setLocationAddress(e.target.value)}
              placeholder="e.g. Anna Nagar West, Chennai"
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#101010] border border-[#2a2a2a] text-xs text-[#f2f2f2] focus:border-[#35be35] outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#999999] mb-1">
              Role Description & Requirements
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe tasks, vehicle requirements, meal perks, and timing..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#101010] border border-[#2a2a2a] text-xs text-[#f2f2f2] focus:border-[#35be35] outline-none resize-none"
            />
          </div>

          {/* Urgent Checkbox */}
          <label className="flex items-center gap-2.5 p-3 rounded-xl bg-[#101010] border border-[#222222] cursor-pointer">
            <input
              type="checkbox"
              checked={isUrgent}
              onChange={(e) => setIsUrgent(e.target.checked)}
              className="w-4 h-4 accent-[#35be35] rounded"
            />
            <div className="text-xs">
              <span className="font-semibold text-[#f2f2f2] block">Mark as Urgent Requirement</span>
              <span className="text-[#999999] text-[11px]">Surfaces on top of worker feeds with high-visibility badge.</span>
            </div>
          </label>

          <div className="flex items-center justify-end gap-3 pt-3">
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
              className="px-6 py-2.5 rounded-xl bg-[#35be35] hover:bg-[#5cd65c] text-[#080808] font-bold text-xs transition-all shadow-lg shadow-[#35be35]/20 cursor-pointer"
            >
              {isSubmitting ? 'Broadcasting...' : 'Publish Job Listing'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
