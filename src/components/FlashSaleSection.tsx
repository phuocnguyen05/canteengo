import React, { useState, useEffect, useMemo } from 'react';
import { Zap, Clock, Flame, ShoppingBag, Eye } from 'lucide-react';
import { MenuItem, CartItem } from '../types';

interface FlashSaleSectionProps {
  menuItems: MenuItem[];
  cartItems?: CartItem[];
  onAddToCart: (item: MenuItem, quantity?: number, note?: string, isFlashSale?: boolean) => void;
  onViewItemDetail: (item: MenuItem, isFlashSale?: boolean) => void;
}

export const FlashSaleSection: React.FC<FlashSaleSectionProps> = ({
  menuItems,
  cartItems = [],
  onAddToCart,
  onViewItemDetail,
}) => {
  // Filter active or configured flash sale items - memoized to keep stable array reference
  const flashSaleItems = useMemo(
    () => menuItems.filter((i) => i.isFlashSale && i.flashPrice),
    [menuItems]
  );

  const [timeLeft, setTimeLeft] = useState<{ hours: number; minutes: number; seconds: number }>({
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  // Calculate earliest end time among active flash sale items or default 2 hours
  useEffect(() => {
    const updateCountdown = () => {
      let targetTime = Date.now() + 2 * 3600 * 1000;

      // Find nearest end time
      const validEndTimes = flashSaleItems
        .map((i) => (i.flashSaleEndTime ? new Date(i.flashSaleEndTime).getTime() : 0))
        .filter((t) => t > Date.now());

      if (validEndTimes.length > 0) {
        targetTime = Math.min(...validEndTimes);
      }

      const diff = Math.max(0, targetTime - Date.now());
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeLeft((prev) => {
        if (prev.hours === hours && prev.minutes === minutes && prev.seconds === seconds) {
          return prev;
        }
        return { hours, minutes, seconds };
      });
    };

    updateCountdown();
    const timer = setInterval(updateCountdown, 1000);
    return () => clearInterval(timer);
  }, [flashSaleItems]);

  if (flashSaleItems.length === 0) return null;

  const formatDigit = (num: number) => num.toString().padStart(2, '0');

  return (
    <div className="mb-10 sm:mb-12 rounded-3xl bg-gradient-to-br from-bg-primary via-bg-card to-bg-input p-5 sm:p-7 text-text-primary shadow-[0_12px_40px_rgba(0,0,0,0.8)] relative overflow-hidden border border-[#E8B84B]/30">
      {/* Background Glow FX */}
      <div className="absolute -right-20 -top-20 w-72 h-72 bg-[#E8B84B]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -left-20 -bottom-20 w-72 h-72 bg-[#E8B84B]/5 rounded-full blur-3xl pointer-events-none" />

      {/* Header Bar with Countdown */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-border-base relative z-10">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-[#E8B84B]/20 border border-[#E8B84B]/40 text-[#E8B84B] flex items-center justify-center font-black shadow-lg animate-pulse flex-shrink-0">
            <Zap className="w-6 h-6 text-[#E8B84B] fill-[#E8B84B]" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-serif font-black tracking-tight text-[#E8B84B] uppercase flex items-center gap-2">
                ⚡ GIỜ VÀNG FLASH SALE
              </h2>
              <span className="bg-[#E8B84B]/20 backdrop-blur-md text-[#E8B84B] border border-[#E8B84B]/30 font-extrabold text-[10px] px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                Số lượng có hạn
              </span>
            </div>
            <p className="text-xs sm:text-sm text-text-secondary font-medium mt-0.5">
              Đồng giá ưu đãi đặc biệt hôm nay – Nhanh tay nhận suất đặc quyền!
            </p>
          </div>
        </div>

        {/* Live Countdown Box */}
        <div className="flex items-center gap-2.5 bg-bg-primary px-4 py-2.5 rounded-2xl border border-[#E8B84B]/40 shadow-inner flex-shrink-0 self-start md:self-auto">
          <Clock className="w-4 h-4 text-[#E8B84B] animate-spin" style={{ animationDuration: '6s' }} />
          <span className="text-xs font-bold text-text-secondary hidden sm:inline">Kết thúc trong:</span>
          <div className="flex items-center gap-1.5 font-mono text-base font-black text-[#E8B84B]">
            <span className="bg-bg-card px-2.5 py-1 rounded-xl border border-[#E8B84B]/30 text-[#E8B84B] tracking-wider shadow-2xs">
              {formatDigit(timeLeft.hours)}
            </span>
            <span className="text-[#E8B84B] font-bold">:</span>
            <span className="bg-bg-card px-2.5 py-1 rounded-xl border border-[#E8B84B]/30 text-[#E8B84B] tracking-wider shadow-2xs">
              {formatDigit(timeLeft.minutes)}
            </span>
            <span className="text-[#E8B84B] font-bold">:</span>
            <span className="bg-bg-card px-2.5 py-1 rounded-xl border border-[#E8B84B]/30 text-[#E8B84B] tracking-wider shadow-2xs">
              {formatDigit(timeLeft.seconds)}
            </span>
          </div>
        </div>
      </div>

      {/* Flash Sale Items Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5 mt-6 relative z-10">
        {flashSaleItems.map((item) => {
          const discountPct = Math.round(((item.price - (item.flashPrice || item.price)) / item.price) * 100);
          const totalQty = item.flashSaleTotalQty || 20;
          const soldCount = item.flashSaleSoldCount || 0;
          const isSoldOut = soldCount >= totalQty || item.stock <= 0;
          const percentSold = Math.min(100, Math.round((soldCount / totalQty) * 100));

          // Prepare item object with flash sale price when adding to cart
          const itemForCart: MenuItem = {
            ...item,
            price: item.flashPrice || item.price,
            badge: `⚡ Flash Sale -${discountPct}%`
          };

          return (
            <div
              key={item.id}
              className="bg-bg-card text-text-primary rounded-2xl p-4 shadow-lg border border-border-base hover:border-[#E8B84B]/60 hover:shadow-[0_0_25px_rgba(232,184,75,0.2)] hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between group relative overflow-hidden"
            >
              {/* Image & Discount Badge */}
              <div className="relative aspect-4/3 rounded-xl overflow-hidden mb-3.5 bg-bg-input cursor-pointer" onClick={() => onViewItemDetail(itemForCart, true)}>
                <img
                  src={item.imageUrl}
                  alt={item.name}
                  className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-500 ease-out"
                />
                
                {/* Overlay gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-bg-primary/80 via-transparent to-transparent pointer-events-none" />

                {/* Discount Tag */}
                <div className="absolute top-2.5 left-2.5 bg-[#E8B84B] text-black font-extrabold text-xs px-2.5 py-1 rounded-lg shadow-md flex items-center gap-1">
                  <Flame className="w-3.5 h-3.5 fill-black text-black" />
                  <span>GIẢM {discountPct}%</span>
                </div>

                {/* Status Badge */}
                {isSoldOut ? (
                  <div className="absolute inset-0 bg-bg-primary/85 backdrop-blur-xs flex items-center justify-center p-2 text-center">
                    <span className="bg-rose-900/90 text-rose-200 font-extrabold text-xs px-3.5 py-2 rounded-xl shadow-xl border border-rose-500/50 uppercase tracking-wider">
                      HẾT SUẤT ƯU ĐÃI
                    </span>
                  </div>
                ) : (
                  <div className="absolute bottom-2.5 left-2.5 right-2.5 bg-bg-primary/80 backdrop-blur-md text-text-primary text-[11px] font-bold px-2.5 py-1 rounded-lg flex items-center justify-between border border-border-base">
                    <span className="text-[#E8B84B] flex items-center gap-1">
                      <Zap className="w-3 h-3 fill-[#E8B84B]" /> Giảm giá sốc
                    </span>
                    <span className="text-text-secondary">Còn {totalQty - soldCount} suất</span>
                  </div>
                )}
              </div>

              {/* Content Info */}
              <div>
                <h3
                  onClick={() => onViewItemDetail(itemForCart, true)}
                  className="font-serif font-bold text-text-primary text-base hover:text-[#E8B84B] transition-colors cursor-pointer line-clamp-1"
                >
                  {item.name}
                </h3>
                <p className="text-xs text-text-secondary line-clamp-1 mt-0.5 mb-2.5 font-medium">
                  {item.ingredients}
                </p>

                {/* Price Display */}
                <div className="flex items-baseline gap-2 mb-3">
                  <span className="text-xl font-extrabold text-[#E8B84B] font-mono tracking-tight">
                    {(item.flashPrice || item.price).toLocaleString('vi-VN')}₫
                  </span>
                  <span className="text-xs text-text-secondary/60 line-through font-semibold font-mono">
                    {item.price.toLocaleString('vi-VN')}₫
                  </span>
                </div>

                {/* Progress Bar for Sold Quantity */}
                <div className="mb-3.5">
                  <div className="flex items-center justify-between text-[11px] font-bold mb-1.5">
                    <span className={isSoldOut ? 'text-rose-400' : 'text-text-secondary'}>
                      {isSoldOut ? 'Đã hết suất hôm nay' : `Đã bán ${soldCount}/${totalQty} suất`}
                    </span>
                    <span className="text-[#E8B84B] font-extrabold">{percentSold}%</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-bg-input overflow-hidden p-0.5 border border-border-base">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        isSoldOut
                          ? 'bg-rose-600'
                          : 'bg-[#E8B84B]'
                      }`}
                      style={{ width: `${percentSold}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 pt-1">
                <button
                  onClick={() => onViewItemDetail(itemForCart, true)}
                  className="p-2.5 rounded-xl bg-bg-input hover:bg-bg-elevated text-text-secondary hover:text-text-primary transition-colors cursor-pointer border border-border-base"
                  title="Xem chi tiết món"
                >
                  <Eye className="w-4 h-4" />
                </button>
                <button
                  disabled={isSoldOut}
                  onClick={() => onAddToCart(itemForCart, 1, undefined, true)}
                  className={`flex-1 h-10 px-3 rounded-xl font-extrabold text-xs flex items-center justify-center gap-1.5 transition-all shadow-md active:scale-95 cursor-pointer ${
                    isSoldOut
                      ? 'bg-bg-input text-text-secondary/50 cursor-not-allowed shadow-none border border-border-base'
                      : 'bg-[#E8B84B] hover:bg-[#F4C95D] text-black shadow-[#E8B84B]/20'
                  }`}
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>{isSoldOut ? 'Hết suất' : 'Thêm Flash Sale'}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
