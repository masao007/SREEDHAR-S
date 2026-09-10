import { useState } from 'react';
import { Database, Server, Cpu, Layers, FileCode, Check, Copy } from 'lucide-react';

interface ArchitectureDocsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ArchitectureDocsModal({ isOpen, onClose }: ArchitectureDocsModalProps) {
  const [activeTab, setActiveTab] = useState<'architecture' | 'schema' | 'api' | 'ai' | 'deploy'>('architecture');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  if (!isOpen) return null;

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const directoryTree = `money-maker/
├── src/
│   ├── components/
│   │   ├── Navbar.tsx             # Dynamic navigation, role switcher, smart alerts
│   │   ├── HeroSection.tsx        # Geolocation search, live city picker, statistics
│   │   ├── InteractiveMap.tsx     # Leaflet dark map with PostGIS radius queries & pins
│   │   ├── FeaturedJobs.tsx       # AI top recommendations, proximity cards, quick apply
│   │   ├── EarningsTracker.tsx    # Recharts dynamic earnings analytics & UPI payouts
│   │   ├── AIMatchingModal.tsx    # Gemini 3.1 Pro Thinking Mode match engine
│   │   ├── PostJobModal.tsx       # Employer job creation with spatial geocoding
│   │   ├── ApplicationModal.tsx   # 1-tap verified worker applications
│   │   └── HowItWorks.tsx / Reviews / Pricing
│   ├── data/
│   │   └── mockData.ts            # Realistic Indian work platform dataset
│   ├── db/
│   │   ├── schema.sql             # PostgreSQL 15+ & PostGIS spatial stored procedures
│   │   └── firestore.rules        # Firestore security rules and RBAC permissions
│   ├── services/
│   │   └── geminiMatcher.ts       # @google/genai SDK integration with ThinkingLevel.HIGH
│   ├── types.ts                   # Universal TypeScript interfaces (Jobs, Users, Payouts)
│   ├── App.tsx                    # Main App Controller with live state synchronization
│   └── index.css                  # Custom #080808 Dark theme & Tailwind styling
├── server.ts                      # Express API backend + Vite middleware
├── package.json                   # Dependencies: @google/genai, recharts, leaflet
└── metadata.json                  # Application capabilities & geolocation permissions`;

