import { useState } from 'react';
import { Job } from '../types';
import { Sparkles, MapPin, Clock, ArrowRight, Flame, ShieldCheck, Zap } from 'lucide-react';

interface FeaturedJobsProps {
  jobs: Job[];
  selectedCategory: string;
  onSelectCategory: (cat: string) => void;
  radiusKm: number;
  onRadiusChange: (radius: number) => void;
  onApplyJob: (job: Job) => void;
  onOpenAIMatcher: () => void;
}

export default function FeaturedJobs({
  jobs,
  selectedCategory,
  onSelectCategory,
  radiusKm,
  onRadiusChange,
  onApplyJob,
  onOpenAIMatcher,
}: FeaturedJobsProps) {
  const [urgentOnly, setUrgentOnly] = useState(false);

  // Top AI recommended job
  const topAIJob = jobs.find((j) => (j.aiMatchScore ?? 0) >= 90) || jobs[0];

  const displayedJobs = jobs.filter((job) => {
    if (urgentOnly && !job.is_urgent) return false;
    if (selectedCategory !== 'All' && job.category !== selectedCategory) return false;
    return true;
  });

  const categories = ['All', 'Delivery', 'Data Entry', 'Retail Assistant', 'Restaurant Helper', 'Tutoring', 'Event Staff', 'Warehouse'];

  return (
    <section id="jobs" className="py-12 px-4 md:px-8 bg-[#080808] border-b border-gray-800">
      <div className="max-w-7xl mx-auto">
        {/* Section Header & High-Density Filter Toolbar */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-6 gap-4">
          <div>
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-1 flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-emerald-500" />
              Verified Opportunities
            </h3>
            <h2 className="font-display text-2xl sm:text-3xl font-black uppercase tracking-tight text-white">
              {displayedJobs.length} Nearby Works ({radiusKm}km radius)
            </h2>
          </div>

          {/* High-Density Action Controls */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Urgent only button */}
            <button
              onClick={() => setUrgentOnly(!urgentOnly)}
              className={`inline-flex items-center space-x-1.5 px-3 py-1 rounded text-xs font-bold uppercase transition-all cursor-pointer ${
                urgentOnly
                  ? 'bg-red-950/70 text-red-400 border border-red-800'
                  : 'bg-[#141414] text-gray-400 hover:text-white border border-gray-800'
              }`}
            >
              <Flame className={`w-3.5 h-3.5 ${urgentOnly ? 'text-red-500 animate-pulse' : 'text-gray-500'}`} />
              <span className="text-[11px]">Urgent Only</span>
            </button>

            {/* AI Matcher Trigger */}
            <button
              onClick={onOpenAIMatcher}
              className="inline-flex items-center space-x-1 px-3 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-black text-xs font-black uppercase tracking-wide transition-all cursor-pointer shadow-sm"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span className="text-[11px]">AI Smart Match</span>
            </button>
          </div>
        </div>

        {/* Category Filter Chips Bar */}
        <div className="flex items-center space-x-1.5 overflow-x-auto pb-3 mb-6">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => onSelectCategory(cat)}
              className={`px-3 py-1 rounded text-xs font-bold uppercase whitespace-nowrap transition-all cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-emerald-500 text-black shadow-sm'
                  : 'bg-[#141414] text-gray-400 hover:text-white border border-gray-800 hover:bg-[#1a1a1a]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* High-Density Grid Structure (Spotlight + Feed) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Top AI Recommendation Spotlight Card (Col 4/12) */}
          {topAIJob && (
            <div className="lg:col-span-4 bg-[#0c0c0c] border border-gray-800 rounded-lg p-5 flex flex-col justify-between relative overflow-hidden">
              <div className="absolute top-0 right-0 w-48 h-48 bg-[radial-gradient(circle,rgba(16,185,129,0.1)_0%,transparent_70%)] pointer-events-none" />

              <div>
                <div className="flex justify-between items-start mb-3">
                  <span className="text-[10px] font-black uppercase px-2 py-0.5 bg-emerald-500 text-black rounded tracking-wider">
                    AI Recommended
                  </span>
                  <span className="text-xs font-bold text-emerald-400">
                    {topAIJob.aiMatchScore || 98}% Match
                  </span>
                </div>

                <div className="flex items-center space-x-3 mb-3">
                  <div className="w-10 h-10 rounded bg-[#141414] border border-gray-800 flex items-center justify-center text-xl shrink-0">
                    {topAIJob.emoji || '⚡'}
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-base leading-snug">
                      {topAIJob.title}
                    </h4>
                    <p className="text-xs text-gray-400">
                      {topAIJob.employer_name} • {topAIJob.location_address.split(',')[0]}
                    </p>
                  </div>
                </div>

                <p className="text-xs text-gray-300 leading-relaxed mb-4">
                  {topAIJob.description}
                </p>

                {topAIJob.aiMatchReason && (
                  <div className="p-2.5 rounded bg-emerald-950/30 border border-emerald-900/50 text-[11px] text-emerald-300 mb-4 leading-normal">
                    <span className="font-bold text-emerald-400 uppercase tracking-wider block text-[10px] mb-0.5">Match Reason:</span>
                    {topAIJob.aiMatchReason}
                  </div>
                )}
              </div>

              <div className="pt-4 border-t border-gray-800 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-gray-500 uppercase font-semibold block">Payout</span>
                  <span className="text-lg font-black text-white">
                    {topAIJob.pay_display}
                  </span>
                </div>
                <button
                  onClick={() => onApplyJob(topAIJob)}
                  className="bg-emerald-600 hover:bg-emerald-500 text-black text-xs font-black uppercase tracking-wider px-4 py-2 rounded transition-colors cursor-pointer"
                >
                  APPLY NOW
                </button>
              </div>
            </div>
          )}

          {/* Right Column: Dense Job Feed Grid (Col 8/12) */}
          <div className="lg:col-span-8 bg-[#0c0c0c] border border-gray-800 rounded-lg flex flex-col overflow-hidden">
            <div className="p-3 border-b border-gray-800 bg-[#0e0e0e] flex items-center justify-between">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-widest">
                Available Shift Feed
              </h3>
              <span className="text-[10px] font-bold text-gray-500 uppercase">
                {displayedJobs.length} Positions Available
              </span>
            </div>

            <div className="divide-y divide-gray-800 max-h-[520px] overflow-y-auto">
              {displayedJobs.map((job) => {
                const isUrgent = job.is_urgent;
                const matchScore = job.aiMatchScore || 85;

                return (
                  <div
                    key={job.id}
                    className={`p-4 transition-colors ${
                      isUrgent
                        ? 'bg-emerald-950/10 hover:bg-emerald-950/20'
                        : 'hover:bg-[#141414]'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-2">
                      <div className="flex items-center space-x-2.5">
                        <span className="text-lg">{job.emoji || '💼'}</span>
                        <div>
                          <div className="flex items-center space-x-2">
                            <h4 className="font-bold text-white text-sm">
                              {job.title}
                            </h4>
                            {isUrgent ? (
                              <span className="text-[9px] font-black uppercase px-1.5 py-0.2 bg-red-950 text-red-400 border border-red-800 rounded">
                                Urgent
                              </span>
                            ) : (
                              <span className="text-[9px] font-black uppercase px-1.5 py-0.2 bg-[#222] text-gray-300 border border-gray-700 rounded">
                                {job.category}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-gray-400">
                            {job.employer_name} • {job.location_address.split(',')[0]} ({job.distance_km ?? 1.4} km away)
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-3 self-end sm:self-center">
                        <div className="text-right">
                          <span className="text-base font-bold text-white block">
                            {job.pay_display}
                          </span>
                          <span className="text-[10px] text-gray-500 font-medium">
                            {job.hours_per_day || 'Flexible Shift'}
                          </span>
                        </div>
                        <button
                          onClick={() => onApplyJob(job)}
                          className={`text-[10px] font-black uppercase tracking-wider px-3.5 py-1.5 rounded transition-colors cursor-pointer ${
                            isUrgent
                              ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                              : 'bg-[#222] hover:bg-[#333] text-white border border-gray-700'
                          }`}
                        >
                          APPLY
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
