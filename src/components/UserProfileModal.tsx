import { useState, FormEvent, useEffect } from 'react';
import { UserProfile } from '../types';
import { User, ShieldCheck, Star, Mail, Check, LogOut, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface UserProfileModalProps {
  user: UserProfile;
  isOpen: boolean;
  onClose: () => void;
  onUpdateProfile: (updated: Partial<UserProfile>) => Promise<void>;
}

const AVATAR_OPTIONS = ['👨🏽', '👩🏽', '🧑🏽', '🛵', '⚡', '💼', '👷🏽', '🚀'];

export default function UserProfileModal({
  user,
  isOpen,
  onClose,
  onUpdateProfile,
}: UserProfileModalProps) {
  const { firebaseUser, signOut, openAuthModal } = useAuth();
  const [name, setName] = useState(user.name);
  const [phone, setPhone] = useState(user.phone);
  const [address, setAddress] = useState(user.address);
  const [selectedAvatar, setSelectedAvatar] = useState(user.avatar || '👨🏽');
  const [isSaved, setIsSaved] = useState(false);
  const [avatarError, setAvatarError] = useState(false);

  useEffect(() => {
    setName(user.name);
    setPhone(user.phone);
    setAddress(user.address);
    // Sanitize any avatar that might have corrupted content:// or raw URI strings
    const cleanAvatar = user.avatar && !user.avatar.includes('content/') ? user.avatar : '👨🏽';
    setSelectedAvatar(cleanAvatar);
    setAvatarError(false);
  }, [user]);

  if (!isOpen) return null;

  const handleSave = async (e: FormEvent) => {
    e.preventDefault();
    await onUpdateProfile({
      name,
      phone,
      address,
      avatar: selectedAvatar,
    });
    setIsSaved(true);
    setTimeout(() => {
      setIsSaved(false);
      onClose();
    }, 1000);
  };

  const handleSignOut = async () => {
    await signOut();
    onClose();
  };

  // Safely check whether selectedAvatar is a valid displayable web image URL
  const isImageAvatar = Boolean(
    selectedAvatar &&
    (selectedAvatar.startsWith('http://') ||
      selectedAvatar.startsWith('https://') ||
      selectedAvatar.startsWith('data:') ||
      selectedAvatar.startsWith('blob:')) &&
    !selectedAvatar.includes('content/') &&
    !avatarError
  );

  // Check if avatar is a simple emoji (short text, no URLs or path slashes)
  const isEmojiAvatar = Boolean(
    selectedAvatar &&
    selectedAvatar.length <= 4 &&
    !selectedAvatar.includes('/') &&
    !selectedAvatar.includes(':')
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-8 bg-black/85 backdrop-blur-md animate-in fade-in overflow-y-auto">
      {/* Spacious, Enlarged Profile View Container */}
      <div className="bg-[#0e0e0e] border border-gray-800 rounded-2xl w-full max-w-xl sm:max-w-2xl p-7 sm:p-10 shadow-2xl relative my-auto">
        {/* Header with Avatar & Details */}
        <div className="flex items-start justify-between pb-6 border-b border-gray-800/80 mb-6">
          <div className="flex items-center space-x-5">
            {/* Enlarged Avatar Frame */}
            <div className="w-18 h-18 sm:w-22 sm:h-22 rounded-2xl overflow-hidden bg-[#161616] border-2 border-emerald-500/50 flex items-center justify-center shrink-0 shadow-lg shadow-emerald-950/30">
              {isImageAvatar ? (
                <img
                  src={selectedAvatar}
                  alt={user.name}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                  onError={() => setAvatarError(true)}
                />
              ) : isEmojiAvatar ? (
                <span className="text-3xl sm:text-4xl select-none">{selectedAvatar}</span>
              ) : (
                <User className="w-9 h-9 text-emerald-400" />
              )}
            </div>
            <div>
              <h3 className="font-display text-xl sm:text-2xl font-black uppercase text-white tracking-tight">
                {name || user.name}
              </h3>
              <div className="flex items-center space-x-2 mt-2">
                <div className="flex items-center space-x-1.5 text-xs text-emerald-400 font-bold uppercase tracking-wider bg-emerald-950/60 border border-emerald-800/50 px-2.5 py-1 rounded-md">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Verified {user.role === 'employer' ? 'Employer' : 'Worker'}</span>
                </div>
                <span className="text-xs text-gray-500">·</span>
                <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" />
                  Active Profile
                </span>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2.5 text-gray-400 hover:text-white rounded-xl hover:bg-gray-800/80 cursor-pointer transition-colors"
            aria-label="Close profile modal"
          >
            ✕
          </button>
        </div>

        {/* Clean Account Banner - Zero Watermarks or Technical URLs */}
        <div className="mb-6 p-3.5 rounded-xl bg-[#141414] border border-gray-800/80 flex items-center justify-between text-xs sm:text-sm">
          <div className="flex items-center space-x-2.5 truncate mr-2">
            <Mail className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="text-gray-300 font-medium truncate">
              {firebaseUser?.email || user.email || 'worker@moneymaker.in'}
            </span>
          </div>
          <span className="shrink-0 text-[11px] font-bold text-emerald-400 uppercase tracking-wider bg-emerald-950/80 border border-emerald-800/60 px-3 py-1 rounded-full">
            {firebaseUser ? (firebaseUser.isAnonymous ? 'Demo Session' : 'Active Account') : 'Verified Member'}
          </span>
        </div>

        {/* Worker Performance Stats */}
        <div className="grid grid-cols-3 gap-4 p-4 sm:p-5 rounded-xl bg-[#131313] border border-gray-800/90 mb-6 text-center">
          <div>
            <div className="text-base sm:text-lg font-black text-white flex items-center justify-center space-x-1.5">
              <Star className="w-4 h-4 text-emerald-400 fill-emerald-400" />
              <span>{user.rating}</span>
            </div>
            <div className="text-[11px] text-gray-400 uppercase font-bold mt-1">Platform Rating</div>
          </div>
          <div className="border-x border-gray-800">
            <div className="text-base sm:text-lg font-black text-emerald-400">{user.completedJobsCount}</div>
            <div className="text-[11px] text-gray-400 uppercase font-bold mt-1">Completed Works</div>
          </div>
          <div>
            <div className="text-base sm:text-lg font-black text-white">100%</div>
            <div className="text-[11px] text-gray-400 uppercase font-bold mt-1">Trust Score</div>
          </div>
        </div>

        {/* Avatar Selector to replace any watermarked photo with a clean badge */}
        <div className="mb-6">
          <label className="block text-xs font-bold uppercase tracking-wider text-gray-300 mb-2">
            Select Clean Avatar Badge
          </label>
          <div className="flex flex-wrap items-center gap-2">
            {AVATAR_OPTIONS.map((emoji) => (
              <button
                key={emoji}
                type="button"
                onClick={() => {
                  setSelectedAvatar(emoji);
                  setAvatarError(false);
                }}
                className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl transition-all cursor-pointer ${
                  selectedAvatar === emoji
                    ? 'bg-emerald-600/20 border-2 border-emerald-500 scale-110 shadow-md'
                    : 'bg-[#181818] border border-gray-800 hover:border-gray-600 hover:scale-105'
                }`}
              >
                {emoji}
              </button>
            ))}
            {selectedAvatar !== '👨🏽' && (
              <button
                type="button"
                onClick={() => {
                  setSelectedAvatar('👨🏽');
                  setAvatarError(false);
                }}
                className="text-[11px] text-gray-400 hover:text-emerald-400 px-2 py-1 underline cursor-pointer ml-1"
              >
                Reset Default
              </button>
            )}
          </div>
        </div>

        {/* Skills Preview */}
        {user.skills && user.skills.length > 0 && (
          <div className="mb-6">
            <div className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">
              Verified Skills & Badges
            </div>
            <div className="flex flex-wrap gap-2">
              {user.skills.map((skill, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1.5 rounded-lg bg-[#181818] border border-gray-800 text-gray-200 text-xs font-medium"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Edit Form with Spacious Inputs */}
        <form onSubmit={handleSave} className="space-y-4 sm:space-y-5">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-300 mb-1.5">
              Full Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-[#141414] border border-gray-700 text-sm text-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-colors"
              placeholder="Your full legal or display name"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-300 mb-1.5">
              Phone Number (For OTP & Instant UPI Payouts)
            </label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-[#141414] border border-gray-700 text-sm text-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-colors font-mono"
              placeholder="+91 98765 43210"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-300 mb-1.5">
              Base Location / Work Hub Address
            </label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-[#141414] border border-gray-700 text-sm text-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-colors"
              placeholder="e.g., Anna Nagar, Chennai"
            />
          </div>

          <div className="pt-5 flex items-center justify-between border-t border-gray-800/80 mt-6 sm:mt-8">
            {firebaseUser ? (
              <button
                type="button"
                onClick={handleSignOut}
                className="px-4 py-2.5 text-xs sm:text-sm text-red-400 hover:text-red-300 hover:bg-red-950/30 rounded-xl border border-red-900/50 cursor-pointer flex items-center space-x-1.5 transition-colors font-semibold"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  openAuthModal('login');
                }}
                className="px-4 py-2.5 text-xs sm:text-sm text-emerald-400 hover:text-emerald-300 hover:bg-emerald-950/30 rounded-xl border border-emerald-900/50 cursor-pointer font-semibold transition-colors"
              >
                Switch Account
              </button>
            )}

            <div className="flex items-center space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 text-xs sm:text-sm font-semibold text-gray-400 hover:text-white cursor-pointer transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-black font-black text-xs sm:text-sm uppercase tracking-wider cursor-pointer flex items-center space-x-1.5 shadow-md shadow-emerald-600/20 transition-all hover:scale-[1.02]"
              >
                {isSaved ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Saved!</span>
                  </>
                ) : (
                  <span>Update Profile</span>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
