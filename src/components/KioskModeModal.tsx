import React, { useState, useEffect, useMemo } from 'react';
import { 
  X, 
  ShoppingBag, 
  Plus, 
  Minus, 
  Trash2, 
  Flame, 
  Utensils, 
  CheckCircle2, 
  Clock, 
  Sparkles, 
  Search, 
  Leaf, 
  Coffee, 
  Printer, 
  Tv, 
  Store,
  ChevronRight,
  RotateCcw
} from 'lucide-react';
import { MenuItem, Category, Order, User, CanteenStatusConfig } from '../types';

interface KioskModeModalProps {
  isOpen: boolean;
  onClose: () => void;
  menuItems: MenuItem[];
  categories: Category[];
  currentUser: User | null;
  statusConfig?: CanteenStatusConfig;
  onPlaceOrder: (newOrder: Order) => void;
  showToast?: (message: string, type?: 'success' | 'info' | 'error') => void;
}

interface KioskCartItem {
  item: MenuItem;
  quantity: number;
  note?: string;
}

export const KioskModeModal: React.FC<KioskModeModalProps> = ({
  isOpen,
  onClose,
  menuItems,
  categories,
  currentUser,
  statusConfig,
  onPlaceOrder,
  showToast,
}) => {
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [onlyVegan, setOnlyVegan] = useState(false);
  const [dineOption, setDineOption] = useState<'DINE_IN' | 'TAKE_AWAY'>('DINE_IN');
  const [kioskCart, setKioskCart] = useState<KioskCartItem[]>([]);
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null);
  const [autoResetTimer, setAutoResetTimer] = useState<number>(5);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Clock live timer
  useEffect(() => {
    if (!isOpen) return;
    const interval = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, [isOpen]);

  // Auto reset timer on success
  useEffect(() => {
    if (!completedOrder) return;
    setAutoResetTimer(5);

    const interval = setInterval(() => {
      setAutoResetTimer(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          setCompletedOrder(null);
          setKioskCart([]);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [completedOrder]);

  const filteredItems = useMemo(() => {
    return menuItems.filter(item => {
      if (selectedCategoryId !== null && item.categoryId !== selectedCategoryId) return false;
      if (onlyVegan && !item.isVegan) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return item.name.toLowerCase().includes(q) || item.ingredients.toLowerCase().includes(q);
      }
      return true;
    });
  }, [menuItems, selectedCategoryId, onlyVegan, searchQuery]);

  const totalAmount = useMemo(() => {
    return kioskCart.reduce((sum, ci) => sum + ci.item.price * ci.quantity, 0);
  }, [kioskCart]);

  const totalCalories = useMemo(() => {
    return kioskCart.reduce((sum, ci) => sum + ci.item.calories * ci.quantity, 0);
  }, [kioskCart]);

  const totalItemsCount = useMemo(() => {
    return kioskCart.reduce((sum, ci) => sum + ci.quantity, 0);
  }, [kioskCart]);

  const handleAddToCart = (item: MenuItem) => {
    if (item.stock <= 0) {
      if (showToast) showToast('Món ăn đã hết', 'error');
      return;
    }

    setKioskCart(prev => {
      const existing = prev.find(ci => ci.item.id === item.id);
      if (existing) {
        if (existing.quantity >= item.stock) {
          if (showToast) showToast(`Món này chỉ còn ${item.stock} suất`, 'error');
          return prev;
        }
        return prev.map(ci => ci.item.id === item.id ? { ...ci, quantity: ci.quantity + 1 } : ci);
      }
      return [...prev, { item, quantity: 1 }];
    });
  };

  const handleUpdateQuantity = (itemId: number, delta: number) => {
    setKioskCart(prev => {
      return prev.map(ci => {
        if (ci.item.id === itemId) {
          const newQty = ci.quantity + delta;
          if (newQty <= 0) return null;
          if (newQty > ci.item.stock) {
            if (showToast) showToast(`Món này chỉ còn ${ci.item.stock} suất`, 'error');
            return ci;
          }
          return { ...ci, quantity: newQty };
        }
        return ci;
      }).filter(Boolean) as KioskCartItem[];
    });
  };

  const handleClearCart = () => {
    setKioskCart([]);
  };

  const handleConfirmKioskOrder = () => {
    if (kioskCart.length === 0) return;

    const orderId = Date.now();
    const orderCode = `KS-${Math.floor(100 + Math.random() * 900)}`;
    const now = new Date();
    const timeFormatted = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    const newOrder: Order = {
      id: orderId,
      orderCode,
      userId: currentUser?.id || 9999,
      receiverName: currentUser?.fullName || `Khách Kiosk #${orderCode}`,
      phone: currentUser?.phone || '0900000000',
      pickupArea: dineOption === 'DINE_IN' ? 'Khu vực ăn tại chỗ (Căn-tin)' : 'Khu vực quầy mang về (Take-away)',
      pickupTime: `Hôm nay ${timeFormatted}`,
      totalAmount,
      finalAmount: totalAmount,
      totalCalories,
      status: 'PENDING',
      paymentMethod: 'COD',
      paymentStatus: 'PAID',
      notes: `[KIOSK TỰ PHỤC VỤ] ${dineOption === 'DINE_IN' ? '🍽️ Ăn tại chỗ' : '🥡 Mang về'}`,
      orderDate: now.toISOString().split('T')[0],
      createdAt: now.toISOString(),
      estimatedCompletionTime: timeFormatted,
      items: kioskCart.map((ci, idx) => ({
        id: idx + 1,
        orderId,
        itemId: ci.item.id,
        itemName: ci.item.name,
        quantity: ci.quantity,
        unitPrice: ci.item.price,
        isCombo: false,
        isFlashSale: false,
      })),
    };

    onPlaceOrder(newOrder);
    setCompletedOrder(newOrder);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-md text-white flex flex-col font-sans select-none animate-in fade-in duration-200">
      
      {/* KIOSK TOP HEADER */}
      <header className="h-16 bg-slate-900 border-b border-slate-800 px-6 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#E8B84B] text-black flex items-center justify-center font-black text-lg shadow-md shadow-[#E8B84B]/20">
            <Store className="w-5 h-5 fill-black" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-black tracking-tight text-white uppercase font-serif">
                CanteenGo Kiosk Tự Phục Vụ
              </h1>
              <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-[11px] font-extrabold">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>Sẵn sàng phục vụ</span>
              </span>
            </div>
            <p className="text-xs text-text-secondary font-medium">
              Chạm màn hình chọn món &bull; Nhận vé số thứ tự tại quầy
            </p>
          </div>
        </div>

        {/* Live Clock & Dine Option */}
        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-2 bg-bg-card px-3 py-1.5 rounded-xl border border-border-base text-xs font-mono font-bold text-[#E8B84B]">
            <Clock className="w-4 h-4 text-[#E8B84B]" />
            <span>
              {currentTime.toLocaleTimeString('vi-VN')} &bull; {currentTime.toLocaleDateString('vi-VN', { weekday: 'short', day: '2-digit', month: '2-digit' })}
            </span>
          </div>

          <div className="flex items-center bg-bg-card p-1 rounded-xl border border-border-base">
            <button
              onClick={() => setDineOption('DINE_IN')}
              className={`px-3 py-1.5 rounded-lg text-xs font-extrabold transition-all cursor-pointer ${
                dineOption === 'DINE_IN'
                  ? 'bg-[#E8B84B] text-black shadow-sm'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              🍽️ Ăn tại chỗ
            </button>
            <button
              onClick={() => setDineOption('TAKE_AWAY')}
              className={`px-3 py-1.5 rounded-lg text-xs font-extrabold transition-all cursor-pointer ${
                dineOption === 'TAKE_AWAY'
                  ? 'bg-[#E8B84B] text-black shadow-sm'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              🥡 Mang về
            </button>
          </div>

          <button
            onClick={onClose}
            className="h-10 px-3.5 rounded-xl bg-slate-800 hover:bg-rose-600 hover:text-white text-slate-300 text-xs font-extrabold transition-all flex items-center gap-1.5 border border-slate-700 cursor-pointer"
          >
            <X className="w-4 h-4" />
            <span>Thoát Kiosk</span>
          </button>
        </div>
      </header>

      {/* KIOSK MAIN BODY */}
      {completedOrder ? (
        /* KIOSK ORDER SUCCESS TICKET SCREEN */
        <div className="flex-1 flex items-center justify-center p-6 bg-radial from-slate-900 to-slate-950">
          <div className="max-w-md w-full bg-white text-slate-900 rounded-3xl p-8 shadow-2xl text-center space-y-6 animate-in zoom-in-95 duration-200">
            <div className="w-20 h-20 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle2 className="w-12 h-12" />
            </div>

            <div className="space-y-1">
              <span className="px-3 py-1 rounded-full bg-orange-100 text-orange-800 text-xs font-black uppercase tracking-wider">
                {dineOption === 'DINE_IN' ? '🍽️ Ăn tại chỗ' : '🥡 Mang về'}
              </span>
              <h2 className="text-2xl font-black text-slate-900 mt-2">
                ĐÃ NHẬN ĐƠN HÀNG!
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                Vui lòng theo dõi số gọi trên màn hình TV tại quầy nhận món
              </p>
            </div>

            <div className="p-6 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-300 space-y-2">
              <div className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                SỐ THỨ TỰ CỦA BẠN
              </div>
              <div className="text-5xl font-black text-orange-600 font-mono tracking-tight">
                #{completedOrder.orderCode}
              </div>
              <div className="text-xs font-bold text-slate-600 pt-2 border-t border-slate-200 flex justify-between">
                <span>Tổng cộng:</span>
                <span className="font-extrabold text-slate-900 text-sm">
                  {completedOrder.totalPrice.toLocaleString('vi-VN')}₫
                </span>
              </div>
            </div>

            <div className="space-y-3">
              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-900 text-xs font-bold flex items-center justify-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping"></span>
                <span>Tự động chuyển về trang chủ sau <strong>{autoResetTimer}s</strong></span>
              </div>

              <button
                onClick={() => {
                  setCompletedOrder(null);
                  setKioskCart([]);
                }}
                className="w-full py-3.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-black text-sm transition-all shadow-lg active:scale-98 cursor-pointer flex items-center justify-center gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Đặt Lượt Tiếp Theo ({autoResetTimer}s)</span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* KIOSK 3-COLUMN SPLIT SCREEN */
        <div className="flex-1 flex overflow-hidden">
          
          {/* COLUMN 1: LARGE CATEGORY SIDEBAR */}
          <aside className="w-64 bg-slate-900/90 border-r border-slate-800 flex flex-col shrink-0 overflow-y-auto">
            <div className="p-4 border-b border-slate-800">
              <div className="text-[11px] font-black uppercase tracking-wider text-slate-400 mb-2">
                Danh Mục Món Ăn
              </div>
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Tìm món nhanh..."
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs font-bold text-white placeholder-slate-500 focus:outline-none focus:border-orange-500"
                />
              </div>
            </div>

            <div className="p-3 space-y-2 flex-1">
              <button
                onClick={() => setSelectedCategoryId(null)}
                className={`w-full p-3.5 rounded-2xl text-left transition-all flex items-center justify-between cursor-pointer ${
                  selectedCategoryId === null && !onlyVegan
                    ? 'bg-[#E8B84B] text-black font-black shadow-lg shadow-[#E8B84B]/30 translate-x-1'
                    : 'bg-bg-card hover:bg-bg-input text-slate-300 font-bold border border-border-base'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Utensils className="w-5 h-5" />
                  <span className="text-sm">Tất cả món</span>
                </div>
                <span className="text-xs font-mono bg-black/20 px-2 py-0.5 rounded-full">
                  {menuItems.length}
                </span>
              </button>

              {categories.map((cat) => {
                const count = menuItems.filter(i => i.categoryId === cat.id).length;
                const isSelected = selectedCategoryId === cat.id && !onlyVegan;
                return (
                  <button
                    key={cat.id}
                    onClick={() => {
                      setSelectedCategoryId(cat.id);
                      setOnlyVegan(false);
                    }}
                    className={`w-full p-3.5 rounded-2xl text-left transition-all flex items-center justify-between cursor-pointer ${
                      isSelected
                        ? 'bg-[#E8B84B] text-black font-black shadow-lg shadow-[#E8B84B]/30 translate-x-1'
                        : 'bg-bg-card hover:bg-bg-input text-slate-300 font-bold border border-border-base'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-lg">{cat.icon || '🍲'}</span>
                      <span className="text-sm line-clamp-1">{cat.name}</span>
                    </div>
                    <span className="text-xs font-mono bg-black/20 px-2 py-0.5 rounded-full">
                      {count}
                    </span>
                  </button>
                );
              })}

              <button
                onClick={() => {
                  setOnlyVegan(!onlyVegan);
                  if (!onlyVegan) setSelectedCategoryId(null);
                }}
                className={`w-full p-3.5 rounded-2xl text-left transition-all flex items-center justify-between cursor-pointer ${
                  onlyVegan
                    ? 'bg-emerald-600 text-white font-black shadow-lg shadow-emerald-600/30 translate-x-1'
                    : 'bg-slate-800/60 hover:bg-slate-800 text-emerald-400 font-bold'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Leaf className="w-5 h-5" />
                  <span className="text-sm">Món Chay Thanh Tịnh</span>
                </div>
                <span className="text-xs font-mono bg-black/20 px-2 py-0.5 rounded-full">
                  {menuItems.filter(i => i.isVegan).length}
                </span>
              </button>
            </div>
          </aside>

          {/* COLUMN 2: LARGE TOUCH ITEMS GRID */}
          <main className="flex-1 p-6 overflow-y-auto bg-slate-950">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black text-white">
                  {onlyVegan
                    ? 'Món Ăn Chay'
                    : selectedCategoryId !== null
                    ? categories.find(c => c.id === selectedCategoryId)?.name
                    : 'Toàn Bộ Thực Đơn Hôm Nay'}
                </h2>
                <span className="text-xs font-extrabold px-2.5 py-0.5 rounded-full bg-[#E8B84B]/20 text-[#E8B84B] border border-[#E8B84B]/30">
                  {filteredItems.length} món
                </span>
              </div>
            </div>

            {filteredItems.length === 0 ? (
              <div className="text-center py-16 bg-bg-card rounded-3xl border border-border-base p-8">
                <Utensils className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                <p className="text-base font-bold text-slate-300">Không tìm thấy món ăn phù hợp</p>
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategoryId(null);
                    setOnlyVegan(false);
                  }}
                  className="mt-4 px-4 py-2 rounded-xl bg-[#E8B84B] text-black font-extrabold text-xs"
                >
                  Xem lại tất cả
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {filteredItems.map(item => {
                  const inCart = kioskCart.find(ci => ci.item.id === item.id);
                  const inCartQty = inCart ? inCart.quantity : 0;
                  const isOutOfStock = item.stock <= 0;

                  return (
                    <div
                      key={item.id}
                      className="bg-bg-card rounded-3xl border border-border-base overflow-hidden shadow-xl flex flex-col transition-all hover:border-[#E8B84B]/60"
                    >
                      <div className="relative h-44 w-full bg-slate-800 overflow-hidden">
                        <img
                          src={item.imageUrl}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                        {/* Badges */}
                        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                          {item.badge && (
                            <span className="px-2.5 py-1 rounded-lg bg-[#E8B84B] text-black text-[11px] font-black shadow-md">
                              {item.badge}
                            </span>
                          )}
                          {item.isVegan && (
                            <span className="px-2.5 py-1 rounded-lg bg-emerald-600 text-white text-[11px] font-black shadow-md">
                              Chay
                            </span>
                          )}
                        </div>

                        <div className="absolute bottom-3 right-3 px-2.5 py-1 rounded-lg bg-black/70 backdrop-blur text-[#E8B84B] text-xs font-bold font-mono">
                          🔥 {item.calories} kcal
                        </div>
                      </div>

                      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                        <div>
                          <h3 className="font-black text-base text-white line-clamp-1">
                            {item.name}
                          </h3>
                          <p className="text-xs text-text-secondary line-clamp-2 mt-1 font-medium">
                            {item.ingredients}
                          </p>
                        </div>

                        <div className="flex items-center justify-between pt-2 border-t border-border-base">
                          <div>
                            <div className="text-lg font-black text-[#E8B84B] font-mono">
                              {item.price.toLocaleString('vi-VN')}₫
                            </div>
                            <div className="text-[11px] text-text-secondary font-medium">
                              {isOutOfStock ? (
                                <span className="text-rose-400 font-bold">Hết hàng</span>
                              ) : (
                                <span>Còn lại: {item.stock}</span>
                              )}
                            </div>
                          </div>

                          {inCartQty > 0 ? (
                            <div className="flex items-center gap-2 bg-bg-primary p-1 rounded-2xl border border-border-base">
                              <button
                                onClick={() => handleUpdateQuantity(item.id, -1)}
                                className="w-8 h-8 rounded-xl bg-bg-input hover:bg-bg-elevated text-text-primary flex items-center justify-center font-black cursor-pointer active:scale-95"
                              >
                                <Minus className="w-4 h-4" />
                              </button>
                              <span className="w-6 text-center font-black text-[#E8B84B] text-sm font-mono">
                                {inCartQty}
                              </span>
                              <button
                                onClick={() => handleUpdateQuantity(item.id, 1)}
                                className="w-8 h-8 rounded-xl bg-[#E8B84B] hover:bg-[#F4C95D] text-black flex items-center justify-center font-black cursor-pointer active:scale-95"
                              >
                                <Plus className="w-4 h-4" />
                              </button>
                            </div>
                          ) : (
                            <button
                              disabled={isOutOfStock}
                              onClick={() => handleAddToCart(item)}
                              className={`h-11 px-4 rounded-2xl font-black text-xs flex items-center gap-2 transition-all active:scale-95 cursor-pointer ${
                                isOutOfStock
                                  ? 'bg-bg-input text-slate-500 cursor-not-allowed'
                                  : 'bg-[#E8B84B] hover:bg-[#F4C95D] text-black shadow-lg shadow-[#E8B84B]/20'
                              }`}
                            >
                              <Plus className="w-4 h-4" />
                              <span>Thêm Món</span>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </main>

          {/* COLUMN 3: LIVE KIOSK CART / KHAY MÓN TẠI CHỖ */}
          <aside className="w-96 bg-bg-card border-l border-border-base flex flex-col shrink-0">
            <div className="p-4 border-b border-border-base flex items-center justify-between bg-bg-primary">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-[#E8B84B]" />
                <h3 className="font-black text-sm text-white uppercase font-serif">
                  Khay Món Của Bạn
                </h3>
                <span className="w-5 h-5 rounded-full bg-[#E8B84B] text-black font-black text-[11px] flex items-center justify-center font-mono">
                  {totalItemsCount}
                </span>
              </div>
              {kioskCart.length > 0 && (
                <button
                  onClick={handleClearCart}
                  className="text-slate-400 hover:text-rose-400 text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Xóa hết</span>
                </button>
              )}
            </div>

            {/* Cart list */}
            <div className="flex-1 p-4 overflow-y-auto space-y-2.5">
              {kioskCart.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-500 space-y-2">
                  <div className="w-16 h-16 rounded-full bg-slate-800/80 flex items-center justify-center text-slate-600 mb-1">
                    <ShoppingBag className="w-8 h-8" />
                  </div>
                  <p className="text-sm font-bold text-slate-400">Khay món hiện đang trống</p>
                  <p className="text-xs text-slate-500">
                    Vui lòng chạm nút <span className="text-orange-400 font-bold">+ Thêm món</span> trên danh sách để gọi món ăn vào khay
                  </p>
                </div>
              ) : (
                kioskCart.map(ci => (
                  <div
                    key={ci.item.id}
                    className="p-3 bg-slate-800/80 rounded-2xl border border-slate-700/80 flex items-center gap-3"
                  >
                    <img
                      src={ci.item.imageUrl}
                      alt={ci.item.name}
                      className="w-12 h-12 rounded-xl object-cover shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-xs text-white truncate">
                        {ci.item.name}
                      </h4>
                      <div className="text-xs text-orange-400 font-black font-mono mt-0.5">
                        {(ci.item.price * ci.quantity).toLocaleString('vi-VN')}₫
                      </div>
                    </div>
                    <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-700">
                      <button
                        onClick={() => handleUpdateQuantity(ci.item.id, -1)}
                        className="w-6 h-6 rounded-lg bg-slate-800 hover:bg-slate-700 text-white flex items-center justify-center font-bold text-xs cursor-pointer"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="w-5 text-center font-black text-xs text-white font-mono">
                        {ci.quantity}
                      </span>
                      <button
                        onClick={() => handleUpdateQuantity(ci.item.id, 1)}
                        className="w-6 h-6 rounded-lg bg-orange-500 hover:bg-orange-600 text-white flex items-center justify-center font-bold text-xs cursor-pointer"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Cart footer */}
            <div className="p-4 bg-slate-950 border-t border-slate-800 space-y-3">
              <div className="space-y-1.5 text-xs text-slate-400">
                <div className="flex justify-between">
                  <span>Hình thức phục vụ:</span>
                  <span className="font-bold text-white">
                    {dineOption === 'DINE_IN' ? '🍽️ Ăn tại chỗ' : '🥡 Mang về'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Tổng năng lượng:</span>
                  <span className="font-bold text-amber-400 font-mono">
                    🔥 {totalCalories} kcal
                  </span>
                </div>
                <div className="flex justify-between text-base font-black text-white pt-2 border-t border-slate-800">
                  <span>Tổng thanh toán:</span>
                  <span className="text-xl font-mono text-orange-400">
                    {totalAmount.toLocaleString('vi-VN')}₫
                  </span>
                </div>
              </div>

              <button
                disabled={kioskCart.length === 0}
                onClick={handleConfirmKioskOrder}
                className={`w-full py-4 rounded-2xl font-black text-sm flex items-center justify-center gap-2 transition-all shadow-xl active:scale-98 cursor-pointer ${
                  kioskCart.length === 0
                    ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                    : 'bg-emerald-500 hover:bg-emerald-600 text-slate-950 shadow-emerald-500/20'
                }`}
              >
                <CheckCircle2 className="w-5 h-5 text-slate-950" />
                <span>XÁC NHẬN ĐẶT MÓN & LẤY SỐ</span>
              </button>
            </div>
          </aside>

        </div>
      )}

    </div>
  );
};
