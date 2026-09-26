import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  Tag, 
  ChevronRight, 
  Percent, 
  Flame, 
  Clock, 
  X,
  Volume2,
  Bell
} from 'lucide-react';
import { Voucher } from '../types';

interface PromoBannerProps {
  vouchers: Voucher[];
  onOpenComboModal?: () => void;
  onSelectVoucher?: (code: string) => void;
  unreadNotificationCount?: number;
  onOpenNotifications?: () => void;
}

const PROMO_EVENTS = [
  {
    id: 1,
    tag: 'SIÊU ƯU ĐÃI TRƯA',
    title: 'Giảm ngay 15% khi tự tạo Combo 4 khay dinh dưỡng',
    code: 'COMBOYEU',
    highlight: 'Mã: COMBOYEU',
    bgGradient: 'from-bg-card via-bg-input to-bg-card',
    expires: 'Áp dụng khung giờ 10:30 - 13:30 hàng ngày'
  },
  {
    id: 2,
    tag: 'ĐẶC QUYỀN SINH VIÊN',
    title: 'Giảm 20% cho đơn hàng từ 80k khi thanh toán qua Ví C-Pay',
    code: 'STUDENT20',
    highlight: 'Mã: STUDENT20',
    bgGradient: 'from-bg-card via-bg-input to-bg-card',
    expires: 'Ưu đãi tháng 3 cho toàn trường'
  },
  {
    id: 3,
    tag: 'MÓN MỚI TUẦN NÀY',
    title: 'Cơm Gà Xối Mỡ Da Giòn & Sữa Chua Nếp Cẩm Mộc Châu ra mắt',
    code: 'CANTEEN10',
    highlight: 'Nhập CANTEEN10 giảm 10k',
    bgGradient: 'from-bg-card via-bg-input to-bg-card',
    expires: 'Số lượng có hạn mỗi ngày'
  }
];

export const PromoBanner: React.FC<PromoBannerProps> = ({
  vouchers,
  onOpenComboModal,
  onSelectVoucher,
  unreadNotificationCount = 0,
  onOpenNotifications,
}) => {
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isDismissed, setIsDismissed] = useState<boolean>(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % PROMO_EVENTS.length);
    }, 4500);
    return () => clearInterval(timer);
  }, []);

  if (isDismissed) return null;

  const currentPromo = PROMO_EVENTS[currentIndex];

  return (
    <aside aria-label="Thông báo sự kiện và khuyến mãi" className={`relative bg-gradient-to-r ${currentPromo.bgGradient} text-text-primary text-xs border-b border-border-base transition-colors duration-700 shadow-sm overflow-hidden z-30`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2 sm:py-2.5 flex items-center justify-between gap-3">
        
        {/* Left event details */}
        <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
          <span className="hidden sm:inline-flex items-center gap-1 bg-[#E8B84B]/20 backdrop-blur-xs text-[#E8B84B] font-extrabold px-2.5 py-0.5 rounded-full text-[10px] tracking-wide uppercase border border-[#E8B84B]/40 flex-shrink-0 animate-pulse">
            <Flame className="w-3 h-3 text-[#E8B84B]" />
            {currentPromo.tag}
          </span>

          <div className="flex items-center gap-2 truncate">
            <span className="font-bold tracking-tight truncate text-[11px] sm:text-xs">
              {currentPromo.title}
            </span>
            <span className="hidden md:inline-block text-white/60">•</span>
            <span className="hidden md:inline text-[11px] text-white/90 font-medium">
              {currentPromo.expires}
            </span>
          </div>
        </div>

        {/* Right CTA & voucher copy */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            type="button"
            onClick={() => {
              if (currentPromo.code === 'COMBOYEU' && onOpenComboModal) {
                onOpenComboModal();
              } else if (onSelectVoucher) {
                onSelectVoucher(currentPromo.code);
              }
            }}
            className="px-2.5 py-1 rounded-lg bg-white text-slate-900 hover:bg-amber-100 font-extrabold text-[11px] shadow-xs flex items-center gap-1 transition-all active:scale-95"
            title="Sử dụng ngay ưu đãi"
          >
            <Tag className="w-3 h-3 text-orange-600" />
            <span>{currentPromo.highlight}</span>
            <ChevronRight className="w-3 h-3 opacity-60" />
          </button>

          {/* Notification Button on Banner */}
          {onOpenNotifications && (
            <button
              type="button"
              onClick={onOpenNotifications}
              className="px-2.5 py-1 rounded-lg bg-black/20 hover:bg-black/30 border border-white/20 text-white font-extrabold text-[11px] shadow-2xs flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer relative"
              title="Xem tất cả thông báo đã gửi tới"
            >
              <Bell className="w-3.5 h-3.5 text-amber-300 animate-bounce" />
              <span className="hidden sm:inline">Thông báo</span>
              {unreadNotificationCount > 0 && (
                <span className="w-4 h-4 rounded-full bg-rose-500 text-white text-[9px] font-black flex items-center justify-center animate-pulse">
                  {unreadNotificationCount}
                </span>
              )}
            </button>
          )}

          {/* Dots navigation */}
          <div className="hidden lg:flex items-center gap-1 pl-1">
            {PROMO_EVENTS.map((p, idx) => (
              <button
                key={p.id}
                onClick={() => setCurrentIndex(idx)}
                className={`w-1.5 h-1.5 rounded-full transition-all ${
                  currentIndex === idx ? 'w-4 bg-white' : 'bg-white/40 hover:bg-white/70'
                }`}
                aria-label={`Chuyển đến ưu đãi ${idx + 1}`}
              />
            ))}
          </div>

          {/* Close button */}
          <button
            type="button"
            onClick={() => setIsDismissed(true)}
            className="w-6 h-6 rounded-md hover:bg-white/20 text-white/80 hover:text-white flex items-center justify-center transition-colors ml-1"
            title="Đóng thông báo"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>
    </aside>
  );
};
