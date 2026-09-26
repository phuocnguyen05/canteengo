import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShoppingBag, ArrowRight, ChevronUp } from 'lucide-react';
import { CartItem } from '../types';

interface FloatingBottomCartBarProps {
  cartItems: CartItem[];
  onOpenCart: () => void;
  isVisible: boolean;
  showScrollTop?: boolean;
  onScrollToTop?: () => void;
}

export const FloatingBottomCartBar: React.FC<FloatingBottomCartBarProps> = ({
  cartItems,
  onOpenCart,
  isVisible,
  showScrollTop = false,
  onScrollToTop,
}) => {
  const [isBumping, setIsBumping] = useState(false);

  const totalCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const totalAmount = cartItems.reduce((sum, item) => sum + item.totalPrice * item.quantity, 0);

  const lastItem = cartItems[cartItems.length - 1];
  const lastItemTitle = lastItem?.isCombo
    ? (lastItem.comboName || 'Gói combo 4 món')
    : (lastItem?.menuItem?.name || 'Món đã chọn');

  // Trigger bounce animation whenever item count changes
  useEffect(() => {
    if (totalCount > 0) {
      setIsBumping(true);
      const timer = setTimeout(() => setIsBumping(false), 300);
      return () => clearTimeout(timer);
    }
  }, [totalCount, totalAmount]);

  const shouldShow = isVisible && cartItems.length > 0 && totalCount > 0;

  return (
    <>
      <AnimatePresence>
        {shouldShow && (
          <div
            id="floating-bottom-cart-container"
            className="fixed bottom-3 sm:bottom-4 left-0 right-0 z-40 px-3 sm:px-6 pointer-events-none flex flex-col items-center transition-all duration-300"
          >
            {/* Main Cart Bar */}
            <motion.div
              id="floating-bottom-cart-bar"
              initial={{ y: 80, opacity: 0, scale: 0.96 }}
              animate={{
                y: 0,
                opacity: 1,
                scale: isBumping ? 1.02 : 1,
              }}
              exit={{ y: 80, opacity: 0, scale: 0.96 }}
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              className="pointer-events-auto w-full max-w-[calc(100vw-5.5rem)] sm:max-w-md md:max-w-lg lg:max-w-xl bg-bg-primary/95 backdrop-blur-md text-text-primary rounded-2xl p-2.5 sm:p-3 shadow-2xl shadow-black/80 border border-[#E8B84B]/40 flex items-center justify-between gap-2.5 sm:gap-3"
            >
              {/* Left Info: Cart Icon & Details */}
              <div
                onClick={onOpenCart}
                className="flex items-center gap-2 sm:gap-2.5 cursor-pointer min-w-0 flex-1 hover:opacity-95 transition-opacity"
              >
                {/* Shopping Bag Icon with Badge */}
                <div className="relative w-10 h-10 rounded-xl bg-[#E8B84B]/20 border border-[#E8B84B]/40 flex items-center justify-center text-[#E8B84B] flex-shrink-0">
                  <ShoppingBag className="w-5 h-5" />
                  <motion.span
                    key={totalCount}
                    initial={{ scale: 0.6 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1.5 -right-1.5 min-w-[20px] h-5 px-1 rounded-full bg-[#E8B84B] text-black text-[11px] font-black flex items-center justify-center shadow-md border border-bg-primary"
                  >
                    {totalCount}
                  </motion.span>
                </div>

                {/* Price and Latest Item description */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline gap-1.5 sm:gap-2">
                    <span className="text-[#E8B84B] font-black text-sm sm:text-base tracking-tight font-serif">
                      {totalAmount.toLocaleString('vi-VN')}đ
                    </span>
                    <span className="text-[11px] font-semibold text-text-secondary">
                      ({totalCount} món)
                    </span>
                  </div>
                  <p className="text-[11px] text-text-secondary truncate max-w-[125px] sm:max-w-xs flex items-center gap-1">
                    <span className="text-[#E8B84B]/90 font-medium flex-shrink-0">Vừa thêm:</span>
                    <span className="truncate">{lastItemTitle}</span>
                  </p>
                </div>
              </div>

              {/* Right Action: Button to open CartDrawer */}
              <button
                id="floating-cart-checkout-btn"
                type="button"
                onClick={onOpenCart}
                className="flex items-center gap-1 sm:gap-1.5 px-3.5 sm:px-4 py-2 rounded-xl bg-[#E8B84B] hover:bg-[#F4C95D] text-black font-extrabold text-xs sm:text-sm shadow-lg shadow-[#E8B84B]/20 transition-all duration-200 active:scale-95 flex-shrink-0 cursor-pointer"
              >
                <span>Xem giỏ & Đặt</span>
                <ArrowRight className="w-3.5 h-3.5 stroke-[3]" />
              </button>
            </motion.div>

            {/* Trở lại đầu trang khi kéo xuống ở dưới thanh xem giỏ & đặt */}
            <AnimatePresence>
              {showScrollTop && (
                <motion.button
                  id="scroll-to-top-btn-under-cart"
                  initial={{ opacity: 0, y: 8, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  type="button"
                  onClick={onScrollToTop}
                  className="pointer-events-auto mt-2 inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-bg-card/95 hover:bg-bg-input text-text-secondary hover:text-text-primary text-xs font-bold border border-border-base shadow-lg backdrop-blur-md transition-all hover:scale-105 active:scale-95 cursor-pointer group"
                  title="Cuộn lên đầu trang"
                >
                  <ChevronUp className="w-3.5 h-3.5 text-[#E8B84B] group-hover:-translate-y-0.5 transition-transform" />
                  <span>Trở lại đầu trang</span>
                </motion.button>
              )}
            </AnimatePresence>
          </div>
        )}
      </AnimatePresence>

      {/* Standalone Trở lại đầu trang khi không có giỏ hàng nhưng kéo xuống */}
      <AnimatePresence>
        {showScrollTop && !shouldShow && (
          <div className="fixed bottom-4 sm:bottom-5 left-0 right-0 z-40 px-3 pointer-events-none flex justify-center">
            <motion.button
              id="scroll-to-top-btn-standalone"
              initial={{ opacity: 0, y: 15, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 0, scale: 1 }}
              type="button"
              onClick={onScrollToTop}
              className="pointer-events-auto inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-bg-card/95 hover:bg-bg-input text-text-secondary hover:text-text-primary text-xs font-bold border border-border-base shadow-xl backdrop-blur-md transition-all hover:scale-105 active:scale-95 cursor-pointer group"
              title="Cuộn lên đầu trang"
            >
              <ChevronUp className="w-4 h-4 text-[#E8B84B] group-hover:-translate-y-0.5 transition-transform" />
              <span>Trở lại đầu trang</span>
            </motion.button>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};
