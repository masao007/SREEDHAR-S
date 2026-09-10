import { Layers } from 'lucide-react';

interface FooterProps {
  onOpenArchitectureDocs: () => void;
  onOpenAIMatcher: () => void;
  onOpenPostJob: () => void;
}

export default function Footer({
  onOpenArchitectureDocs,
}: FooterProps) {
  return (
    <footer className="bg-[#0c0c0c] border-t border-gray-800 px-4 md:px-8 py-4 text-[10px] font-semibold text-gray-500 uppercase tracking-widest">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Real-time System Metrics */}
        <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 sm:gap-6">
          <span className="text-emerald-500 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Active Workers: 4,208
          </span>
          <span className="text-gray-400">Live Jobs: 1,192</span>
          <span className="text-gray-400">Payouts (24h): ₹4.2L</span>
          <span className="hidden lg:inline text-gray-600">|</span>
          <span className="hidden lg:inline text-gray-400">NPCI / UPI 2.0 Connected</span>
        </div>

        {/* System Health & Schema Doc Link */}
        <div className="flex items-center space-x-4">
          <button
            onClick={onOpenArchitectureDocs}
            className="text-emerald-500 hover:text-emerald-400 font-bold flex items-center space-x-1 cursor-pointer transition-colors"
          >
            <Layers className="w-3 h-3" />
            <span>Database & PostGIS Schema</span>
          </button>
          <span className="text-gray-700">•</span>
          <div className="flex items-center space-x-1.5">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
            <span className="text-gray-400">System Healthy</span>
          </div>
          <span className="text-gray-600">v2.4.0-prod</span>
        </div>
      </div>
    </footer>
  );
}