  const sqlSchema = `-- PostgreSQL 15+ with PostGIS Spatial Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";

-- Spatial Proximity Stored Procedure
CREATE OR REPLACE FUNCTION get_nearby_jobs(
    user_lat DOUBLE PRECISION,
    user_lng DOUBLE PRECISION,
    radius_km DOUBLE PRECISION DEFAULT 10.0,
    filter_category VARCHAR DEFAULT NULL
)
RETURNS TABLE (...) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        j.id, j.title, j.category, j.pay_amount, j.pay_display,
        ROUND((ST_Distance(j.location, ST_SetSRID(ST_MakePoint(user_lng, user_lat), 4326)::geography) / 1000.0)::numeric, 2) AS distance_km,
        j.is_urgent, j.status
    FROM jobs j
    WHERE j.status = 'open'
      AND (filter_category IS NULL OR filter_category = 'All' OR j.category = filter_category)
      AND ST_DWithin(j.location, ST_SetSRID(ST_MakePoint(user_lng, user_lat), 4326)::geography, radius_km * 1000.0)
    ORDER BY distance_km ASC;
END;
$$ LANGUAGE plpgsql;`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in">
      <div className="bg-[#161616] border border-[#2a2a2a] rounded-3xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-[#222222] flex items-center justify-between bg-[#121212]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#1f6b1f] flex items-center justify-center text-[#5cd65c]">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-display text-lg font-bold text-[#f2f2f2]">
                Money Maker — Full Stack Architecture & Engineering Blueprint
              </h3>
              <p className="text-xs text-[#999999]">
                Enterprise-grade specifications for India's gig worker discovery platform
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[#999999] hover:text-[#f2f2f2] rounded-xl hover:bg-[#222222] cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Tab Selector */}
        <div className="flex items-center gap-2 px-6 pt-3 border-b border-[#222222] bg-[#101010] overflow-x-auto text-xs font-semibold">
          {[
            { id: 'architecture', label: '1. Directory Map', icon: Layers },
            { id: 'schema', label: '2. PostgreSQL & PostGIS', icon: Database },
            { id: 'api', label: '3. API Endpoints', icon: Server },
            { id: 'ai', label: '4. Gemini AI Engine', icon: Cpu },
            { id: 'deploy', label: '5. Deployment Guide', icon: FileCode },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-3.5 py-2.5 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                  isActive
                    ? 'border-[#35be35] text-[#5cd65c]'
                    : 'border-transparent text-[#999999] hover:text-[#f2f2f2]'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Content Area */}
        <div className="p-6 overflow-y-auto flex-1 text-xs text-[#f2f2f2] space-y-4">
          {activeTab === 'architecture' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-sm text-[#5cd65c]">Next.js 14 / React Full-Stack Directory Structure</h4>
                <button
                  onClick={() => copyToClipboard(directoryTree, 'tree')}
                  className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#222222] hover:bg-[#2a2a2a] text-[#f2f2f2] rounded-lg text-xs"
                >
                  {copiedKey === 'tree' ? <Check className="w-3.5 h-3.5 text-[#35be35]" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>Copy Map</span>
                </button>
              </div>
              <pre className="p-4 bg-[#0a0a0a] border border-[#222222] rounded-2xl overflow-x-auto text-[11px] text-[#95e895] font-mono leading-relaxed">
                {directoryTree}
              </pre>
            </div>
          )}

          {activeTab === 'schema' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-sm text-[#5cd65c]">PostgreSQL Schema with PostGIS Indexing & ST_DWithin</h4>
                <button
                  onClick={() => copyToClipboard(sqlSchema, 'sql')}
                  className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#222222] hover:bg-[#2a2a2a] text-[#f2f2f2] rounded-lg text-xs"
                >
                  {copiedKey === 'sql' ? <Check className="w-3.5 h-3.5 text-[#35be35]" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>Copy SQL</span>
                </button>
              </div>
              <pre className="p-4 bg-[#0a0a0a] border border-[#222222] rounded-2xl overflow-x-auto text-[11px] text-[#cbf4cb] font-mono leading-relaxed">
                {sqlSchema}
              </pre>
            </div>
          )}

          {activeTab === 'api' && (
            <div className="space-y-3">
              <h4 className="font-bold text-sm text-[#5cd65c]">Production Backend API Endpoints (server.ts)</h4>
              <div className="space-y-2 font-mono text-[11px]">
                <div className="p-3 bg-[#0e0e0e] border border-[#222222] rounded-xl">
                  <span className="px-2 py-0.5 rounded bg-[#1f6b1f] text-white font-bold text-[10px] mr-2">GET</span>
                  <span className="text-[#f2f2f2] font-bold">/api/jobs/nearby</span>
                  <p className="text-[#999999] font-sans text-xs mt-1">
                    Accepts <code className="text-[#5cd65c]">lat, lng, radius_km, category, search, urgent</code>. Returns jobs sorted by proximity via Haversine / PostGIS.
                  </p>
                </div>

                <div className="p-3 bg-[#0e0e0e] border border-[#222222] rounded-xl">
                  <span className="px-2 py-0.5 rounded bg-[#289228] text-white font-bold text-[10px] mr-2">POST</span>
                  <span className="text-[#f2f2f2] font-bold">/api/jobs/create</span>
                  <p className="text-[#999999] font-sans text-xs mt-1">
                    Employer job posting endpoint with auto-geolocation and instant community broadcast.
                  </p>
                </div>

                <div className="p-3 bg-[#0e0e0e] border border-[#222222] rounded-xl">
                  <span className="px-2 py-0.5 rounded bg-[#289228] text-white font-bold text-[10px] mr-2">POST</span>
                  <span className="text-[#f2f2f2] font-bold">/api/applications/apply</span>
                  <p className="text-[#999999] font-sans text-xs mt-1">
                    1-Tap application flow with worker verification and real-time notification trigger.
                  </p>
                </div>

                <div className="p-3 bg-[#0e0e0e] border border-[#222222] rounded-xl">
                  <span className="px-2 py-0.5 rounded bg-[#1f6b1f] text-white font-bold text-[10px] mr-2">GET</span>
                  <span className="text-[#f2f2f2] font-bold">/api/earnings/summary</span>
                  <p className="text-[#999999] font-sans text-xs mt-1">
                    Aggregates monthly earnings stats, completed shifts, and category distributions for Recharts visualization.
                  </p>
                </div>

                <div className="p-3 bg-[#0e0e0e] border border-[#222222] rounded-xl">
                  <span className="px-2 py-0.5 rounded bg-[#289228] text-white font-bold text-[10px] mr-2">POST</span>
                  <span className="text-[#f2f2f2] font-bold">/api/payments/payout</span>
                  <p className="text-[#999999] font-sans text-xs mt-1">
                    NPCI UPI / Razorpay Instant Payouts bridge delivering funds directly to worker VPA.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'ai' && (
            <div className="space-y-3">
              <h4 className="font-bold text-sm text-[#5cd65c]">Google Gemini AI Integration Pattern (@google/genai)</h4>
              <p className="text-xs text-[#999999] leading-relaxed font-sans">
                The AI service uses the official Google Gen AI SDK on the server-side with <code className="text-[#5cd65c]">gemini-3.1-pro-preview</code> and <code className="text-[#5cd65c]">ThinkingLevel.HIGH</code> to evaluate candidate vehicle capabilities, shift availability, and travel radiuses to produce a percentage compatibility score.
              </p>
              <pre className="p-4 bg-[#0a0a0a] border border-[#222222] rounded-2xl overflow-x-auto text-[11px] text-[#95e895] font-mono leading-relaxed">
{`import { GoogleGenAI, ThinkingLevel, Type } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const response = await ai.models.generateContent({
  model: 'gemini-3.1-pro-preview',
  contents: workerMatchingPrompt,
  config: {
    thinkingConfig: { thinkingLevel: ThinkingLevel.HIGH },
    responseMimeType: 'application/json',
    responseSchema: { ... }
  }
});`}
              </pre>
            </div>
          )}

          {activeTab === 'deploy' && (
            <div className="space-y-3 font-sans">
              <h4 className="font-bold text-sm text-[#5cd65c]">Deployment & Environment Configuration</h4>
              <div className="space-y-3 text-xs text-[#999999]">
                <div className="p-3 bg-[#101010] border border-[#222222] rounded-xl">
                  <strong className="text-[#f2f2f2] block mb-1">1. Environment Variables (.env)</strong>
                  <code className="text-[#5cd65c] font-mono">
                    GEMINI_API_KEY=your_gemini_key<br />
                    DATABASE_URL=postgresql://user:password@host:5432/moneymaker<br />
                    RAZORPAY_KEY_ID=your_razorpay_key
                  </code>
                </div>

                <div className="p-3 bg-[#101010] border border-[#222222] rounded-xl">
                  <strong className="text-[#f2f2f2] block mb-1">2. Production Build Commands</strong>
                  <code className="text-[#5cd65c] font-mono">
                    npm run build  # Compiles React SPA + bundles server.ts to dist/server.cjs<br />
                    npm start      # Launches node dist/server.cjs on port 3000
                  </code>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
