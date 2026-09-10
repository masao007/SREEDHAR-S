import { useState } from 'react';
import { UserProfile, AppNotification, UserRole } from '../types';
import NotificationDropdown from './NotificationDropdown';
import { Bell, Sparkles, PlusCircle, User, FileCode, LogIn, LogOut, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface NavbarProps {
  user: UserProfile;
  notifications: AppNotification[];
  currentCity?: string;
  onToggleRole?: (role: UserRole) => void;
  onRoleToggle?: () => void;
  onOpenAIMatcher: () => void;
  onOpenPostJob: () => void;
  onOpenProfile: () => void;
  onOpenDocs?: () => void;
  onOpenArchitectureDocs?: () => void;
  onMarkAllRead: () => void;
  onMarkOneRead?: (id: string) => void;
}

export default function Navbar({
  user,
  notifications,
  currentCity = 'Andheri East, Mumbai',
  onToggleRole,
  onRoleToggle,
  onOpenAIMatcher,
  onOpenPostJob,
  onOpenProfile,
  onOpenDocs,
  onOpenArchitectureDocs,
  onMarkAllRead,
  onMarkOneRead = () => {},
}: NavbarProps) {
  const { firebaseUser, openAuthModal, signOut } = useAuth();
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const unreadCount = notifications.filter((n) => !n.is_read && !n.read).length;

  const handleToggle = (role: UserRole) => {
    if (onToggleRole) onToggleRole(role);
    else if (onRoleToggle) onRoleToggle();
  };

  const handleOpenDocs = onOpenArchitectureDocs || onOpenDocs || (() => {});

  // Initials for avatar
  const initials = (user.name || 'User')
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <nav className="fixed top-0 left-0 right-0 z-40 h-14 bg-[#0c0c0c] border-b border-gray-800 px-4 md:px-8 flex items-center justify-between">
      {/* Brand & Region Indicator */}
      <div className="flex items-center space-x-4 md:space-x-6">
        <a href="#home" className="flex items-center space-x-2.5 group">
          <div className="w-8 h-8 bg-emerald-500 rounded flex items-center justify-center font-bold text-black text-xl italic shadow-sm group-hover:bg-emerald-400 transition-colors">
            M
          </div>
          <span className="text-base sm:text-lg font-black tracking-tighter uppercase text-white font-display">
            Money <span className="text-emerald-500">Maker</span>
          </span>
        </a>

        {/* Quick Nav Links */}
        <div className="hidden xl:flex items-center space-x-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">
          <a href="#map" className="hover:text-white transition-colors">Radar</a>
          <a href="#jobs" className="hover:text-white transition-colors">Works</a>
          <a href="#earnings" className="hover:text-white transition-colors">Income</a>
          <a href="#categories" className="hover:text-white transition-colors">Categories</a>
        </div>
      </div>

      {/* Right Controls & User Profile */}
      <div className="flex items-center space-x-2.5 sm:space-x-3.5">
        {/* Full Architecture Specs Modal Button */}
        <button
          onClick={handleOpenDocs}
          className="hidden sm:inline-flex items-center space-x-1.5 px-2.5 py-1 text-xs font-medium text-gray-400 hover:text-emerald-400 bg-[#141414] hover:bg-[#1a1a1a] border border-gray-800 rounded transition-colors cursor-pointer"
          title="View Database Architecture & API Schema"
        >
          <FileCode className="w-3.5 h-3.5 text-emerald-500" />
          <span className="text-[11px]">Schema</span>
        </button>

        {/* Role Toggle Switch */}
        <div className="flex items-center p-0.5 bg-[#141414] border border-gray-800 rounded text-xs">
          <button
            onClick={() => handleToggle('worker')}
            className={`px-2 py-0.5 rounded font-bold text-[11px] uppercase transition-all ${
              user.role === 'worker'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Worker
          </button>
          <button
            onClick={() => handleToggle('employer')}
            className={`px-2 py-0.5 rounded font-bold text-[11px] uppercase transition-all ${
              user.role === 'employer'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Employer
          </button>
        </div>

        {/* AI Job Matcher CTA */}
        <button
          onClick={onOpenAIMatcher}
          className="hidden md:inline-flex items-center space-x-1.5 px-3 py-1 rounded bg-emerald-950/60 hover:bg-emerald-900/60 border border-emerald-800 text-emerald-400 text-xs font-bold transition-all cursor-pointer shadow-sm"
        >
          <Sparkles className="w-3 h-3 text-emerald-400 animate-pulse" />
          <span className="text-[11px] uppercase tracking-wide">AI Match</span>
        </button>

        {/* Notifications Bell */}
        <div className="relative">
          <button
            onClick={() => setIsNotifOpen(!isNotifOpen)}
            className="p-1.5 rounded text-gray-400 hover:text-white bg-[#141414] hover:bg-[#1e1e1e] border border-gray-800 transition-colors relative cursor-pointer"
            aria-label="Notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse ring-2 ring-[#0c0c0c]"></span>
            )}
          </button>

          <NotificationDropdown
            notifications={notifications}
            isOpen={isNotifOpen}
            onClose={() => setIsNotifOpen(false)}
            onMarkAllRead={onMarkAllRead}
            onMarkOneRead={onMarkOneRead}
          />
        </div>

        {/* Role CTA / Profile / Firebase Auth Button */}
        {user.role === 'employer' ? (
          <button
            onClick={onOpenPostJob}
            className="inline-flex items-center space-x-1 px-3 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-black text-xs font-black uppercase transition-colors cursor-pointer"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span className="text-[11px]">Post Work</span>
          </button>
        ) : null}

        {firebaseUser ? (
          <button
            onClick={onOpenProfile}
            className="flex items-center space-x-2 bg-[#141414] hover:bg-[#1e1e1e] px-2.5 py-1 rounded border border-gray-800 transition-colors cursor-pointer"
            title="Manage Firebase Account & Profile"
          >
            <div className="w-7 h-7 bg-emerald-700/80 rounded-full flex items-center justify-center text-xs font-bold text-white overflow-hidden shrink-0">
              {user.avatar && (user.avatar.startsWith('http') || user.avatar.startsWith('data:')) && !user.avatar.includes('content/') ? (
                <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              ) : user.avatar && user.avatar.length <= 4 && !user.avatar.includes('/') && !user.avatar.includes(':') ? (
                <span className="text-sm select-none">{user.avatar}</span>
              ) : (
                initials || 'AS'
              )}
            </div>
            <span className="text-xs font-semibold text-gray-200 hidden sm:inline-block max-w-[90px] truncate">
              {user.name.split(' ')[0]}
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" title="Firebase Connected"></span>
          </button>
        ) : (
          <button
            onClick={() => openAuthModal('login')}
            className="inline-flex items-center space-x-1.5 px-3 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-black text-xs font-black uppercase transition-colors cursor-pointer shadow-sm"
          >
            <LogIn className="w-3.5 h-3.5" />
            <span className="text-[11px]">Sign In</span>
          </button>
        )}
      </div>
    </nav>
  );
}
