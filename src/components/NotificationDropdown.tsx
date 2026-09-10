import { AppNotification } from '../types';
import { Bell, CheckCheck, Briefcase, DollarSign, UserCheck, AlertCircle, X } from 'lucide-react';

interface NotificationDropdownProps {
  notifications: AppNotification[];
  isOpen: boolean;
  onClose: () => void;
  onMarkAllRead: () => void;
  onMarkOneRead: (id: string) => void;
}

export default function NotificationDropdown({
  notifications,
  isOpen,
  onClose,
  onMarkAllRead,
  onMarkOneRead,
}: NotificationDropdownProps) {
  if (!isOpen) return null;

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const getIcon = (type: AppNotification['type']) => {
    switch (type) {
      case 'job_alert':
        return <Briefcase className="w-4 h-4 text-[#5cd65c]" />;
      case 'payout':
        return <DollarSign className="w-4 h-4 text-[#35be35]" />;
      case 'referral':
        return <UserCheck className="w-4 h-4 text-[#95e895]" />;
      case 'application_update':
        return <CheckCheck className="w-4 h-4 text-[#35be35]" />;
      default:
        return <AlertCircle className="w-4 h-4 text-[#999999]" />;
    }
  };

  return (
    <div className="absolute right-0 top-12 w-80 sm:w-96 bg-[#161616] border border-[#2a2a2a] rounded-2xl shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
      <div className="flex items-center justify-between px-4 py-3 border-b border-[#222222] bg-[#121212]">
        <div className="flex items-center gap-2">
          <Bell className="w-4 h-4 text-[#35be35]" />
          <span className="font-semibold text-sm text-[#f2f2f2]">Smart Notifications</span>
          {unreadCount > 0 && (
            <span className="px-1.5 py-0.5 text-[11px] font-bold bg-[#35be35] text-[#080808] rounded-full">
              {unreadCount}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <button
              onClick={onMarkAllRead}
              className="text-[12px] text-[#5cd65c] hover:underline cursor-pointer"
            >
              Mark all read
            </button>
          )}
          <button
            onClick={onClose}
            className="p-1 text-[#999999] hover:text-[#f2f2f2] rounded-lg hover:bg-[#222222]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="max-h-[360px] overflow-y-auto divide-y divide-[#1e1e1e]">
        {notifications.length === 0 ? (
          <div className="p-8 text-center text-[#555555] text-sm">
            No notifications yet. You will get alerts for nearby jobs and instant payouts.
          </div>
        ) : (
          notifications.map((notif) => (
            <div
              key={notif.id}
              onClick={() => onMarkOneRead(notif.id)}
              className={`p-3.5 flex items-start gap-3 hover:bg-[#1c1c1c] transition-colors cursor-pointer ${
                !notif.id ? '' : !notif.is_read ? 'bg-[#0d2b0d]/20' : ''
              }`}
            >
              <div
                className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border ${
                  !notif.is_read
                    ? 'bg-[#164516] border-[#35be35]/40 text-[#5cd65c]'
                    : 'bg-[#222222] border-[#2a2a2a] text-[#999999]'
                }`}
              >
                {getIcon(notif.type)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <h5 className="text-[13px] font-semibold text-[#f2f2f2] truncate">
                    {notif.title || 'Notification'}
                  </h5>
                  {!notif.is_read && (
                    <span className="w-2 h-2 rounded-full bg-[#35be35] shrink-0" />
                  )}
                </div>
                <p className="text-[12px] text-[#999999] mt-0.5 line-clamp-2 leading-relaxed">
                  {notif.message}
                </p>
                <span className="text-[10px] text-[#555555] mt-1 inline-block">
                  {notif.created_at
                    ? new Date(notif.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                    : notif.time || 'Just now'}
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="p-2.5 bg-[#101010] border-t border-[#1e1e1e] text-center">
        <a
          href="#jobs"
          onClick={onClose}
          className="text-xs text-[#5cd65c] font-medium hover:underline inline-flex items-center gap-1"
        >
          View live job radar & radar alerts →
        </a>
      </div>
    </div>
  );
}
