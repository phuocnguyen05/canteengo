import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Bell, 
  X, 
  CheckCheck, 
  ShoppingBag, 
  Wallet, 
  Info, 
  ChevronRight,
  Clock,
  Inbox
} from 'lucide-react';
import { Notification } from '../types/notification';
import { User } from '../types';
import { subscribeUserNotifications, markAsRead, markAllAsRead } from '../services/notificationService';
import { navigateToNotifTarget } from '../utils/notifNavigation';

interface NotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User | null;
  setActiveTab: (tab: any) => void;
  onSelectNotification?: (notif: Notification) => void;
}

export const NotificationModal: React.FC<NotificationModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  setActiveTab,
  onSelectNotification,
}) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [filterType, setFilterType] = useState<'ALL' | 'UNREAD' | 'ORDER' | 'WALLET'>('ALL');
  const navigate = useNavigate();

  useEffect(() => {
    if (!currentUser?.id) {
      console.log("[Notif] No currentUser");
      setNotifications([]);
      setUnreadCount(0);
      return;
    }
    
    console.log("[Notif] Subscribing for userId:", currentUser.id);
    
    const unsub = subscribeUserNotifications(
      currentUser.id, 
      (notifs) => {
        console.log("[Notif] Received:", notifs.length);
        setNotifications(notifs);
        setUnreadCount(notifs.filter(n => !n.isRead).length);
      }
    );
    return () => unsub();
  }, [currentUser?.id]);

  if (!isOpen) return null;

  const filteredNotifications = notifications.filter((n) => {
    if (filterType === 'UNREAD') return !n.isRead;
    if (filterType === 'ORDER') return n.type?.toLowerCase().includes('order') || n.relatedOrderId || n.type === 'order_new';
    if (filterType === 'WALLET') return n.type?.toLowerCase().includes('deposit') || n.type?.toLowerCase().includes('payment') || n.type?.toLowerCase().includes('refund') || n.relatedTransactionId;
    return true; // ALL
  });

  const handleClickNotif = async (notif: Notification) => {
    // 1. Đánh dấu đã đọc
    if (!notif.isRead) {
      await markAsRead(notif.id);
    }
    
    // 2. Đóng panel
    onClose();
    
    // 3. Điều hướng
    const result = await navigateToNotifTarget(
      notif, 
      currentUser, 
      navigate,
      onSelectNotification  // nếu có
    );
    
    // 4. Thông báo nếu không điều hướng được
    if (!result.success) {
      console.warn(result.message || "Không thể mở thông báo");
    }
  };

  const handleMarkAllRead = async () => {
    if (!currentUser?.id) return;
    await markAllAsRead(currentUser.id);
  };

  const formatRelativeTime = (timestamp: number) => {
    try {
      const diffMs = Date.now() - timestamp;
      const diffMinutes = Math.floor(diffMs / (1000 * 60));
      if (diffMinutes < 1) return 'Vừa xong';
      if (diffMinutes < 60) return `${diffMinutes} phút trước`;
      const diffHours = Math.floor(diffMinutes / 60);
      if (diffHours < 24) return `${diffHours} giờ trước`;
      const diffDays = Math.floor(diffHours / 24);
      return `${diffDays} ngày trước`;
    } catch (e) {
      return 'Mới đây';
    }
  };

  const getIcon = (type: string) => {
    if (type?.toLowerCase().includes('order')) {
      return <ShoppingBag className="w-4 h-4 text-[#E8B84B]" />;
    }
    if (type?.toLowerCase().includes('deposit') || type?.toLowerCase().includes('wallet') || type?.toLowerCase().includes('refund')) {
      return <Wallet className="w-4 h-4 text-[#E8B84B]" />;
    }
    return <Info className="w-4 h-4 text-[#E8B84B]" />;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center sm:justify-end sm:pr-12 pt-16 sm:pt-20 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200 p-3">
      {/* Backdrop overlay */}
      <div className="fixed inset-0" onClick={onClose} />

      <div className="relative w-full max-w-md bg-bg-card rounded-2xl shadow-2xl border border-border-base overflow-hidden flex flex-col max-h-[85vh] z-10 animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-4 bg-bg-primary text-text-primary flex items-center justify-between border-b border-border-base">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#E8B84B]/20 border border-[#E8B84B]/30 flex items-center justify-center text-[#E8B84B] shadow-xs">
              <Bell className="w-5 h-5 text-[#E8B84B] animate-bounce" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-base text-[#E8B84B] font-serif tracking-tight">Hộp Thư Thông Báo</h3>
                {unreadCount > 0 && (
                  <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-[#E8B84B] text-black animate-pulse">
                    {unreadCount} mới
                  </span>
                )}
              </div>
              <p className="text-[11px] text-text-secondary">Cập nhật đơn hàng và giao dịch của bạn</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-bg-input hover:bg-bg-elevated text-text-secondary hover:text-text-primary flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Filter Bar & Action */}
        <div className="p-3 bg-bg-primary border-b border-border-base flex items-center justify-between gap-2 overflow-x-auto no-scrollbar">
          <div className="flex items-center gap-1.5 text-xs">
            <button
              onClick={() => setFilterType('ALL')}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer whitespace-nowrap ${
                filterType === 'ALL'
                  ? 'bg-[#E8B84B] text-black shadow-2xs font-extrabold'
                  : 'bg-bg-input text-text-secondary hover:text-text-primary border border-border-base'
              }`}
            >
              Tất cả ({notifications.length})
            </button>
            <button
              onClick={() => setFilterType('UNREAD')}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer whitespace-nowrap ${
                filterType === 'UNREAD'
                  ? 'bg-[#E8B84B] text-black shadow-2xs font-extrabold'
                  : 'bg-bg-input text-text-secondary hover:text-text-primary border border-border-base'
              }`}
            >
              Chưa đọc ({unreadCount})
            </button>
            <button
              onClick={() => setFilterType('ORDER')}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer whitespace-nowrap ${
                filterType === 'ORDER'
                  ? 'bg-[#E8B84B] text-black shadow-2xs font-extrabold'
                  : 'bg-bg-input text-text-secondary hover:text-text-primary border border-border-base'
              }`}
            >
              Đơn hàng
            </button>
            <button
              onClick={() => setFilterType('WALLET')}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer whitespace-nowrap ${
                filterType === 'WALLET'
                  ? 'bg-[#E8B84B] text-black shadow-2xs font-extrabold'
                  : 'bg-bg-input text-text-secondary hover:text-text-primary border border-border-base'
              }`}
            >
              Ví & Nạp tiền
            </button>
          </div>

          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllRead}
              className="text-[11px] font-extrabold text-[#E8B84B] hover:underline flex items-center gap-1 whitespace-nowrap flex-shrink-0 cursor-pointer"
              title="Đánh dấu tất cả là đã đọc"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              <span>Đọc tất cả</span>
            </button>
          )}
        </div>

        {/* Notifications List Body */}
        <div className="p-3 overflow-y-auto space-y-2.5 flex-1 min-h-[250px] divide-y-0 custom-scrollbar">
          {filteredNotifications.length === 0 ? (
            <div className="py-12 text-center">
              <div className="w-12 h-12 rounded-full bg-bg-input text-text-secondary flex items-center justify-center mx-auto mb-2 border border-border-base">
                <Inbox className="w-6 h-6" />
              </div>
              <p className="text-xs font-bold text-text-primary">Không có thông báo nào</p>
              <p className="text-[11px] text-text-secondary mt-0.5">Hộp thư của bạn hiện chưa có tin nhắn ở mục này</p>
            </div>
          ) : (
            filteredNotifications.map((notif) => (
              <div
                key={notif.id}
                onClick={() => handleClickNotif(notif)}
                className={`p-3.5 rounded-2xl border transition-all cursor-pointer relative group hover:border-[#E8B84B]/60 ${
                  notif.isRead
                    ? 'bg-bg-card border-border-base text-text-secondary'
                    : 'bg-bg-card border-[#E8B84B]/40 text-text-primary shadow-2xs'
                }`}
              >
                {!notif.isRead && (
                  <span className="absolute top-3 right-3 w-2.5 h-2.5 rounded-full bg-[#E8B84B] animate-ping" />
                )}
                {!notif.isRead && (
                  <span className="absolute top-3 right-3 w-2.5 h-2.5 rounded-full bg-[#E8B84B]" />
                )}

                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl border flex items-center justify-center flex-shrink-0 mt-0.5 bg-[#E8B84B]/10 border-[#E8B84B]/30">
                    {getIcon(notif.type)}
                  </div>

                  <div className="flex-1 min-w-0 pr-3">
                    <h4 className="text-xs font-extrabold text-text-primary leading-tight mb-1 group-hover:text-[#E8B84B] transition-colors">
                      {notif.title}
                    </h4>
                    <p className="text-xs text-text-secondary leading-relaxed font-medium">
                      {notif.message}
                    </p>

                    <div className="mt-2 flex items-center justify-between text-[10px] text-text-secondary font-semibold">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-text-secondary" />
                        {formatRelativeTime(notif.createdAt)}
                      </span>

                      {(notif.relatedOrderId || notif.relatedTransactionId) && (
                        <span className="text-[#E8B84B] font-extrabold flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform">
                          Xem chi tiết <ChevronRight className="w-3 h-3" />
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-bg-primary border-t border-border-base text-center">
          <p className="text-[11px] text-text-secondary font-medium">
            Thông báo từ hệ thống CanteenGo
          </p>
        </div>
      </div>
    </div>
  );
};
