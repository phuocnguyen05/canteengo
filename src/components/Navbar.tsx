import React, { useState, useRef, useEffect } from 'react';
import { 
  ArrowLeft,
  UtensilsCrossed, 
  Layers, 
  ShoppingBag, 
  History,
  ClipboardList, 
  Database, 
  User as UserIcon, 
  LogOut,
  ChevronDown,
  LogIn,
  UserPlus,
  ShieldCheck,
  Wallet,
  Palette,
  Bell,
  MessageSquare,
  Tv,
  Award,
  Store,
  Menu,
  X,
  Sparkles
} from 'lucide-react';
import { User, UserRole } from '../types';

const canteenKitchenAvatar = '/canteen_kitchen_avatar.jpg';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: any) => void;
  currentUser: User | null;
  onOpenLogin: () => void;
  onOpenRegister: () => void;
  onOpenProfile: () => void;
  cartCount: number;
  onOpenCart: () => void;
  onOpenComboModal: () => void;
  onOpenWallet?: () => void;
  onOpenThemeCustomizer?: () => void;
  unreadNotificationCount?: number;
  onOpenNotifications?: () => void;
  onOpenStaffChat?: () => void;
  unreadStaffChatCount?: number;
  onOpenCounterDisplay?: () => void;
  onOpenLoyaltyModal?: () => void;
  onOpenKioskMode?: () => void;
  onBack?: () => void;
  pendingConfirmCount?: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  currentUser,
  onOpenLogin,
  onOpenRegister,
  onOpenProfile,
  cartCount,
  onOpenCart,
  onOpenComboModal,
  onOpenWallet,
  onOpenThemeCustomizer,
  unreadNotificationCount = 0,
  onOpenNotifications,
  onOpenStaffChat,
  unreadStaffChatCount = 0,
  onOpenCounterDisplay,
  onOpenLoyaltyModal,
  onOpenKioskMode,
  onBack,
  pendingConfirmCount = 0,
}) => {
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const role: UserRole = currentUser?.role || 'GUEST';
  const isCustomer = role === 'CUSTOMER' || role === 'GUEST' || role === 'TEACHER' || role === 'STUDENT';
  const isStaff = role === 'STAFF';
  const isAdmin = role === 'ADMIN';

  // Close dropdown menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleBackClick = () => {
    if (onBack) {
      onBack();
    } else if (activeTab !== 'menu') {
      setActiveTab('menu');
    } else if (window.scrollY > 100) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      window.history.back();
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-bg-primary/95 backdrop-blur-md border-b border-[#E8B84B]/20 shadow-[0_4px_25px_rgba(0,0,0,0.8)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* ================= 1. TRÁI: LOGO & BACK BUTTON ================= */}
          <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
            {/* Subtle Back Button */}
            <button
              id="navbar-back-btn"
              type="button"
              onClick={handleBackClick}
              className="w-9 h-9 rounded-xl bg-bg-card hover:bg-[#E8B84B] hover:text-black text-text-secondary flex items-center justify-center transition-all duration-200 border border-border-base hover:border-[#E8B84B] active:scale-95 shadow-sm cursor-pointer group"
              title="Quay lại"
              aria-label="Quay lại"
            >
              <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
            </button>

            {/* Logo Brand */}
            <button 
              onClick={() => setActiveTab(isStaff ? 'orders' : isAdmin ? 'admin' : 'menu')}
              className="flex items-center gap-2.5 text-left group focus:outline-none cursor-pointer"
            >
              <div className="relative flex-shrink-0 w-9 h-9 sm:w-10 sm:h-10 rounded-xl overflow-hidden shadow-md border-2 border-[#E8B84B] group-hover:scale-105 transition-transform">
                <img 
                  src={canteenKitchenAvatar} 
                  alt="Ảnh Bếp ăn Canteen" 
                  className="w-full h-full object-cover"
                />
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-bg-primary" title="Bếp đang mở cửa phục vụ" />
              </div>
              
              <div className="flex-shrink-0">
                <div className="flex items-center gap-1.5">
                  <span className="font-serif font-extrabold text-xl sm:text-2xl tracking-tight text-text-primary">
                    Canteen<span className="text-[#E8B84B]">Go</span>
                  </span>
                </div>
                <p className="text-[10px] text-text-secondary hidden md:block font-medium tracking-wide">
                  {isAdmin ? 'Cổng Quản Trị' : isStaff ? 'Cổng Bếp Canteen' : 'Ẩm Thực Dinh Dưỡng'}
                </p>
              </div>
            </button>
          </div>

          {/* ================= 2. GIỮA: MENU CHÍNH (3-4 mục gọn gàng) ================= */}
          <nav className="hidden lg:flex items-center gap-1 sm:gap-2">
            
            {/* Tab 1: Thực đơn */}
            <button
              onClick={() => setActiveTab('menu')}
              className={`relative px-4 py-2 text-xs font-bold transition-all duration-200 flex items-center gap-2 cursor-pointer ${
                activeTab === 'menu'
                  ? 'text-[#E8B84B]'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              <UtensilsCrossed className="w-4 h-4" />
              <span>Thực đơn</span>
              {activeTab === 'menu' && (
                <span className="absolute bottom-0 left-2 right-2 h-0.5 bg-[#E8B84B] rounded-full shadow-[0_0_8px_#E8B84B]" />
              )}
            </button>

            {/* Tab 2: Tạo Combo (Ưu đãi 10%) */}
            {(isCustomer || isAdmin) && (
              <button
                onClick={onOpenComboModal}
                className="relative px-3.5 py-1.5 rounded-xl text-xs font-bold bg-bg-card hover:bg-bg-input text-[#E8B84B] border border-[#E8B84B]/30 hover:border-[#E8B84B] transition-all flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-95"
              >
                <Layers className="w-3.5 h-3.5 text-[#E8B84B]" />
                <span>Tạo Combo</span>
                <span className="text-[9px] font-black bg-[#E8B84B] text-black px-1.5 py-0.2 rounded shadow-2xs">-10%</span>
              </button>
            )}

            {/* Tab 3: Ví C-Pay (Customer) */}
            {isCustomer && (
              <button
                onClick={() => setActiveTab('wallet')}
                className={`relative px-4 py-2 text-xs font-bold transition-all duration-200 flex items-center gap-2 cursor-pointer ${
                  activeTab === 'wallet'
                    ? 'text-[#E8B84B]'
                    : 'text-text-secondary hover:text-text-primary'
                }`}
              >
                <Wallet className="w-4 h-4 text-[#E8B84B]" />
                <span>Ví C-Pay</span>
                {activeTab === 'wallet' && (
                  <span className="absolute bottom-0 left-2 right-2 h-0.5 bg-[#E8B84B] rounded-full shadow-[0_0_8px_#E8B84B]" />
                )}
              </button>
            )}

            {/* Tab 4: Đơn của tôi / Lịch sử (Customer) */}
            {isCustomer && (
              <button
                onClick={() => setActiveTab('my_orders')}
                className={`relative px-4 py-2 text-xs font-bold transition-all duration-200 flex items-center gap-2 cursor-pointer ${
                  activeTab === 'my_orders' || activeTab === 'order_history'
                    ? 'text-[#E8B84B]'
                    : 'text-text-secondary hover:text-text-primary'
                }`}
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Đơn của tôi</span>
                {(activeTab === 'my_orders' || activeTab === 'order_history') && (
                  <span className="absolute bottom-0 left-2 right-2 h-0.5 bg-[#E8B84B] rounded-full shadow-[0_0_8px_#E8B84B]" />
                )}
              </button>
            )}

            {/* Tab (Staff/Admin): Bếp Canteen */}
            {(isStaff || isAdmin) && (
              <button
                onClick={() => setActiveTab('orders')}
                className={`relative px-4 py-2 text-xs font-bold transition-all duration-200 flex items-center gap-2 cursor-pointer ${
                  activeTab === 'orders'
                    ? 'text-[#E8B84B]'
                    : 'text-text-secondary hover:text-text-primary'
                }`}
              >
                <ClipboardList className="w-4 h-4 text-blue-400" />
                <span>Bếp & Quản lý đơn</span>
                {activeTab === 'orders' && (
                  <span className="absolute bottom-0 left-2 right-2 h-0.5 bg-[#E8B84B] rounded-full shadow-[0_0_8px_#E8B84B]" />
                )}
              </button>
            )}

            {/* Tab (Staff/Admin): Xác nhận thanh toán */}
            {(isStaff || isAdmin) && (
              <button
                onClick={() => setActiveTab('payment_confirm')}
                className={`relative px-4 py-2 text-xs font-bold transition-all duration-200 flex items-center gap-2 cursor-pointer ${
                  activeTab === 'payment_confirm'
                    ? 'text-[#E8B84B]'
                    : 'text-text-secondary hover:text-text-primary'
                }`}
              >
                <Wallet className="w-4 h-4 text-[#E8B84B]" />
                <span>Xác nhận TT</span>
                {(pendingConfirmCount ?? 0) > 0 && (
                  <span className="bg-orange-500 text-black text-[10px] font-extrabold px-1.5 py-0.2 rounded-full animate-pulse">
                    {pendingConfirmCount}
                  </span>
                )}
                {activeTab === 'payment_confirm' && (
                  <span className="absolute bottom-0 left-2 right-2 h-0.5 bg-[#E8B84B] rounded-full shadow-[0_0_8px_#E8B84B]" />
                )}
              </button>
            )}

            {/* Tab 4 (Admin): Cổng Admin */}
            {isAdmin && (
              <button
                onClick={() => setActiveTab('admin')}
                className={`relative px-4 py-2 text-xs font-bold transition-all duration-200 flex items-center gap-2 cursor-pointer ${
                  activeTab === 'admin'
                    ? 'text-[#E8B84B]'
                    : 'text-text-secondary hover:text-text-primary'
                }`}
              >
                <ShieldCheck className="w-4 h-4 text-purple-400" />
                <span>Cổng Admin</span>
                {activeTab === 'admin' && (
                  <span className="absolute bottom-0 left-2 right-2 h-0.5 bg-[#E8B84B] rounded-full shadow-[0_0_8px_#E8B84B]" />
                )}
              </button>
            )}
          </nav>

          {/* ================= 3. PHẢI: NOTIFICATION + AVATAR DROPDOWN + GIỎ HÀNG ================= */}
          <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
            
            {/* Icon Thông báo với Badge đỏ/gold */}
            {onOpenNotifications && (
              <button
                onClick={onOpenNotifications}
                className="relative w-10 h-10 rounded-xl bg-bg-card hover:bg-bg-input text-text-secondary hover:text-[#E8B84B] border border-border-base hover:border-[#E8B84B]/40 flex items-center justify-center transition-all cursor-pointer active:scale-95 group"
                title="Thông báo"
                aria-label="Xem thông báo"
              >
                <Bell className="w-4 h-4 group-hover:rotate-12 transition-transform text-[#E8B84B]" />
                {unreadNotificationCount > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-4.5 h-4.5 px-1 rounded-full bg-rose-500 text-white font-extrabold text-[10px] flex items-center justify-center animate-pulse border-2 border-bg-primary shadow-md">
                    {unreadNotificationCount > 9 ? '9+' : unreadNotificationCount}
                  </span>
                )}
              </button>
            )}

            {/* Avatar Tròn với Viền Vàng Gold + Dropdown Menu */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center gap-2 p-1 rounded-full hover:bg-bg-hover transition-all cursor-pointer group focus:outline-none"
                title={currentUser ? currentUser.fullName : 'Tài khoản người dùng'}
              >
                {currentUser ? (
                  <div className="relative w-9 h-9 sm:w-10 sm:h-10 rounded-full border-2 border-[#E8B84B]/60 group-hover:border-[#E8B84B] transition-all overflow-hidden shadow-[0_0_12px_rgba(232,184,75,0.2)]">
                    {currentUser.photoURL ? (
                      <img
                        src={currentUser.photoURL}
                        alt={currentUser.fullName}
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="w-full h-full bg-bg-input text-[#E8B84B] flex items-center justify-center font-extrabold text-xs">
                        {currentUser.fullName.slice(0, 2).toUpperCase()}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-bg-card border-2 border-[#E8B84B]/40 group-hover:border-[#E8B84B] text-[#E8B84B] flex items-center justify-center transition-all shadow-sm">
                    <UserIcon className="w-4 h-4" />
                  </div>
                )}

                <ChevronDown className={`w-3.5 h-3.5 text-text-secondary group-hover:text-text-primary transition-transform duration-200 hidden sm:block ${isUserMenuOpen ? 'rotate-180 text-[#E8B84B]' : ''}`} />
              </button>

              {/* DROPDOWN MENU CHÍNH (Gộp tất cả tính năng phụ vào đây) */}
              {isUserMenuOpen && (
                <div className="absolute right-0 mt-2 w-72 bg-bg-card border border-[#E8B84B]/30 rounded-2xl shadow-[0_10px_35px_rgba(0,0,0,0.9)] p-2.5 z-50 animate-in fade-in slide-in-from-top-2 duration-200 text-xs">
                  
                  {/* User Profile Header inside Dropdown */}
                  {currentUser ? (
                    <div className="p-3 bg-bg-input rounded-xl border border-border-base mb-2 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full border border-[#E8B84B] overflow-hidden flex-shrink-0">
                        {currentUser.photoURL ? (
                          <img src={currentUser.photoURL} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full bg-bg-elevated text-[#E8B84B] font-bold text-xs flex items-center justify-center">
                            {currentUser.fullName.slice(0, 2).toUpperCase()}
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-serif font-bold text-sm text-text-primary truncate">{currentUser.fullName}</p>
                        <p className="text-[11px] text-text-secondary truncate">{currentUser.phone || currentUser.email || 'Thành viên CanteenGo'}</p>
                        <span className="inline-block mt-1 text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-[#E8B84B]/20 text-[#E8B84B] border border-[#E8B84B]/40">
                          {isAdmin ? 'Quản Trị Viên' : isStaff ? 'Nhân Viên Bếp' : currentUser.role === 'TEACHER' ? 'Giáo Viên' : currentUser.role === 'STUDENT' ? 'Sinh Viên' : 'Khách Vãng Lai'}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="p-3 bg-bg-input rounded-xl border border-border-base mb-2 text-center">
                      <p className="font-serif font-bold text-sm text-text-primary">Chào mừng đến CanteenGo</p>
                      <p className="text-[11px] text-text-secondary mt-0.5">Đăng nhập để đặt cơm & tích điểm VIP</p>
                    </div>
                  )}

                  {/* Wallet Balance Shortcut */}
                  {currentUser && isCustomer && onOpenWallet && (
                    <button
                      onClick={() => {
                        setIsUserMenuOpen(false);
                        onOpenWallet();
                      }}
                      className="w-full p-2.5 mb-1.5 rounded-xl bg-emerald-950/40 border border-emerald-500/30 hover:border-emerald-500/60 flex items-center justify-between text-emerald-300 font-bold cursor-pointer transition-all"
                    >
                      <div className="flex items-center gap-2">
                        <Wallet className="w-4 h-4 text-emerald-400" />
                        <span>Ví C-Pay</span>
                      </div>
                      <span className="text-emerald-400 font-extrabold">{(currentUser.walletBalance || 0).toLocaleString('vi-VN')}₫</span>
                    </button>
                  )}

                  {/* Menu Items List */}
                  <div className="space-y-0.5 text-text-secondary">
                    
                    {/* Hồ sơ cá nhân */}
                    {currentUser && (
                      <button
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          onOpenProfile();
                        }}
                        className="w-full px-3 py-2 rounded-xl hover:bg-bg-hover hover:text-text-primary flex items-center gap-2.5 transition-colors cursor-pointer"
                      >
                        <UserIcon className="w-4 h-4 text-[#E8B84B]" />
                        <span className="font-semibold">Hồ sơ cá nhân</span>
                      </button>
                    )}

                    {/* Điểm thưởng & VIP Member */}
                    {currentUser && onOpenLoyaltyModal && (
                      <button
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          onOpenLoyaltyModal();
                        }}
                        className="w-full px-3 py-2 rounded-xl hover:bg-bg-hover hover:text-text-primary flex items-center justify-between transition-colors cursor-pointer"
                      >
                        <div className="flex items-center gap-2.5">
                          <Award className="w-4 h-4 text-[#E8B84B]" />
                          <span className="font-semibold">Kho Điểm VIP C-Club</span>
                        </div>
                        <span className="text-[10px] font-black bg-[#E8B84B] text-black px-1.5 py-0.5 rounded">
                          {currentUser.rewardPoints || 0} p
                        </span>
                      </button>
                    )}

                    {/* Đổi Giao Diện */}
                    {onOpenThemeCustomizer && (
                      <button
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          onOpenThemeCustomizer();
                        }}
                        className="w-full px-3 py-2 rounded-xl hover:bg-bg-hover hover:text-text-primary flex items-center gap-2.5 transition-colors cursor-pointer"
                      >
                        <Palette className="w-4 h-4 text-[#E8B84B]" />
                        <span className="font-semibold">Tùy chỉnh Giao diện & Nền</span>
                      </button>
                    )}

                    {/* CSKH Chat Inbox (Staff/Admin) */}
                    {(isStaff || isAdmin) && onOpenStaffChat && (
                      <button
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          onOpenStaffChat();
                        }}
                        className="w-full px-3 py-2 rounded-xl hover:bg-bg-hover hover:text-text-primary flex items-center justify-between transition-colors cursor-pointer"
                      >
                        <div className="flex items-center gap-2.5">
                          <MessageSquare className="w-4 h-4 text-orange-400" />
                          <span className="font-semibold">Hộp thư CSKH</span>
                        </div>
                        {unreadStaffChatCount > 0 && (
                          <span className="min-w-4 h-4 px-1 rounded-full bg-rose-500 text-white font-black text-[10px] flex items-center justify-center">
                            {unreadStaffChatCount}
                          </span>
                        )}
                      </button>
                    )}

                    {/* TV Display & Kiosk */}
                    {onOpenCounterDisplay && (
                      <button
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          onOpenCounterDisplay();
                        }}
                        className="w-full px-3 py-2 rounded-xl hover:bg-bg-hover hover:text-text-primary flex items-center gap-2.5 transition-colors cursor-pointer"
                      >
                        <Tv className="w-4 h-4 text-amber-400" />
                        <span className="font-semibold">Màn hình Tivi gọi món quầy</span>
                      </button>
                    )}

                    {onOpenKioskMode && (
                      <button
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          onOpenKioskMode();
                        }}
                        className="w-full px-3 py-2 rounded-xl hover:bg-bg-hover hover:text-text-primary flex items-center gap-2.5 transition-colors cursor-pointer"
                      >
                        <Store className="w-4 h-4 text-amber-400" />
                        <span className="font-semibold">Kiosk Tự Phục Vụ (Cảm ứng)</span>
                      </button>
                    )}

                    {/* CSDL 8 Bảng (Admin only) */}
                    {isAdmin && (
                      <button
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          setActiveTab('database');
                        }}
                        className="w-full px-3 py-2 rounded-xl hover:bg-bg-hover hover:text-text-primary flex items-center gap-2.5 transition-colors cursor-pointer"
                      >
                        <Database className="w-4 h-4 text-amber-400" />
                        <span className="font-semibold">CSDL 8 Bảng Hệ Thống</span>
                      </button>
                    )}

                  </div>

                  {/* Auth Actions Footer */}
                  <div className="mt-2 pt-2 border-t border-border-base">
                    {currentUser ? (
                      <button
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          onOpenProfile();
                        }}
                        className="w-full px-3 py-2 rounded-xl bg-bg-input hover:bg-rose-950/50 hover:text-rose-300 text-rose-400 font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Đăng xuất tài khoản</span>
                      </button>
                    ) : (
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={() => {
                            setIsUserMenuOpen(false);
                            onOpenLogin();
                          }}
                          className="px-3 py-2 rounded-xl bg-bg-input hover:bg-bg-hover text-text-primary font-bold text-center cursor-pointer transition-colors"
                        >
                          Đăng nhập
                        </button>
                        <button
                          onClick={() => {
                            setIsUserMenuOpen(false);
                            onOpenRegister();
                          }}
                          className="px-3 py-2 rounded-xl bg-[#E8B84B] hover:bg-[#F4C95D] text-black font-extrabold text-center cursor-pointer transition-colors"
                        >
                          Đăng ký
                        </button>
                      </div>
                    )}
                  </div>

                </div>
              )}
            </div>

            {/* Giỏ Hàng: Nút Vàng Gold nổi bật + Badge số món */}
            {(isCustomer || isAdmin) && (
              <button
                id="navbar-cart-btn"
                onClick={onOpenCart}
                className="h-10 px-3.5 sm:px-4 rounded-xl bg-[#E8B84B] hover:bg-[#F4C95D] text-black font-extrabold text-xs shadow-[0_0_20px_rgba(232,184,75,0.3)] transition-all hover:scale-103 active:scale-95 flex items-center gap-2 cursor-pointer flex-shrink-0"
                title="Xem giỏ hàng"
              >
                <ShoppingBag className="w-4 h-4 text-black" />
                <span className="hidden sm:inline">Giỏ hàng</span>
                {cartCount > 0 ? (
                  <span className="min-w-5 h-5 px-1.5 rounded-full bg-black text-[#E8B84B] font-black text-[11px] flex items-center justify-center border border-[#E8B84B]/40">
                    {cartCount}
                  </span>
                ) : (
                  <span className="sm:hidden text-[11px] font-black">0</span>
                )}
              </button>
            )}

            {/* Mobile Hamburger Menu Toggle Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden w-10 h-10 rounded-xl bg-bg-card text-[#E8B84B] border border-border-base flex items-center justify-center transition-colors cursor-pointer"
              aria-label="Mở Menu"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

          </div>
        </div>

        {/* ================= MOBILE DRAWER MENU ================= */}
        {isMobileMenuOpen && (
          <div className="lg:hidden border-t border-border-base bg-bg-primary py-3 px-2 space-y-1 animate-in slide-in-from-top-2 duration-200">
            <button
              onClick={() => {
                setActiveTab('menu');
                setIsMobileMenuOpen(false);
              }}
              className={`w-full px-4 py-2.5 rounded-xl text-left text-xs font-bold flex items-center gap-2.5 ${
                activeTab === 'menu' ? 'bg-[#E8B84B] text-black' : 'text-text-secondary hover:bg-bg-hover hover:text-text-primary'
              }`}
            >
              <UtensilsCrossed className="w-4 h-4" />
              <span>Thực đơn cỗ ngon</span>
            </button>

            {(isCustomer || isAdmin) && (
              <button
                onClick={() => {
                  onOpenComboModal();
                  setIsMobileMenuOpen(false);
                }}
                className="w-full px-4 py-2.5 rounded-xl text-left text-xs font-bold text-[#E8B84B] bg-bg-card border border-[#E8B84B]/30 flex items-center justify-between"
              >
                <div className="flex items-center gap-2.5">
                  <Layers className="w-4 h-4" />
                  <span>Tự chọn Combo dinh dưỡng</span>
                </div>
                <span className="text-[10px] bg-[#E8B84B] text-black px-1.5 py-0.5 rounded font-black">-10%</span>
              </button>
            )}

            {isCustomer && (
              <button
                onClick={() => {
                  setActiveTab('wallet');
                  setIsMobileMenuOpen(false);
                }}
                className={`w-full px-4 py-2.5 rounded-xl text-left text-xs font-bold flex items-center gap-2.5 ${
                  activeTab === 'wallet' ? 'bg-[#E8B84B] text-black' : 'text-text-secondary hover:bg-bg-hover hover:text-text-primary'
                }`}
              >
                <Wallet className="w-4 h-4 text-[#E8B84B]" />
                <span>Ví C-Pay</span>
              </button>
            )}

            {isCustomer && (
              <button
                onClick={() => {
                  setActiveTab('my_orders');
                  setIsMobileMenuOpen(false);
                }}
                className={`w-full px-4 py-2.5 rounded-xl text-left text-xs font-bold flex items-center gap-2.5 ${
                  activeTab === 'my_orders' ? 'bg-[#E8B84B] text-black' : 'text-text-secondary hover:bg-bg-hover hover:text-text-primary'
                }`}
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Đơn hàng của tôi</span>
              </button>
            )}

            {(isStaff || isAdmin) && (
              <button
                onClick={() => {
                  setActiveTab('orders');
                  setIsMobileMenuOpen(false);
                }}
                className={`w-full px-4 py-2.5 rounded-xl text-left text-xs font-bold flex items-center gap-2.5 ${
                  activeTab === 'orders' ? 'bg-blue-600 text-white' : 'text-text-secondary hover:bg-bg-hover hover:text-text-primary'
                }`}
              >
                <ClipboardList className="w-4 h-4 text-blue-400" />
                <span>Bếp & Quản lý đơn</span>
              </button>
            )}

            {(isStaff || isAdmin) && (
              <button
                onClick={() => {
                  setActiveTab('payment_confirm');
                  setIsMobileMenuOpen(false);
                }}
                className={`w-full px-4 py-2.5 rounded-xl text-left text-xs font-bold flex items-center justify-between ${
                  activeTab === 'payment_confirm' ? 'bg-amber-600 text-white' : 'text-text-secondary hover:bg-bg-hover hover:text-text-primary'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Wallet className="w-4 h-4 text-[#E8B84B]" />
                  <span>Xác nhận thanh toán</span>
                </div>
                {(pendingConfirmCount ?? 0) > 0 && (
                  <span className="bg-orange-500 text-black text-[10px] font-extrabold px-2 py-0.5 rounded-full">
                    {pendingConfirmCount}
                  </span>
                )}
              </button>
            )}

            {isAdmin && (
              <button
                onClick={() => {
                  setActiveTab('admin');
                  setIsMobileMenuOpen(false);
                }}
                className={`w-full px-4 py-2.5 rounded-xl text-left text-xs font-bold flex items-center gap-2.5 ${
                  activeTab === 'admin' ? 'bg-purple-600 text-white' : 'text-text-secondary hover:bg-bg-hover hover:text-text-primary'
                }`}
              >
                <ShieldCheck className="w-4 h-4 text-purple-400" />
                <span>Cổng Quản trị viên</span>
              </button>
            )}

            {isAdmin && (
              <button
                onClick={() => {
                  setActiveTab('database');
                  setIsMobileMenuOpen(false);
                }}
                className={`w-full px-4 py-2.5 rounded-xl text-left text-xs font-bold flex items-center gap-2.5 ${
                  activeTab === 'database' ? 'bg-bg-card text-[#E8B84B] border border-[#E8B84B]' : 'text-text-secondary hover:bg-bg-hover hover:text-text-primary'
                }`}
              >
                <Database className="w-4 h-4 text-amber-400" />
                <span>CSDL 8 Bảng</span>
              </button>
            )}
          </div>
        )}

      </div>
    </header>
  );
};
