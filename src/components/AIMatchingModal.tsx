import { useState } from 'react';
import { UserProfile, AIWorkerMatchResponse, Job } from '../types';
import { Sparkles, Brain, Check, RefreshCw, ArrowRight, Zap, Target } from 'lucide-react';

interface AIMatchingModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile;
  jobs: Job[];
  onApplyJob: (job: Job) => void;
  onUpdateUserSkills: (skills: string[], availability: UserProfile['availability']) => void;
}

const ALL_SKILLS = [
  'Delivery',
  'Two-wheeler Driving',
  'Electric Vehicle (EV)',
  'Data Entry',
  'Store Inventory',
  'Customer Support',
  'Class 10 Math Tutoring',
  'Restaurant Kitchen Prep',
  'Event Hosting & Ushering',
  'Warehouse Sorting',
  'Carpentry & Plumbing Basics',
];

export default function AIMatchingModal({
  isOpen,
  onClose,
  user,
  jobs,
  onApplyJob,
  onUpdateUserSkills,
}: AIMatchingModalProps) {
  const [selectedSkills, setSelectedSkills] = useState<string[]>(user.skills || []);
  const [availability, setAvailability] = useState<UserProfile['availability']>(user.availability || 'flexible');
  const [isLoading, setIsLoading] = useState(false);
  const [matchResult, setMatchResult] = useState<AIWorkerMatchResponse | null>(null);

  if (!isOpen) return null;

  const toggleSkill = (skill: string) => {
    if (selectedSkills.includes(skill)) {
      setSelectedSkills(selectedSkills.filter((s) => s !== skill));
    } else {
      setSelectedSkills([...selectedSkills, skill]);
    }
  };

  const handleRunMatcher = async () => {
    setIsLoading(true);
    try {
      onUpdateUserSkills(selectedSkills, availability);

      const res = await fetch('/api/ai/match', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          worker: {
            ...user,
            skills: selectedSkills,
            availability,
          },
        }),
      });

      const data = await res.json();
      if (data.success && data.matchData) {
        setMatchResult(data.matchData);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in">
      <div className="bg-[#161616] border border-[#2a2a2a] rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 sm:p-8 shadow-2xl relative">
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#35be35]/15 border border-[#35be35]/30 text-xs font-semibold text-[#95e895] mb-2">
              <Brain className="w-3.5 h-3.5 text-[#5cd65c]" />
              <span>Gemini 3.1 Pro Compatibility Engine</span>
            </div>
            <h3 className="font-display text-2xl font-bold text-[#f2f2f2]">
              AI Job Matchmaker
            </h3>
            <p className="text-xs text-[#999999] mt-1">
              Select your real skills and weekly availability to generate instant compatibility scores across all nearby works.
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-[#999999] hover:text-[#f2f2f2] rounded-xl hover:bg-[#222222] cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Skill Selector Matrix */}
        <div className="mb-6">
          <label className="block text-xs font-semibold text-[#999999] uppercase tracking-wider mb-2.5">
            Your Skills & Certifications ({selectedSkills.length} selected)
          </label>
          <div className="flex flex-wrap gap-2">
            {ALL_SKILLS.map((skill) => {
              const isSelected = selectedSkills.includes(skill);
              return (
                <button
                  key={skill}
                  type="button"
                  onClick={() => toggleSkill(skill)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-[#1f6b1f] text-white border border-[#35be35] shadow-sm'
                      : 'bg-[#101010] text-[#999999] hover:text-[#f2f2f2] border border-[#222222] hover:bg-[#1a1a1a]'
                  }`}
                >
                  {isSelected && <Check className="w-3 h-3 text-[#95e895]" />}
                  <span>{skill}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Availability Selector */}
        <div className="mb-6">
          <label className="block text-xs font-semibold text-[#999999] uppercase tracking-wider mb-2.5">
            Preferred Working Hours
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {[
              { id: 'flexible', label: 'Flexible Shifts' },
              { id: 'weekends', label: 'Weekends Only' },
              { id: 'evenings', label: 'Evenings (4-9 PM)' },
              { id: 'full-time', label: 'Full Shift (8 hrs)' },
            ].map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => setAvailability(opt.id as any)}
                className={`p-2.5 rounded-xl text-xs font-semibold text-center transition-all cursor-pointer ${
                  availability === opt.id
                    ? 'bg-[#164516] text-[#95e895] border border-[#35be35]'
                    : 'bg-[#101010] text-[#999999] border border-[#222222] hover:bg-[#1a1a1a]'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Trigger Button */}
        <button
          onClick={handleRunMatcher}
          disabled={isLoading || selectedSkills.length === 0}
          className="w-full py-3.5 rounded-xl bg-[#35be35] hover:bg-[#5cd65c] text-[#080808] font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-lg shadow-[#35be35]/20 cursor-pointer disabled:opacity-50"
        >
          {isLoading ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>Analyzing with Gemini 3.1 Thinking Mode...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              <span>Calculate Job Compatibility Scores</span>
            </>
          )}
        </button>

        {/* AI Results Output */}
        {matchResult && (
          <div className="mt-8 pt-6 border-t border-[#222222] space-y-4 animate-in fade-in">
            {/* Earning potential highlight banner */}
            <div className="p-4 rounded-2xl bg-[#0d2b0d] border border-[#1f6b1f] flex items-center justify-between">
              <div>
                <div className="text-[11px] text-[#95e895] font-semibold">Estimated Monthly Earning Potential</div>
                <div className="font-display text-xl font-bold text-[#f2f2f2]">
                  {matchResult.suggestedEarningsPotential}
                </div>
              </div>
              <Target className="w-8 h-8 text-[#35be35]" />
            </div>

            {/* Profile Advice */}
            <div className="p-4 rounded-xl bg-[#101010] border border-[#222222] text-xs text-[#999999] leading-relaxed">
              <strong className="text-[#35be35] block mb-1">💡 AI Career Optimization Note:</strong>
              {matchResult.profileAdvice}
            </div>

            {/* Top Job Matches List */}
            <h4 className="font-display text-sm font-bold text-[#f2f2f2] pt-2">
              Ranked Job Matches
            </h4>
            <div className="space-y-2.5">
              {matchResult.topMatches.map((match) => {
                const job = jobs.find((j) => j.id === match.jobId);
                if (!job) return null;

                return (
                  <div
                    key={match.jobId}
                    className="p-3.5 bg-[#121212] border border-[#262626] rounded-xl flex items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-[#1a1a1a] flex items-center justify-center text-lg shrink-0">
                        {job.emoji}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h5 className="text-xs font-bold text-[#f2f2f2]">{job.title}</h5>
                          <span className="px-1.5 py-0.5 rounded bg-[#35be35]/20 text-[#5cd65c] text-[10px] font-bold">
                            {match.matchScore}% Match
                          </span>
                        </div>
                        <p className="text-[11px] text-[#999999] mt-0.5 max-w-sm">
                          {match.fitSummary}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <div className="text-right hidden sm:block">
                        <div className="text-xs font-bold text-[#5cd65c]">{job.pay_display}</div>
                        <div className="text-[10px] text-[#999999]">{job.distance_km ?? 1.2} km</div>
                      </div>
                      <button
                        onClick={() => {
                          onClose();
                          onApplyJob(job);
                        }}
                        className="px-3 py-1.5 rounded-lg bg-[#35be35] text-[#080808] font-bold text-xs hover:bg-[#5cd65c] cursor-pointer"
                      >
                        Apply
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
