import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Navbar 
} from './components/Navbar';
import { 
  MenuSection 
} from './components/MenuSection';
import { 
  ComboBuilderModal 
} from './components/ComboBuilderModal';
import { 
  CartDrawer 
} from './components/CartDrawer';
import { 
  StaffOrdersView 
} from './components/StaffOrdersView';
import { 
  AdminDashboardView 
} from './components/AdminDashboardView';
import { 
  CustomerOrdersView 
} from './components/CustomerOrdersView';
import { 
  CustomerOrderHistoryView 
} from './components/CustomerOrderHistoryView';
import { 
  DatabaseSchemaView 
} from './components/DatabaseSchemaView';
import { 
  ItemDetailModal 
} from './components/ItemDetailModal';
import { 
  RoleGuard 
} from './components/RoleGuard';
import { 
  AuthModal 
} from './components/AuthModal';
import { 
  WalletModal 
} from './components/WalletModal';
import { 
  PromoBanner 
} from './components/PromoBanner';
import { 
  FooterSection 
} from './components/FooterSection';
import { formatTime24h, normalizeTimeString24h } from './utils/orderTimeHelper';
import { 
  ReviewModal 
} from './components/ReviewModal';
import { 
  ThemeCustomizerModal,
  PRESET_WALLPAPERS
} from './components/ThemeCustomizerModal';
import { 
  NotificationModal 
} from './components/NotificationModal';
import { 
  CustomerChatWidget 
} from './components/CustomerChatWidget';
import { 
  FloatingBottomCartBar 
} from './components/FloatingBottomCartBar';
import { 
  StaffChatModal 
} from './components/StaffChatModal';
import { 
  CounterDisplayModal 
} from './components/CounterDisplayModal';
import { 
  LoyaltyPointsModal 
} from './components/LoyaltyPointsModal';
import {
  CanteenStatusModal
} from './components/CanteenStatusModal';
import { 
  KioskModeModal 
} from './components/KioskModeModal';
import { PaymentConfirmPage } from './components/PaymentConfirmPage';
import { WalletPage } from './components/WalletPage';
import { SoundFX } from './utils/sound';
import { initTheme, applyTheme } from './utils/theme';
import { db } from './firebase';
import { doc, setDoc } from 'firebase/firestore';
import { createNotification, createNotificationForRole, subscribeUserNotifications } from './services/notificationService';

import { 
  INITIAL_CATEGORIES, 
  INITIAL_MENU_ITEMS, 
  INITIAL_ORDERS, 
  INITIAL_USERS, 
  INITIAL_VOUCHERS,
  INITIAL_REVIEWS,
  INITIAL_NOTIFICATIONS,
  INITIAL_CHAT_MESSAGES,
  DEFAULT_CANTEEN_STATUS
} from './data/initialData';
import { 
  CartItem, 
  MenuItem, 
  Order, 
  OrderStatus, 
  User, 
  UserRole,
  VipTier,
  WalletTransaction,
  WalletHistoryItem,
  TransactionItem,
  ItemReview,
  ThemeConfig,
  AppNotification,
  ChatMessage,
  Voucher,
  CanteenStatusConfig
} from './types';
import { checkExpiredQR, cancelAndRefundOrder } from './services/qrPaymentService';

const DEFAULT_THEME_CONFIG: ThemeConfig = {
  color: 'orange',
  mode: 'dark',
  bgType: 'none',
  bgPresetUrl: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1000&q=70',
  bgOpacity: 35,
  bgBlur: 3,
};
import { 
  Rocket, 
  CheckCircle, 
  Bell, 
  Flame, 
  Layers, 
  ExternalLink,
  ShieldCheck,
  ShieldAlert,
  LogIn,
  Database
} from 'lucide-react';

export default function App() {
  // Navigation
  type MainTab = 'menu' | 'my_orders' | 'order_history' | 'orders' | 'admin' | 'database' | 'wallet' | 'payment_confirm';
  const [activeTab, setActiveTab] = useState<MainTab>('menu');
  const [tabHistory, setTabHistory] = useState<MainTab[]>([]);
  const prevTabRef = useRef<MainTab>('menu');
  const isBackNavigatingRef = useRef(false);

  // Automatically record visited tabs into tabHistory stack so Back returns to the exact previous section
  useEffect(() => {
    if (isBackNavigatingRef.current) {
      isBackNavigatingRef.current = false;
      prevTabRef.current = activeTab;
      return;
    }
    if (prevTabRef.current !== activeTab) {
      const fromTab = prevTabRef.current;
      setTabHistory(prev => {
        if (prev.length > 0 && prev[prev.length - 1] === fromTab) {
          return prev;
        }
        return [...prev, fromTab];
      });
      prevTabRef.current = activeTab;
    }
  }, [activeTab]);

  // Persistence for Registered Users List (Auto-sync with INITIAL_USERS to guarantee Teacher & Student exist)
  const [usersList, setUsersList] = useState<User[]>(() => {
    try {
      const saved = localStorage.getItem('canteengo_users_list');
      if (saved) {
        const parsed: User[] = JSON.parse(saved);
        const existingEmails = new Set(parsed.map((u) => u.email.toLowerCase()));
        const missing = Object.values(INITIAL_USERS).filter(
          (u) => !existingEmails.has(u.email.toLowerCase())
        );
        const initialMap = new Map(Object.values(INITIAL_USERS).map((u) => [u.email.toLowerCase(), u]));
        const synced = parsed.map((u) => {
          const init = initialMap.get(u.email.toLowerCase());
          if (init) {
            return {
              ...init,
              ...u,
              role: init.role,
              schoolRole: init.schoolRole,
              studentId: u.studentId || init.studentId,
              faculty: u.faculty || init.faculty,
            };
          }
          return u;
        });
        const merged = [...synced, ...missing];
        localStorage.setItem('canteengo_users_list', JSON.stringify(merged));
        return merged;
      }
    } catch (e) {
      console.error(e);
    }
    return Object.values(INITIAL_USERS);
  });

  // Persistence for Current User Session (Default is null: guest/chưa đăng nhập)
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem('canteengo_session_user');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return null; // Mặc định là khách vãng lai, chưa đăng nhập
  });

  // Core App State
  const [categories, setCategories] = useState(INITIAL_CATEGORIES);
  const [menuItems, setMenuItems] = useState<MenuItem[]>(() => {
    try {
      const saved = localStorage.getItem('canteengo_menu_items');
      const initialMap = new Map(INITIAL_MENU_ITEMS.map((item) => [item.id, item.imageUrl]));
      if (saved) {
        const parsed: MenuItem[] = JSON.parse(saved);
        const synced = parsed.map((item) => {
          if (initialMap.has(item.id)) {
            return { ...item, imageUrl: initialMap.get(item.id)! };
          }
          return item;
        });
        const existingIds = new Set(synced.map((item) => item.id));
        const missing = INITIAL_MENU_ITEMS.filter((item) => !existingIds.has(item.id));
        return [...synced, ...missing];
      }
    } catch (e) {}
    return INITIAL_MENU_ITEMS;
  });
  const [orders, setOrders] = useState<Order[]>(() => {
    try {
      const saved = localStorage.getItem('canteengo_orders');
      if (saved) {
        const parsed: Order[] = JSON.parse(saved);
        // Map old March 2026 dates to current relative dates
        return parsed.map((o) => {
          if (o.orderDate && o.orderDate.startsWith('2026-03-')) {
            const dayNum = parseInt(o.orderDate.slice(8, 10), 10);
            const offset = Math.max(0, 30 - dayNum);
            const d = new Date();
            d.setDate(d.getDate() - offset);
            return { ...o, orderDate: d.toISOString().slice(0, 10) };
          }
          return o;
        });
      }
    } catch (e) {}
    return INITIAL_ORDERS;
  });
  const [vouchers, setVouchers] = useState<Voucher[]>(() => {
    try {
      const saved = localStorage.getItem('canteengo_vouchers');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {}
    return INITIAL_VOUCHERS;
  });
  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    try {
      const savedSession = localStorage.getItem('canteengo_session_user');
      const sessionUser: User | null = savedSession ? JSON.parse(savedSession) : null;
      const key = sessionUser ? `canteengo_cart_user_${sessionUser.id}` : 'canteengo_cart_guest';
      const savedCart = localStorage.getItem(key);
      if (savedCart) return JSON.parse(savedCart);
    } catch (e) {
      console.error(e);
    }
    return [];
  });
  const [favoriteItemIds, setFavoriteItemIds] = useState<number[]>(() => {
    try {
      const saved = localStorage.getItem('canteengo_favorite_items');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return [1, 5]; // Default favorite demo items (Cơm sườn nướng, Bún chả Hàng Mành)
  });
  const [reviews, setReviews] = useState<ItemReview[]>(() => {
    try {
      const saved = localStorage.getItem('canteengo_reviews');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return INITIAL_REVIEWS;
  });

  const [notifications, setNotifications] = useState<AppNotification[]>(() => {
    try {
      const saved = localStorage.getItem('canteengo_notifications');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return INITIAL_NOTIFICATIONS;
  });
  const [isNotificationModalOpen, setIsNotificationModalOpen] = useState(false);
  const [userUnreadCount, setUserUnreadCount] = useState(0);

  useEffect(() => {
    if (!currentUser?.id) {
      console.log("[Notif App] No currentUser");
      setUserUnreadCount(0);
      return;
    }
    console.log("[Notif App] Subscribing for userId:", currentUser.id);
    const unsub = subscribeUserNotifications(
      currentUser.id,
      (notifs) => {
        console.log("[Notif App] Received:", notifs.length);
        setUserUnreadCount(notifs.filter(n => !n.isRead).length);
      }
    );
    return () => unsub();
  }, [currentUser?.id]);

  // Transactions state for QR payment, wallet deposit and refunds
  const [transactions, setTransactions] = useState<TransactionItem[]>(() => {
    try {
      const saved = localStorage.getItem('canteengo_transactions');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return [];
  });

  // Initialize theme mode (Dark / Light)
  useEffect(() => {
    initTheme();
  }, []);

  // Automated background check for expired QR orders and transactions
  useEffect(() => {
    const checkTimer = setInterval(() => {
      if (orders.length === 0 && transactions.length === 0) return;
      const { expiredOrderCodes, expiredTxIds, updatedOrders, updatedTransactions } = checkExpiredQR(orders, transactions);
      if (expiredOrderCodes.length > 0) {
        setOrders(updatedOrders);
        try {
          localStorage.setItem('canteengo_orders', JSON.stringify(updatedOrders));
        } catch (e) {}
      }
      if (expiredTxIds.length > 0) {
        setTransactions(updatedTransactions);
        try {
          localStorage.setItem('canteengo_transactions', JSON.stringify(updatedTransactions));
        } catch (e) {}
      }
    }, 10000);
    return () => clearInterval(checkTimer);
  }, [orders, transactions]);

  // Chat system state
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(() => {
    try {
      const saved = localStorage.getItem('canteengo_chat_messages');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return INITIAL_CHAT_MESSAGES;
  });
  const [isStaffChatModalOpen, setIsStaffChatModalOpen] = useState(false);

  // KDS & Loyalty states
  const [isCounterDisplayOpen, setIsCounterDisplayOpen] = useState(false);
  const [isLoyaltyModalOpen, setIsLoyaltyModalOpen] = useState(false);

  // Scroll to top state & listener
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 250);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleScrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Navigation back handler for top bar back button: returns to the exact previous section
  const handleNavBack = () => {
    // 1. Close any open modal/dialog first, keeping user on current view
    if (selectedDetailItem) { setSelectedDetailItem(null); return; }
    if (isReviewModalOpen) { setIsReviewModalOpen(false); setSelectedReviewItem(null); return; }
    if (isCartOpen) { setIsCartOpen(false); return; }
    if (isComboModalOpen) { setIsComboModalOpen(false); return; }
    if (isWalletOpen) { setIsWalletOpen(false); return; }
    if (isAuthModalOpen) { setIsAuthModalOpen(false); return; }
    if (isNotificationModalOpen) { setIsNotificationModalOpen(false); return; }
    if (isLoyaltyModalOpen) { setIsLoyaltyModalOpen(false); return; }
    if (isStaffChatModalOpen) { setIsStaffChatModalOpen(false); return; }
    if (isCounterDisplayOpen) { setIsCounterDisplayOpen(false); return; }
    if (isThemeModalOpen) { setIsThemeModalOpen(false); return; }
    if (isCanteenStatusModalOpen) { setIsCanteenStatusModalOpen(false); return; }

    // 2. Return to the exact previous tab from the history stack
    if (tabHistory.length > 0) {
      const nextHistory = [...tabHistory];
      const prevTab = nextHistory.pop()!;
      setTabHistory(nextHistory);
      isBackNavigatingRef.current = true;
      setActiveTab(prevTab);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    // 3. If history stack is empty but activeTab is not 'menu', return to 'menu'
    if (activeTab !== 'menu') {
      isBackNavigatingRef.current = true;
      setActiveTab('menu');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    // 4. If already on 'menu' and scrolled down, scroll back to top
    if (window.scrollY > 150) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    // 5. If at the top of 'menu', navigate back in browser history
    if (window.history.length > 1) {
      window.history.back();
    }
  };

  // Canteen Operating Status & Hours (Footer Section - Admin Configurable)
  const [canteenStatusConfig, setCanteenStatusConfig] = useState<CanteenStatusConfig>(() => {
    try {
      const saved = localStorage.getItem('canteengo_canteen_status');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed.isOpen === 'boolean') return parsed;
      }
    } catch (e) {}
    return DEFAULT_CANTEEN_STATUS;
  });
  const [isCanteenStatusModalOpen, setIsCanteenStatusModalOpen] = useState(false);

  const handleToggleCanteenOpen = () => {
    setCanteenStatusConfig(prev => {
      const updated: CanteenStatusConfig = {
        ...prev,
        isOpen: !prev.isOpen,
        statusText: !prev.isOpen ? 'Đang mở cửa phục vụ' : 'Tạm đóng cửa / Nghỉ phục vụ'
      };
      try {
        localStorage.setItem('canteengo_canteen_status', JSON.stringify(updated));
      } catch (e) {}
      showToast(
        updated.isOpen
          ? '🟢 Quản trị viên đã bật: CĂNG TIN ĐANG MỞ CỬA'
          : '🔴 Quản trị viên đã tắt: CĂNG TIN TẠM ĐÓNG CỬA'
      );
      return updated;
    });
  };

  const handleSaveCanteenStatusConfig = (newConfig: CanteenStatusConfig) => {
    setCanteenStatusConfig(newConfig);
    try {
      localStorage.setItem('canteengo_canteen_status', JSON.stringify(newConfig));
    } catch (e) {}
    showToast(
      newConfig.isOpen
        ? 'Đã lưu cài đặt: Căng tin ĐANG MỞ CỬA phục vụ'
        : 'Đã lưu cài đặt: Căng tin TẠM ĐÓNG CỬA / Nghỉ phục vụ'
    );
  };

  const handleRedeemToWallet = (pointsNeeded: number, bonusVndAmount: number) => {
    if (!currentUser) return;
    const currentPoints = currentUser.rewardPoints || 0;
    if (currentPoints < pointsNeeded) {
      showToast(`⚠️ Bạn không đủ C-Points (Cần ${pointsNeeded}p)!`);
      return;
    }
    const newPoints = currentPoints - pointsNeeded;
    const currentBalance = currentUser.walletBalance || 0;
    const newBalance = currentBalance + bonusVndAmount;

    const newTx: WalletTransaction = {
      id: `TX-CPOINT-${Math.floor(1000 + Math.random() * 9000)}`,
      type: 'DEPOSIT',
      amount: bonusVndAmount,
      description: `Đổi ${pointsNeeded} C-Points lấy +${bonusVndAmount.toLocaleString('vi-VN')}₫ Ví C-Pay`,
      createdAt: new Date().toLocaleString('vi-VN'),
      status: 'SUCCESS'
    };

    const updatedUser: User = {
      ...currentUser,
      rewardPoints: newPoints,
      walletBalance: newBalance,
      walletTransactions: [newTx, ...(currentUser.walletTransactions || [])]
    };
    handleUpdateProfile(updatedUser);

    showToast(`🎉 Đã quy đổi ${pointsNeeded} C-Points thành +${bonusVndAmount.toLocaleString('vi-VN')}₫ vào Ví C-Pay!`);
  };

  const handleRedeemVoucher = (pointsNeeded: number, voucherCode: string, discountPct: number) => {
    if (!currentUser) return;
    const currentPoints = currentUser.rewardPoints || 0;
    if (currentPoints < pointsNeeded) {
      showToast(`⚠️ Bạn không đủ C-Points (Cần ${pointsNeeded}p)!`);
      return;
    }
    const newPoints = currentPoints - pointsNeeded;

    setVouchers((prev) => {
      if (prev.some((v) => v.code === voucherCode)) return prev;
      return [
        {
          id: Date.now(),
          code: voucherCode,
          discountPct: discountPct,
          minOrder: 40000,
          description: `Voucher VIP đổi từ C-Points (Giảm ${discountPct}%)`,
          expiredAt: '2026-12-31',
          isActive: true
        },
        ...prev
      ];
    });

    const updatedUser: User = {
      ...currentUser,
      rewardPoints: newPoints
    };
    handleUpdateProfile(updatedUser);

    showToast(`🎁 Đổi mã giảm giá ${voucherCode} (-${discountPct}%) thành công! Đã lưu vào kho Voucher.`);
  };

  useEffect(() => {
    try {
      const key = currentUser ? `canteengo_cart_user_${currentUser.id}` : 'canteengo_cart_guest';
      localStorage.setItem(key, JSON.stringify(cartItems));
    } catch (e) {
      console.error(e);
    }
  }, [cartItems, currentUser]);

  useEffect(() => {
    try {
      localStorage.setItem('canteengo_chat_messages', JSON.stringify(chatMessages));
    } catch (e) {}
  }, [chatMessages]);

  const handleSendCustomerChatMessage = (
    conversationId: string,
    messageText: string,
    customerName: string,
    customerPhone?: string
  ) => {
    const newMsg: ChatMessage = {
      id: `msg_${Date.now()}`,
      conversationId,
      customerName,
      customerPhone,
      senderId: currentUser ? currentUser.id : 'guest',
      senderName: customerName,
      senderRole: currentUser ? currentUser.role : 'GUEST',
      message: messageText,
      createdAt: new Date().toISOString(),
      isReadByStaff: false,
      isReadByCustomer: true,
      isStaffReply: false
    };

    setChatMessages((prev) => [...prev, newMsg]);

    // Push notification to Staff & Admin for incoming customer message
    const staffChatNotif: AppNotification = {
      id: `notif_staff_chat_${Date.now()}`,
      targetRole: 'STAFF',
      title: `💬 Tin nhắn CSKH mới từ ${customerName}`,
      message: `Khách ${customerName}: "${messageText.substring(0, 60)}${messageText.length > 60 ? '...' : ''}"`,
      createdAt: new Date().toISOString(),
      type: 'CHAT',
      isRead: false
    };

    setNotifications((prev) => [staffChatNotif, ...prev]);
  };

  const handleSendStaffChatMessage = (
    conversationId: string,
    messageText: string,
    staffUser: User
  ) => {
    // Preserve original customerName and customerPhone from conversation history
    const existingMsg = chatMessages.find((m) => m.conversationId === conversationId);
    const customerName = existingMsg?.customerName || 'Khách hàng';
    const customerPhone = existingMsg?.customerPhone;

    const newMsg: ChatMessage = {
      id: `msg_${Date.now()}`,
      conversationId,
      customerName,
      customerPhone,
      senderId: staffUser.id,
      senderName: `${staffUser.fullName} (${staffUser.role === 'ADMIN' ? 'Admin' : 'Nhân viên'})`,
      senderRole: staffUser.role === 'ADMIN' ? 'ADMIN' : 'STAFF',
      message: messageText,
      createdAt: new Date().toISOString(),
      isReadByStaff: true,
      isReadByCustomer: false,
      isStaffReply: true
    };

    setChatMessages((prev) => [...prev, newMsg]);

    let targetUserId: number | undefined = undefined;
    if (conversationId.startsWith('user-')) {
      const parsed = parseInt(conversationId.replace('user-', ''), 10);
      if (!isNaN(parsed)) targetUserId = parsed;
    } else if (typeof existingMsg?.senderId === 'number') {
      targetUserId = existingMsg.senderId;
    }

    const newNotif: AppNotification = {
      id: `notif_chat_${Date.now()}`,
      userId: targetUserId,
      title: '💬 Nhận tin nhắn mới từ CanteenGo',
      message: `${staffUser.fullName}: "${messageText.substring(0, 60)}${messageText.length > 60 ? '...' : ''}"`,
      createdAt: new Date().toISOString(),
      type: 'CHAT',
      isRead: false
    };

    setNotifications((prev) => [newNotif, ...prev]);
    showToast(`✉️ Đã gửi tin nhắn cho khách ${customerName}!`);
  };

  const handleMarkChatAsReadByStaff = (conversationId: string) => {
    setChatMessages((prev) =>
      prev.map((msg) =>
        msg.conversationId === conversationId ? { ...msg, isReadByStaff: true } : msg
      )
    );
  };

  const handleMarkChatAsReadByCustomer = (conversationId: string) => {
    setChatMessages((prev) =>
      prev.map((msg) =>
        msg.conversationId === conversationId ? { ...msg, isReadByCustomer: true } : msg
      )
    );
  };

  const unreadStaffChatCount = chatMessages.filter(
    (m) => (m.senderRole === 'CUSTOMER' || m.senderRole === 'GUEST') && !m.isReadByStaff
  ).length;

  // Account & Role-specific notifications filtering for current user
  const userNotifications = useMemo(() => {
    if (!currentUser) return [];

    if (currentUser.role === 'STAFF' || currentUser.role === 'ADMIN') {
      return notifications.filter((n) =>
        n.targetRole === 'STAFF' ||
        n.targetRole === 'ADMIN' ||
        n.targetRole === 'ALL' ||
        n.userId === currentUser.id ||
        (!n.userId && !n.targetRole)
      );
    }

    return notifications.filter((n) =>
      n.userId === currentUser.id ||
      n.targetRole === 'CUSTOMER' ||
      n.targetRole === 'ALL' ||
      (!n.userId && !n.targetRole)
    );
  }, [notifications, currentUser]);

  const handleMarkNotifAsRead = (id: string) => {
    setNotifications((prev) => {
      const updated = prev.map((n) => (n.id === id ? { ...n, isRead: true } : n));
      try {
        localStorage.setItem('canteengo_notifications', JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });
  };

  const handleMarkAllNotifsAsRead = () => {
    if (!currentUser) return;
    const userNotifIds = new Set(userNotifications.map(n => n.id));
    setNotifications((prev) => {
      const updated = prev.map((n) =>
        userNotifIds.has(n.id) ? { ...n, isRead: true } : n
      );
      try {
        localStorage.setItem('canteengo_notifications', JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });
    showToast('Đã đánh dấu tất cả thông báo của bạn là đã đọc!');
  };

  const handleSelectNotification = (notif: AppNotification) => {
    if (notif.type === 'ORDER') {
      setActiveTab('my_orders');
    } else if (notif.voucherCode) {
      showToast(`Mã ưu đãi ${notif.voucherCode} đã được lưu!`);
    }
    setIsNotificationModalOpen(false);
  };

  const handleToggleFavorite = (itemId: number) => {
    setFavoriteItemIds((prev) => {
      const exists = prev.includes(itemId);
      const updated = exists ? prev.filter((id) => id !== itemId) : [...prev, itemId];
      try {
        localStorage.setItem('canteengo_favorite_items', JSON.stringify(updated));
      } catch (e) {}
      
      const targetItem = menuItems.find((i) => i.id === itemId);
      if (targetItem) {
        if (exists) {
          showToast(`Đã bỏ món "${targetItem.name}" khỏi danh sách yêu thích.`);
        } else {
          showToast(`❤️ Đã thêm món "${targetItem.name}" vào danh sách yêu thích!`);
        }
      }
      return updated;
    });
  };

  // Custom Theme & Background Wallpaper State (Persisted for ALL Users)
  const [themeConfig, setThemeConfig] = useState<ThemeConfig>(() => {
    try {
      const saved = localStorage.getItem('canteengo_theme_config');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return DEFAULT_THEME_CONFIG;
  });
  const [isThemeModalOpen, setIsThemeModalOpen] = useState(false);

  useEffect(() => {
    // Preload preset wallpapers as soon as app boots to ensure zero-lag switching
    PRESET_WALLPAPERS.forEach(wp => {
      const img = new Image();
      img.src = wp.url;
    });
  }, []);

  const handleUpdateTheme = (newConfig: ThemeConfig) => {
    setThemeConfig(newConfig);
    try {
      localStorage.setItem('canteengo_theme_config', JSON.stringify(newConfig));
    } catch (e) {}
  };

  const handleResetTheme = () => {
    setThemeConfig(DEFAULT_THEME_CONFIG);
    try {
      localStorage.removeItem('canteengo_theme_config');
      localStorage.removeItem('themeMode');
      localStorage.removeItem('accentColor');
    } catch (e) {}
    applyTheme('dark');
    showToast('Đã khôi phục giao diện chuẩn!');
  };

  // Modals
  const [isComboModalOpen, setIsComboModalOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isWalletOpen, setIsWalletOpen] = useState(false);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [selectedReviewItem, setSelectedReviewItem] = useState<MenuItem | null>(null);
  const [authModalMode, setAuthModalMode] = useState<'LOGIN' | 'REGISTER' | 'PROFILE'>('LOGIN');
  const [selectedDetailItem, setSelectedDetailItem] = useState<MenuItem | null>(null);
  const [selectedDetailIsFlashSale, setSelectedDetailIsFlashSale] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Wallet Deposit Handler
  const handleDepositWallet = (amount: number) => {
    if (!currentUser) return;
    const currentBalance = currentUser.walletBalance || 0;
    const newBalance = currentBalance + amount;
    const newTx: WalletTransaction = {
      id: `TX-${Math.floor(1000 + Math.random() * 9000)}`,
      type: 'DEPOSIT',
      amount: amount,
      description: `Nạp tiền vào Ví C-Pay qua VietQR Bank`,
      createdAt: new Date().toLocaleString('vi-VN'),
      status: 'SUCCESS'
    };
    const updatedUser: User = {
      ...currentUser,
      walletBalance: newBalance,
      walletTransactions: [newTx, ...(currentUser.walletTransactions || [])]
    };
    handleUpdateProfile(updatedUser);
    
    // Push notification for customer
    const walletNotif: AppNotification = {
      id: `notif-${Date.now()}`,
      userId: currentUser.id,
      targetRole: 'CUSTOMER',
      title: `💰 Nạp +${amount.toLocaleString('vi-VN')}₫ vào Ví thành công`,
      message: `Tài khoản Ví C-Pay vừa được cộng thành công ${amount.toLocaleString('vi-VN')}₫. Số dư mới: ${newBalance.toLocaleString('vi-VN')}₫.`,
      createdAt: new Date().toISOString(),
      type: 'WALLET',
      isRead: false
    };

    // Push notification for staff/admin
    const staffWalletNotif: AppNotification = {
      id: `notif_staff_wallet_${Date.now()}`,
      targetRole: 'STAFF',
      title: `💵 Giao dịch Ví: ${currentUser.fullName}`,
      message: `Khách hàng ${currentUser.fullName} vừa nạp +${amount.toLocaleString('vi-VN')}₫ vào Ví C-Pay.`,
      createdAt: new Date().toISOString(),
      type: 'WALLET',
      isRead: false
    };

    setNotifications(prev => [staffWalletNotif, walletNotif, ...prev]);

    showToast(`Đã nạp +${amount.toLocaleString('vi-VN')}₫ vào Ví C-Pay thành công!`);
  };

  // Helper to merge guest cart items into user's existing cart
  const mergeCartItems = (targetCart: CartItem[], incomingCart: CartItem[]): CartItem[] => {
    if (!incomingCart || incomingCart.length === 0) return targetCart;
    if (!targetCart || targetCart.length === 0) return [...incomingCart];

    const merged = targetCart.map((item) => ({ ...item }));

    incomingCart.forEach((incoming) => {
      if (incoming.isCombo) {
        const existingCombo = merged.find(
          (ci) => ci.isCombo && ci.comboName === incoming.comboName
        );
        if (existingCombo) {
          existingCombo.quantity += incoming.quantity;
        } else {
          merged.push({
            ...incoming,
            id: `combo_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
          });
        }
      } else {
        const incomingItemId = incoming.menuItem?.id || (incoming as any).item?.id;
        const existingSingle = merged.find((ci) => {
          if (ci.isCombo) return false;
          const ciItemId = ci.menuItem?.id || (ci as any).item?.id;
          return ciItemId === incomingItemId && (ci.note || '') === (incoming.note || '');
        });

        if (existingSingle) {
          existingSingle.quantity += incoming.quantity;
        } else {
          merged.push({
            ...incoming,
            id: `single_${incomingItemId || Date.now()}_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
          });
        }
      }
    });

    return merged;
  };

  // Real Manual Authentication Handlers
  const handleLogin = (user: User) => {
    // 1. Get current guest items
    const guestCartKey = 'canteengo_cart_guest';
    let guestCart: CartItem[] = [];
    try {
      const savedGuest = localStorage.getItem(guestCartKey);
      if (savedGuest) guestCart = JSON.parse(savedGuest);
    } catch (e) {}

    if (guestCart.length === 0 && !currentUser && cartItems.length > 0) {
      guestCart = cartItems;
    }

    // 2. Get user's existing cart
    const userCartKey = `canteengo_cart_user_${user.id}`;
    let userCart: CartItem[] = [];
    try {
      const savedUserCart = localStorage.getItem(userCartKey);
      if (savedUserCart) userCart = JSON.parse(savedUserCart);
    } catch (e) {}

    // 3. Merge guest cart into user's cart
    const mergedCart = mergeCartItems(userCart, guestCart);

    // 4. Save merged cart for user and clear guest cart
    try {
      localStorage.setItem(userCartKey, JSON.stringify(mergedCart));
      localStorage.removeItem(guestCartKey);
      localStorage.setItem('canteengo_session_user', JSON.stringify(user));
    } catch (e) {}

    // 5. Update state and keep usersList synced
    setCurrentUser(user);
    setCartItems(mergedCart);
    setUsersList((prev) => {
      const exists = prev.some((u) => u.id === user.id || u.email.toLowerCase() === user.email.toLowerCase());
      let updated: User[];
      if (!exists) {
        updated = [...prev, user];
      } else {
        updated = prev.map((u) => (u.id === user.id || u.email.toLowerCase() === user.email.toLowerCase() ? user : u));
      }
      try {
        localStorage.setItem('canteengo_users_list', JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });

    // Redirect & toast
    if (guestCart.length > 0) {
      showToast(`🛒 Đã tự động gộp món ăn vào giỏ hàng của ${user.fullName}!`);
    } else if (user.role === 'STAFF') {
      showToast(`Đăng nhập thành công! Chào mừng Nhân viên ${user.fullName}`);
    } else if (user.role === 'ADMIN') {
      showToast(`Đăng nhập thành công! Chào mừng Quản trị viên ${user.fullName}`);
    } else if (user.role === 'TEACHER') {
      showToast(`👨‍🏫 Đăng nhập thành công! Kính chào Quý Thầy/Cô ${user.fullName}`);
    } else if (user.role === 'STUDENT') {
      showToast(`👨‍🎓 Đăng nhập thành công! Chào bạn Sinh viên ${user.fullName}`);
    } else {
      showToast(`Đăng nhập thành công! Chào bạn ${user.fullName}`);
    }

    if (user.role === 'STAFF') {
      setActiveTab('orders');
    } else if (user.role === 'ADMIN') {
      setActiveTab('admin');
    } else {
      setActiveTab('menu');
    }
  };

  const handleRegister = (newUser: User) => {
    const updatedList = [...usersList, newUser];
    setUsersList(updatedList);

    // Get current guest items
    const guestCartKey = 'canteengo_cart_guest';
    let guestCart: CartItem[] = [];
    try {
      const savedGuest = localStorage.getItem(guestCartKey);
      if (savedGuest) guestCart = JSON.parse(savedGuest);
    } catch (e) {}

    if (guestCart.length === 0 && !currentUser && cartItems.length > 0) {
      guestCart = cartItems;
    }

    const userCartKey = `canteengo_cart_user_${newUser.id}`;
    const mergedCart = [...guestCart];

    try {
      localStorage.setItem('canteengo_users_list', JSON.stringify(updatedList));
      localStorage.setItem('canteengo_session_user', JSON.stringify(newUser));
      localStorage.setItem(userCartKey, JSON.stringify(mergedCart));
      localStorage.removeItem(guestCartKey);
    } catch (e) {}

    setCurrentUser(newUser);
    setCartItems(mergedCart);

    if (newUser.role === 'STAFF') {
      setActiveTab('orders');
    } else if (newUser.role === 'ADMIN') {
      setActiveTab('admin');
    } else {
      setActiveTab('menu');
    }

    if (guestCart.length > 0) {
      showToast(`🎉 Đăng ký thành công! Đã chuyển món vào giỏ hàng của bạn.`);
    } else {
      showToast(`Đăng ký tài khoản thành công! Đã đăng nhập với tư cách ${newUser.fullName}`);
    }
  };

  const handleLogout = () => {
    if (currentUser) {
      try {
        localStorage.setItem(`canteengo_cart_user_${currentUser.id}`, JSON.stringify(cartItems));
      } catch (e) {}
    }

    setCurrentUser(null);
    try {
      localStorage.removeItem('canteengo_session_user');
    } catch (e) {}

    let guestCart: CartItem[] = [];
    try {
      const savedGuest = localStorage.getItem('canteengo_cart_guest');
      if (savedGuest) guestCart = JSON.parse(savedGuest);
    } catch (e) {}

    setCartItems(guestCart);
    setActiveTab('menu');
    showToast('Đã đăng xuất tài khoản. Giỏ hàng riêng của bạn đã được lưu an toàn.');
  };

  // Profile update handler (for customer, staff, admin to edit their own profile)
  const handleUpdateProfile = (updatedUser: User) => {
    const updatedList = usersList.map((u) => (u.id === updatedUser.id ? updatedUser : u));
    setUsersList(updatedList);
    setCurrentUser(updatedUser);
    try {
      localStorage.setItem('canteengo_users_list', JSON.stringify(updatedList));
      localStorage.setItem('canteengo_session_user', JSON.stringify(updatedUser));
    } catch (e) {}
    showToast('Cập nhật thông tin tài khoản thành công!');
  };

  // Admin Account Management Handlers (Admin creates any account, edits/deletes accounts & roles)
  const handleAddUserByAdmin = (newUserData: Omit<User, 'id' | 'createdAt'>) => {
    const newUser: User = {
      ...newUserData,
      id: Math.floor(Date.now() / 1000),
      createdAt: new Date().toISOString().split('T')[0],
      walletBalance: newUserData.walletBalance ?? 0,
      rewardPoints: newUserData.rewardPoints ?? 0,
    };
    const updatedList = [...usersList, newUser];
    setUsersList(updatedList);
    try {
      localStorage.setItem('canteengo_users_list', JSON.stringify(updatedList));
    } catch (e) {}
    showToast(`Đã tạo tài khoản: ${newUser.fullName} (${newUser.role})`);
  };

  const handleUpdateUserByAdmin = (userToUpdate: User) => {
    const updatedList = usersList.map((u) => (u.id === userToUpdate.id ? userToUpdate : u));
    setUsersList(updatedList);
    if (currentUser?.id === userToUpdate.id || currentUser?.email.toLowerCase() === userToUpdate.email.toLowerCase()) {
      setCurrentUser(userToUpdate);
      try {
        localStorage.setItem('canteengo_session_user', JSON.stringify(userToUpdate));
      } catch (e) {}
    }
    try {
      localStorage.setItem('canteengo_users_list', JSON.stringify(updatedList));
    } catch (e) {}
    if (db && userToUpdate.firebaseUid) {
      setDoc(doc(db, 'users', userToUpdate.firebaseUid), userToUpdate, { merge: true }).catch(console.error);
    }
    showToast(`Đã cập nhật thông tin & phân quyền: ${userToUpdate.fullName}`);
  };

  const handleDeleteUserByAdmin = (userId: number) => {
    const target = usersList.find((u) => u.id === userId);
    if (target?.role === 'ADMIN') {
      showToast('Không thể xóa tài khoản Quản trị viên duy nhất!');
      return;
    }
    const updatedList = usersList.filter((u) => u.id !== userId);
    setUsersList(updatedList);
    try {
      localStorage.setItem('canteengo_users_list', JSON.stringify(updatedList));
    } catch (e) {}
    showToast(`Đã xóa tài khoản "${target?.fullName || userId}" khỏi hệ thống.`);
  };

  // Helper for login triggers from RoleGuard
  const handleQuickSwitchToRole = (role: UserRole) => {
    setAuthModalMode('LOGIN');
    setIsAuthModalOpen(true);
  };

  // Cart operations (US17)
  const handleAddToCart = (item: MenuItem, quantity = 1, note?: string, isFlashSale?: boolean): boolean => {
    const matched = menuItems.find(m => m.id === item.id) || item;

    // If it's a flash sale item, check stock limit
    if (isFlashSale) {
      const totalFlash = matched.flashSaleTotalQty ?? 20;
      const soldFlash = matched.flashSaleSoldCount ?? 0;
      const remainingFlash = Math.max(0, totalFlash - soldFlash);

      const existingInCart = cartItems.find(ci => !ci.isCombo && ci.menuItem?.id === item.id && ci.isFlashSale);
      const currentQty = existingInCart ? existingInCart.quantity : 0;

      if (currentQty + quantity > remainingFlash) {
        showToast('Số lượng món giảm giá không đủ');
        return false;
      }
    } else {
      // Standard regular menu item: check remaining stock
      const existingInCart = cartItems.find(ci => !ci.isCombo && ci.menuItem?.id === item.id && !ci.isFlashSale);
      const currentQty = existingInCart ? existingInCart.quantity : 0;

      if (currentQty + quantity > matched.stock) {
        showToast('Món ăn đã hết');
        return false;
      }
    }

    setCartItems((prev) => {
      const existing = prev.find(ci => !ci.isCombo && ci.menuItem?.id === item.id && Boolean(ci.isFlashSale) === Boolean(isFlashSale));
      if (existing) {
        return prev.map(ci => 
          ci.id === existing.id 
            ? { ...ci, quantity: ci.quantity + quantity, note: note || ci.note }
            : ci
        );
      }
      const newCartItem: CartItem = {
        id: `single_${item.id}_${isFlashSale ? 'flash_' : ''}${Date.now()}`,
        menuItem: item,
        quantity,
        isCombo: false,
        isFlashSale: Boolean(isFlashSale),
        totalPrice: isFlashSale && item.flashPrice ? item.flashPrice : item.price,
        totalCalories: item.calories,
        note,
      };
      return [...prev, newCartItem];
    });
    showToast(isFlashSale ? `⚡ Đã thêm ưu đãi Flash Sale "${item.name}" vào giỏ hàng` : `Đã thêm "${item.name}" vào giỏ hàng`);
    return true;
  };

  // Add customized Combo to Cart (US15)
  const handleAddComboToCart = (combo: {
    items: MenuItem[];
    name: string;
    totalPrice: number;
    totalCalories: number;
    discountedPrice: number;
  }) => {
    const newCartItem: CartItem = {
      id: `combo_${Date.now()}`,
      isCombo: true,
      comboName: combo.name,
      comboItems: combo.items,
      quantity: 1,
      totalPrice: combo.discountedPrice,
      totalCalories: combo.totalCalories,
      note: 'Gói combo 4 món dinh dưỡng',
    };
    setCartItems(prev => [...prev, newCartItem]);
    setIsCartOpen(true);
    showToast(`Đã thêm gói "${combo.name}" vào giỏ hàng (-10%)`);
  };

  const handleUpdateQuantity = (id: string, delta: number) => {
    if (delta > 0) {
      const ci = cartItems.find(c => c.id === id);
      if (ci && !ci.isCombo && ci.menuItem) {
        const matched = menuItems.find(m => m.id === ci.menuItem?.id) || ci.menuItem;
        if (ci.isFlashSale) {
          const totalFlash = matched.flashSaleTotalQty ?? 20;
          const soldFlash = matched.flashSaleSoldCount ?? 0;
          const remainingFlash = Math.max(0, totalFlash - soldFlash);
          if (ci.quantity + delta > remainingFlash) {
            showToast('Số lượng món giảm giá không đủ');
            return;
          }
        } else {
          if (ci.quantity + delta > matched.stock) {
            showToast('Món ăn đã hết');
            return;
          }
        }
      }
    }

    setCartItems(prev => prev.map(ci => {
      if (ci.id === id) {
        const nextQty = ci.quantity + delta;
        return nextQty > 0 ? { ...ci, quantity: nextQty } : null;
      }
      return ci;
    }).filter(Boolean) as CartItem[]);
  };

  const handleRemoveCartItem = (id: string) => {
    setCartItems(prev => prev.filter(ci => ci.id !== id));
  };

  const handleClearCart = () => {
    setCartItems([]);
  };

  const handleReorderOrder = (orderToReorder: Order) => {
    const newCartItems: CartItem[] = orderToReorder.items.map((item, idx) => {
      const matchedMenuItem = menuItems.find(m => m.id === item.itemId || m.name.toLowerCase() === item.itemName.toLowerCase());
      return {
        id: `reorder_${Date.now()}_${idx}`,
        item: matchedMenuItem || {
          id: item.itemId || 999,
          name: item.itemName,
          price: item.unitPrice,
          image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&auto=format&fit=crop&q=80',
          category: 'Thực đơn',
          description: 'Món ăn trong đơn hàng đã đặt',
          calories: 500,
          availableQuantity: 50,
          isAvailable: true,
          isVegetarian: false
        },
        quantity: item.quantity,
        isCombo: item.isCombo || false,
        comboName: item.isCombo ? item.itemName : undefined,
        totalPrice: item.unitPrice,
        totalCalories: 500,
        note: 'Đặt lại từ đơn #' + orderToReorder.orderCode
      };
    });

    setCartItems(prev => [...prev, ...newCartItems]);
    setIsCartOpen(true);
    showToast(`🛒 Đã thêm ${newCartItems.length} món từ đơn #${orderToReorder.orderCode} vào Giỏ hàng!`);
  };

  // Create Order (US18, US19)
  const handleCreateOrder = (newOrder: Order) => {
    setOrders(prev => {
      const nextOrders = [newOrder, ...prev];
      try {
        localStorage.setItem('canteengo_orders', JSON.stringify(nextOrders));
      } catch (e) {}
      return nextOrders;
    });

    // Sync order to Firestore
    try {
      setDoc(doc(db, 'orders', newOrder.orderCode), {
        orderCode: newOrder.orderCode,
        userId: String(newOrder.userId),
        customerName: newOrder.receiverName,
        customerPhone: newOrder.phone,
        customerArea: newOrder.pickupArea,
        totalAmount: newOrder.totalAmount,
        finalAmount: newOrder.finalAmount,
        status: newOrder.status,
        paymentStatus: newOrder.paymentStatus,
        paymentMethod: newOrder.paymentMethod,
        notes: newOrder.notes || '',
        itemsCount: newOrder.items.length,
        createdAt: newOrder.createdAt,
      }).catch((err) => console.warn('Firestore order sync:', err));
    } catch (e) {}
    
    // Deduct stock and increment Flash Sale sold count for items in order
    newOrder.items.forEach(oi => {
      if (oi.itemId) {
        setMenuItems(currentItems => currentItems.map(item => {
          if (item.id === oi.itemId) {
            const newSoldCount = (oi.isFlashSale && item.isFlashSale)
              ? (item.flashSaleSoldCount || 0) + oi.quantity 
              : item.flashSaleSoldCount;
            return { 
              ...item, 
              stock: Math.max(0, item.stock - oi.quantity),
              flashSaleSoldCount: newSoldCount
            };
          }
          return item;
        }));
      } else if (oi.isCombo && oi.comboItemIds) {
        setMenuItems(currentItems => currentItems.map(item => {
          if (oi.comboItemIds?.includes(item.id)) {
            return { 
              ...item, 
              stock: Math.max(0, item.stock - oi.quantity)
            };
          }
          return item;
        }));
      }
    });

    // Handle WALLET payment deduction & transaction log
    const isWalletOrder = newOrder.paymentMethod === 'WALLET' || newOrder.payment?.method === 'wallet';
    if (isWalletOrder && currentUser) {
      const currentWallet = currentUser.wallet ?? currentUser.walletBalance ?? 0;
      if (currentWallet >= newOrder.finalAmount) {
        const newBalance = Math.max(0, currentWallet - newOrder.finalAmount);

        const newTx: WalletTransaction = {
          id: `TX-${Math.floor(1000 + Math.random() * 9000)}`,
          type: 'PAYMENT',
          amount: newOrder.finalAmount,
          description: `Thanh toán đơn hàng #${newOrder.orderCode}`,
          createdAt: new Date().toLocaleString('vi-VN'),
          status: 'SUCCESS'
        };

        const historyItem: WalletHistoryItem = {
          type: 'payment',
          amount: -newOrder.finalAmount,
          relatedOrderId: String(newOrder.id),
          reason: `Thanh toán đơn #${newOrder.orderCode}`,
          at: Date.now(),
          txId: `PAY${newOrder.id}-${Date.now()}`
        };

        const updatedUser: User = {
          ...currentUser,
          wallet: newBalance,
          walletBalance: newBalance,
          walletTransactions: [newTx, ...(currentUser.walletTransactions || [])],
          walletHistory: [historyItem, ...(currentUser.walletHistory || [])]
        };
        handleUpdateProfile(updatedUser);
        showToast('Đã thanh toán bằng ví. Đơn đang chờ bếp.');
      }
    }

    // Push notification for Customer
    const custId = newOrder.userId || currentUser?.id || 1;
    createNotification({
      userId: custId,
      userRole: 'customer',
      type: 'order_new',
      title: `🛍️ Đặt đơn thành công`,
      message: `Đơn hàng #${newOrder.orderCode} trị giá ${newOrder.finalAmount.toLocaleString('vi-VN')}₫ đã được gửi tới bếp Canteen. Nhận tại: ${newOrder.pickupArea}`,
      relatedOrderId: newOrder.id
    });

    createNotificationForRole('staff', {
      type: 'order_new',
      title: `🔔 Có đơn mới #${newOrder.orderCode}`,
      message: `Khách hàng ${newOrder.receiverName} vừa đặt đơn ${newOrder.items.length} món (${newOrder.finalAmount.toLocaleString('vi-VN')}₫). Nhận tại ${newOrder.pickupArea}.`,
      relatedOrderId: newOrder.id
    });

    createNotificationForRole('admin', {
      type: 'order_new',
      title: `🔔 Có đơn mới #${newOrder.orderCode}`,
      message: `Khách hàng ${newOrder.receiverName} vừa đặt đơn ${newOrder.items.length} món (${newOrder.finalAmount.toLocaleString('vi-VN')}₫). Nhận tại ${newOrder.pickupArea}.`,
      relatedOrderId: newOrder.id
    });

    // Automatic Loyalty Points award: 10k VND = +1 C-Point
    if (currentUser) {
      const earnedPoints = Math.floor(newOrder.finalAmount / 10000);
      if (earnedPoints > 0) {
        const currentPoints = currentUser.rewardPoints || 0;
        const newPoints = currentPoints + earnedPoints;
        const currentSpent = (currentUser.totalSpent || 0) + newOrder.finalAmount;
        const newTier: VipTier = newPoints >= 700 ? 'DIAMOND' : newPoints >= 300 ? 'GOLD' : newPoints >= 100 ? 'SILVER' : 'BRONZE';
        
        handleUpdateProfile({
          ...currentUser,
          rewardPoints: newPoints,
          vipTier: newTier,
          totalSpent: currentSpent
        });

        showToast(`🎉 Thưởng +${earnedPoints} C-Points từ đơn #${newOrder.orderCode}! (Hạng ${newTier})`);
      } else {
        showToast(`Đơn hàng #${newOrder.orderCode} đã được gửi thành công!`);
      }
    } else {
      showToast(`Đơn hàng #${newOrder.orderCode} đã được gửi thành công!`);
    }
  };

  // Update Order Status (US22, US23)
  const handleUpdateOrderStatus = (orderId: number, newStatus: OrderStatus, note?: string) => {
    const targetOrder = orders.find(o => o.id === orderId);

    setOrders(prev => {
      const nextOrders = prev.map(order => {
        if (order.id === orderId) {
          if (newStatus === 'CANCELLED' && order.status !== 'CANCELLED') {
            order.items.forEach(oi => {
              if (oi.itemId) {
                setMenuItems(currentItems => currentItems.map(item => {
                  if (item.id === oi.itemId) {
                    return { ...item, stock: item.stock + oi.quantity };
                  }
                  return item;
                }));
              } else if (oi.isCombo && oi.comboItemIds) {
                setMenuItems(currentItems => currentItems.map(item => {
                  if (oi.comboItemIds?.includes(item.id)) {
                    return { ...item, stock: item.stock + oi.quantity };
                  }
                  return item;
                }));
              }
            });
          }
          const now = Date.now();
          const nowTimeStr = formatTime24h(new Date(), false);
          const updatedCompletedAt = (newStatus === 'READY' || newStatus === 'DELIVERED')
            ? normalizeTimeString24h(order.completedAt || nowTimeStr)
            : order.completedAt;

          const updatedCookingAt = newStatus === 'PROCESSING' ? (order.cookingAt || now) : order.cookingAt;
          const updatedReadyAt = newStatus === 'READY' ? (order.readyAt || now) : (newStatus === 'DELIVERED' ? (order.readyAt || now) : order.readyAt);
          const updatedDoneAt = newStatus === 'DELIVERED' ? (order.doneAt || now) : order.doneAt;

          let updatedCancel = order.cancel;
          if (newStatus === 'CANCELLED') {
            updatedCancel = {
              cancelledBy: (currentUser?.role === 'ADMIN' ? 'admin' : currentUser?.role === 'STAFF' ? 'staff' : 'system'),
              reason: note || 'Hủy đơn',
              cancelledAt: order.cancel?.cancelledAt || now
            };
          }

          return {
            ...order,
            status: newStatus,
            cancelReason: newStatus === 'CANCELLED' ? note : undefined,
            cancel: updatedCancel,
            paymentStatus: newStatus === 'DELIVERED' ? 'PAID' : order.paymentStatus,
            completedAt: updatedCompletedAt,
            estimatedCompletionTime: normalizeTimeString24h(order.estimatedCompletionTime || order.pickupTime),
            cookingAt: updatedCookingAt,
            readyAt: updatedReadyAt,
            doneAt: updatedDoneAt
          };
        }
        return order;
      });

      try {
        localStorage.setItem('canteengo_orders', JSON.stringify(nextOrders));
      } catch (e) {}

      return nextOrders;
    });

    if (targetOrder) {
      const isPaid = targetOrder.payment?.status === 'paid' || targetOrder.paymentStatus === 'PAID';

      if (newStatus === 'PROCESSING') {
        createNotification({
          userId: targetOrder.userId,
          userRole: 'customer',
          type: 'order_cooking',
          title: `🔥 Đơn #${targetOrder.orderCode} đang được nấu`,
          message: `Đơn hàng đang trong quá trình chế biến nóng hổi tại bếp.`,
          relatedOrderId: targetOrder.id
        });
        createNotificationForRole('admin', {
          type: 'order_cooking',
          title: `🔥 Đơn #${targetOrder.orderCode} đang được nấu`,
          message: `Đơn #${targetOrder.orderCode} đang được chế biến bởi bếp.`,
          relatedOrderId: targetOrder.id
        });
      } else if (newStatus === 'READY') {
        createNotification({
          userId: targetOrder.userId,
          userRole: 'customer',
          type: 'order_ready',
          title: `🎉 Đơn đã sẵn sàng #${targetOrder.orderCode}`,
          message: `Món ăn của bạn đã làm xong. Vui lòng ghé quầy ${targetOrder.pickupArea} nhận món nhé!`,
          relatedOrderId: targetOrder.id
        });
      } else if (newStatus === 'DELIVERED') {
        createNotification({
          userId: targetOrder.userId,
          userRole: 'customer',
          type: 'order_done',
          title: `✅ Đơn đã giao thành công, hãy đánh giá`,
          message: `Cảm ơn bạn đã thưởng thức tại CanteenGo! Hãy đánh giá bữa ăn để giúp bếp phục vụ tốt hơn.`,
          relatedOrderId: targetOrder.id
        });
      } else if (newStatus === 'CANCELLED') {
        if (isPaid) {
          createNotification({
            userId: targetOrder.userId,
            userRole: 'customer',
            type: 'refund',
            title: `❌ Đơn #${targetOrder.orderCode} đã hủy & hoàn tiền`,
            message: `Đơn #${targetOrder.orderCode} đã hủy và hoàn tiền vào ví.`,
            relatedOrderId: targetOrder.id
          });
          createNotificationForRole('staff', {
            type: 'order_cancelled',
            title: `⚠️ Đơn paid #${targetOrder.orderCode} bị hủy`,
            message: `Đơn #${targetOrder.orderCode} (đã thanh toán) bị hủy. Hủy món nếu đang nấu!`,
            relatedOrderId: targetOrder.id
          });
          createNotificationForRole('admin', {
            type: 'refund',
            title: `💰 Đơn paid #${targetOrder.orderCode} bị hủy - Cần duyệt hoàn tiền`,
            message: `Đơn #${targetOrder.orderCode} đã thanh toán bị hủy, kiểm tra lịch sử hoàn tiền.`,
            relatedOrderId: targetOrder.id
          });
        } else {
          createNotification({
            userId: targetOrder.userId,
            userRole: 'customer',
            type: 'order_cancelled',
            title: `❌ Đơn hàng #${targetOrder.orderCode} đã bị hủy`,
            message: `Đơn #${targetOrder.orderCode} đã bị hủy${note ? `: ${note}` : ''}.`,
            relatedOrderId: targetOrder.id
          });
          createNotificationForRole('staff', {
            type: 'order_cancelled',
            title: `❌ Khách hủy đơn #${targetOrder.orderCode}`,
            message: `Đơn #${targetOrder.orderCode} đã bị hủy.`,
            relatedOrderId: targetOrder.id
          });
          createNotificationForRole('admin', {
            type: 'order_cancelled',
            title: `❌ Khách hủy đơn #${targetOrder.orderCode}`,
            message: `Đơn #${targetOrder.orderCode} đã bị hủy.`,
            relatedOrderId: targetOrder.id
          });
        }
      }
    }

    const statusNames: Record<OrderStatus, string> = {
      PENDING: 'Chờ duyệt',
      PROCESSING: 'Đang nấu / Ra khay',
      READY: 'Sẵn sàng nhận',
      DELIVERED: 'Đã giao thành công',
      CANCELLED: 'Đã hủy đơn'
    };
    showToast(`Đã cập nhật: ${statusNames[newStatus]}`);
  };

  // Customer Cancel Order with auto refund
  const handleCustomerCancelOrder = async (order: Order, reason: string) => {
    if (!currentUser) return;
    try {
      const result = await cancelAndRefundOrder(order, currentUser, reason);
      setOrders(prev => prev.map(o => o.id === order.id ? result.updatedOrder : o));
      order.items.forEach(oi => {
        if (oi.itemId) {
          setMenuItems(currentItems => currentItems.map(item => {
            if (item.id === oi.itemId) {
              return { ...item, stock: item.stock + oi.quantity };
            }
            return item;
          }));
        } else if (oi.isCombo && oi.comboItemIds) {
          setMenuItems(currentItems => currentItems.map(item => {
            if (oi.comboItemIds?.includes(item.id)) {
              return { ...item, stock: item.stock + oi.quantity };
            }
            return item;
          }));
        }
      });
      if (result.updatedUser) {
        setCurrentUser(result.updatedUser);
        setUsersList(prev => prev.map(u => u.id === result.updatedUser!.id ? result.updatedUser! : u));
      }

      const isPaid = order.payment?.status === 'paid' || order.paymentStatus === 'PAID';
      if (isPaid) {
        createNotification({
          userId: order.userId,
          userRole: 'customer',
          type: 'refund',
          title: `❌ Đơn #${order.orderCode} đã hủy & hoàn tiền`,
          message: `Đơn #${order.orderCode} đã hủy và hoàn ${result.refundAmount.toLocaleString('vi-VN')}₫ vào ví.`,
          relatedOrderId: order.id
        });
        createNotificationForRole('staff', {
          type: 'order_cancelled',
          title: `⚠️ Đơn paid #${order.orderCode} bị hủy`,
          message: `Đơn #${order.orderCode} (đã thanh toán) bị hủy bởi khách. Hủy món nếu đang nấu!`,
          relatedOrderId: order.id
        });
        createNotificationForRole('admin', {
          type: 'refund',
          title: `💰 Đơn paid #${order.orderCode} bị hủy - Cần duyệt hoàn tiền`,
          message: `Đơn #${order.orderCode} đã thanh toán bị hủy, kiểm tra lịch sử hoàn tiền.`,
          relatedOrderId: order.id
        });
      } else {
        createNotification({
          userId: order.userId,
          userRole: 'customer',
          type: 'order_cancelled',
          title: `❌ Đơn hàng #${order.orderCode} đã bị hủy`,
          message: `Đơn #${order.orderCode} đã bị hủy: ${reason}`,
          relatedOrderId: order.id
        });
        createNotificationForRole('staff', {
          type: 'order_cancelled',
          title: `❌ Khách hủy đơn #${order.orderCode}`,
          message: `Đơn #${order.orderCode} đã bị khách hủy.`,
          relatedOrderId: order.id
        });
        createNotificationForRole('admin', {
          type: 'order_cancelled',
          title: `❌ Khách hủy đơn #${order.orderCode}`,
          message: `Đơn #${order.orderCode} đã bị khách hủy.`,
          relatedOrderId: order.id
        });
      }

      showToast(result.message);
    } catch (err: any) {
      showToast(err?.message || 'Không thể hủy đơn hàng');
    }
  };

  // Save Order Feedback (Rating & Feedback) and Sync to Item Reviews
  const handleSaveOrderFeedback = (orderId: number, rating: number, feedback: string) => {
    const feedbackCreatedAt = new Date().toLocaleString('vi-VN');
    const targetOrder = orders.find(o => o.id === orderId);

    setOrders(prev => {
      const updated = prev.map(order => {
        if (order.id === orderId) {
          return {
            ...order,
            rating,
            feedback,
            feedbackCreatedAt
          };
        }
        return order;
      });
      try {
        localStorage.setItem('canteengo_orders', JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });

    // Automatically sync feedback into item reviews so food items show the rating & comments!
    if (targetOrder && targetOrder.items && targetOrder.items.length > 0) {
      const userRevName = currentUser?.fullName || targetOrder.receiverName || 'Khách hàng Canteen';
      const userRevId = currentUser?.id || targetOrder.userId || 999;

      const newItemReviews: ItemReview[] = targetOrder.items.map((item, idx) => ({
        id: Date.now() + idx,
        itemId: item.itemId || item.id,
        userId: userRevId,
        userName: userRevName,
        rating: rating,
        comment: feedback,
        createdAt: feedbackCreatedAt
      })).filter(r => Boolean(r.itemId));

      setReviews(prev => {
        // Remove previous auto-reviews for these items by same user if re-editing
        const filtered = prev.filter(r => !(
          r.userId === userRevId &&
          newItemReviews.some(nr => nr.itemId === r.itemId)
        ));
        const updated = [...newItemReviews, ...filtered];
        try {
          localStorage.setItem('canteengo_reviews', JSON.stringify(updated));
        } catch (e) {}
        return updated;
      });
    }

    showToast(`Cảm ơn bạn đã gửi phản hồi cho đơn hàng! ⭐${rating}/5`);
  };

  const handleSubmitReview = (newRev: Omit<ItemReview, 'id' | 'createdAt'>) => {
    const rev: ItemReview = {
      ...newRev,
      id: Date.now(),
      createdAt: new Date().toLocaleString('vi-VN')
    };
    setReviews(prev => {
      const updated = [rev, ...prev];
      try {
        localStorage.setItem('canteengo_reviews', JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });
    showToast(`Đã gửi đánh giá thành công!`);
  };

  // Admin Reply to Review
  const handleAdminReplyReview = (reviewId: number, replyComment: string) => {
    const repliedAt = new Date().toLocaleString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
    const repliedBy = currentUser?.fullName ? `${currentUser.fullName} (Quản trị viên)` : 'Ban Quản Trị Canteen';

    setReviews(prev => {
      const updated = prev.map(r => {
        if (r.id === reviewId) {
          return {
            ...r,
            adminReply: {
              comment: replyComment,
              repliedAt,
              repliedBy
            }
          };
        }
        return r;
      });
      try {
        localStorage.setItem('canteengo_reviews', JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });

    const targetRev = reviews.find(r => r.id === reviewId);
    const dish = menuItems.find(m => m.id === targetRev?.itemId);
    const newNotif: AppNotification = {
      id: `notif_reply_${reviewId}_${Date.now()}`,
      title: 'Phản hồi đánh giá từ Ban Quản Trị',
      message: `Canteen đã phản hồi đánh giá món "${dish?.name || 'món ăn'}" của bạn: "${replyComment.slice(0, 60)}..."`,
      createdAt: repliedAt,
      type: 'PROMO',
      userId: targetRev?.userId,
      isRead: false
    };
    setNotifications(prev => {
      const updated = [newNotif, ...prev];
      try {
        localStorage.setItem('canteengo_notifications', JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });

    showToast('Đã gửi phản hồi đánh giá thành công!');
  };

  const handleAdminDeleteReviewReply = (reviewId: number) => {
    setReviews(prev => {
      const updated = prev.map(r => {
        if (r.id === reviewId) {
          const { adminReply, ...rest } = r;
          return rest;
        }
        return r;
      });
      try {
        localStorage.setItem('canteengo_reviews', JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });
    showToast('Đã xóa phản hồi của quản trị viên.');
  };

  const handleAdminDeleteReview = (reviewId: number) => {
    setReviews(prev => {
      const updated = prev.filter(r => r.id !== reviewId);
      try {
        localStorage.setItem('canteengo_reviews', JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });
    showToast('Đã xóa đánh giá khỏi hệ thống.');
  };

  // Admin CRUD for Vouchers (US20 & Voucher Time Management)
  const handleAddVoucher = (newVoucher: Omit<Voucher, 'id'>) => {
    const nextId = vouchers.length > 0 ? Math.max(...vouchers.map(v => v.id), 0) + 1 : 1;
    const itemWithId: Voucher = { ...newVoucher, id: nextId };
    setVouchers(prev => {
      const updated = [itemWithId, ...prev];
      try {
        localStorage.setItem('canteengo_vouchers', JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });
    showToast(`Đã tạo mã voucher "${newVoucher.code}" thành công!`);
  };

  const handleUpdateVoucher = (updatedVoucher: Voucher) => {
    setVouchers(prev => {
      const updated = prev.map(v => v.id === updatedVoucher.id ? updatedVoucher : v);
      try {
        localStorage.setItem('canteengo_vouchers', JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });
    showToast(`Đã cập nhật voucher "${updatedVoucher.code}"`);
  };

  const handleDeleteVoucher = (voucherId: number) => {
    const target = vouchers.find(v => v.id === voucherId);
    setVouchers(prev => {
      const updated = prev.filter(v => v.id !== voucherId);
      try {
        localStorage.setItem('canteengo_vouchers', JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });
    showToast(`Đã xóa voucher "${target?.code || ''}"`);
  };

  // Admin CRUD for Menu (US10)
  const handleUpdateMenuItem = (updatedItem: MenuItem) => {
    setMenuItems(prev => prev.map(i => i.id === updatedItem.id ? updatedItem : i));
    showToast(`Đã cập nhật món "${updatedItem.name}"`);
  };

  const handleAddMenuItem = (newItem: Omit<MenuItem, 'id'>) => {
    const nextId = Math.max(...menuItems.map(i => i.id), 0) + 1;
    const itemWithId: MenuItem = { ...newItem, id: nextId };
    setMenuItems(prev => [...prev, itemWithId]);
    showToast(`Đã thêm món "${newItem.name}" vào thực đơn`);
  };

  const handleDeleteMenuItem = (id: number) => {
    setMenuItems(prev => prev.filter(i => i.id !== id));
    showToast('Đã xóa món ăn khỏi thực đơn');
  };

  const handleQuickRestock = (id: number, amount: number) => {
    setMenuItems(prev => prev.map(i => i.id === id ? { ...i, stock: i.stock + amount } : i));
    showToast(`Đã bổ sung thêm +${amount} suất cho món ăn`);
  };

  const totalCartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  const activeBgUrl = themeConfig.bgType === 'preset'
    ? themeConfig.bgPresetUrl
    : themeConfig.bgType === 'custom'
    ? themeConfig.bgCustomUrl
    : null;

  const modeClasses = 'bg-bg-primary text-text-primary';

  const isCustomer = !currentUser || currentUser.role === 'CUSTOMER' || currentUser.role === 'GUEST' || currentUser.role === 'TEACHER' || currentUser.role === 'STUDENT';
  const hasFloatingCart = isCustomer && cartItems.length > 0 && !isCartOpen;

  return (
    <div className={`min-h-screen flex flex-col font-sans relative transition-colors duration-300 ${modeClasses}`}>
      
      {/* Dynamic Background Wallpaper Backdrop (If Enabled) */}
      {activeBgUrl && (
        <div 
          className="fixed inset-0 pointer-events-none z-0 transition-all duration-500 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url('${activeBgUrl}')`,
            opacity: themeConfig.bgOpacity / 100,
            filter: `blur(${themeConfig.bgBlur}px)`
          }}
        />
      )}

      {/* Relative Content Container */}
      <div className="relative z-10 flex flex-col min-h-screen">

        {/* Top Notification Toast */}
        {toastMessage && (
          <div className="fixed top-20 right-4 z-50 bg-bg-card text-text-primary text-xs font-semibold px-4 py-2.5 rounded-xl shadow-[0_0_20px_rgba(232,184,75,0.2)] flex items-center gap-2 border border-[#E8B84B]/40 animate-in fade-in slide-in-from-top-2 duration-200">
            <Bell className="w-3.5 h-3.5 text-[#E8B84B]" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Top Discount Banner (Sự kiện giảm giá & Combo) */}
        <PromoBanner 
          vouchers={vouchers}
          onOpenComboModal={() => setIsComboModalOpen(true)}
          unreadNotificationCount={userUnreadCount}
          onOpenNotifications={() => setIsNotificationModalOpen(true)}
        />

        {/* Main Navbar with Manual Auth Triggers & Role-Based Links */}
        <Navbar
          activeTab={activeTab}
          setActiveTab={setActiveTab as any}
          currentUser={currentUser}
          onOpenLogin={() => {
            setAuthModalMode('LOGIN');
            setIsAuthModalOpen(true);
          }}
          onOpenRegister={() => {
            setAuthModalMode('REGISTER');
            setIsAuthModalOpen(true);
          }}
          onOpenProfile={() => {
            setAuthModalMode('PROFILE');
            setIsAuthModalOpen(true);
          }}
          cartCount={totalCartCount}
          onOpenCart={() => setIsCartOpen(true)}
          onOpenComboModal={() => setIsComboModalOpen(true)}
          onOpenWallet={() => setIsWalletOpen(true)}
          onOpenThemeCustomizer={() => setIsThemeModalOpen(true)}
          unreadNotificationCount={userUnreadCount}
          onOpenNotifications={() => setIsNotificationModalOpen(true)}
          onOpenStaffChat={() => setIsStaffChatModalOpen(true)}
          unreadStaffChatCount={unreadStaffChatCount}
          onOpenCounterDisplay={() => setIsCounterDisplayOpen(true)}
          onOpenLoyaltyModal={() => {
            if (!currentUser) {
              setAuthModalMode('LOGIN');
              setIsAuthModalOpen(true);
              showToast('Vui lòng đăng nhập để mở Kho Điểm & Hạng VIP C-Club!');
            } else {
              setIsLoyaltyModalOpen(true);
            }
          }}
          onBack={handleNavBack}
          pendingConfirmCount={
            orders.filter(o => o.payment?.status === 'pending_confirm').length +
            transactions.filter(t => t.status === 'pending_confirm' || t.status === 'pending').length
          }
        />

      {/* Main Content Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-10">
        
        {/* TAB 1: MENU (Accessible to everyone) */}
        {activeTab === 'menu' && (
          <MenuSection
            categories={categories}
            menuItems={menuItems}
            cartItems={cartItems}
            reviews={reviews}
            themeColor={themeConfig.color}
            favoriteItemIds={favoriteItemIds}
            onToggleFavorite={handleToggleFavorite}
            onAddToCart={handleAddToCart}
            onOpenComboModal={() => setIsComboModalOpen(true)}
            onViewItemDetail={(item, isFlash) => {
              setSelectedDetailItem(item);
              setSelectedDetailIsFlashSale(Boolean(isFlash));
            }}
            onOpenReviews={(item) => {
              setSelectedReviewItem(item);
              setIsReviewModalOpen(true);
            }}
          />
        )}

        {/* TAB 2: MY ORDERS (Customer US24) */}
        {activeTab === 'my_orders' && (
          <CustomerOrdersView
            orders={orders}
            currentUser={currentUser}
            onGoToMenu={() => setActiveTab('menu')}
            onOpenLogin={() => {
              setAuthModalMode('LOGIN');
              setIsAuthModalOpen(true);
            }}
            onSaveOrderFeedback={handleSaveOrderFeedback}
            onReviewItem={(itemId) => {
              const item = menuItems.find(m => m.id === itemId);
              if (item) {
                setSelectedReviewItem(item);
                setIsReviewModalOpen(true);
              }
            }}
            onNavigateToHistory={() => setActiveTab('order_history')}
            onCancelOrder={handleCustomerCancelOrder}
          />
        )}

        {/* TAB 2.5: CUSTOMER ORDER HISTORY & REVIEWS */}
        {activeTab === 'order_history' && (
          <CustomerOrderHistoryView
            orders={orders}
            currentUser={currentUser}
            menuItems={menuItems}
            reviews={reviews}
            onGoToMenu={() => setActiveTab('menu')}
            onOpenLogin={() => {
              setAuthModalMode('LOGIN');
              setIsAuthModalOpen(true);
            }}
            onReorder={handleReorderOrder}
            onSaveOrderFeedback={handleSaveOrderFeedback}
            onReviewItem={(itemId) => {
              const item = menuItems.find(m => m.id === itemId);
              if (item) {
                setSelectedReviewItem(item);
                setIsReviewModalOpen(true);
              }
            }}
            onNavigateToActiveOrders={() => setActiveTab('my_orders')}
            onCancelOrder={handleCustomerCancelOrder}
          />
        )}

        {/* TAB 3: STAFF KITCHEN ORDERS (Guarded by RoleGuard: STAFF or ADMIN only!) */}
        {activeTab === 'orders' && (
          <RoleGuard
            requiredRole="STAFF"
            currentUser={currentUser}
            onSwitchRole={handleQuickSwitchToRole}
            onGoHome={() => setActiveTab('menu')}
          >
            <StaffOrdersView
              orders={orders}
              onUpdateOrderStatus={handleUpdateOrderStatus}
              onRefreshOrders={() => showToast('Đã làm mới danh sách đơn hàng live!')}
            />
          </RoleGuard>
        )}

        {/* TAB 4: ADMIN DASHBOARD (Guarded by RoleGuard: ADMIN only!) */}
        {activeTab === 'admin' && (
          <RoleGuard
            requiredRole="ADMIN"
            currentUser={currentUser}
            onSwitchRole={handleQuickSwitchToRole}
            onGoHome={() => setActiveTab('menu')}
          >
            <AdminDashboardView
              menuItems={menuItems}
              categories={categories}
              orders={orders}
              users={usersList}
              reviews={reviews}
              vouchers={vouchers}
              onUpdateOrderStatus={handleUpdateOrderStatus}
              onUpdateMenuItem={handleUpdateMenuItem}
              onAddMenuItem={handleAddMenuItem}
              onDeleteMenuItem={handleDeleteMenuItem}
              onQuickRestock={handleQuickRestock}
              onAddStaff={handleAddUserByAdmin}
              onAddUser={handleAddUserByAdmin}
              onUpdateUser={handleUpdateUserByAdmin}
              onDeleteUser={handleDeleteUserByAdmin}
              onReplyReview={handleAdminReplyReview}
              onDeleteReviewReply={handleAdminDeleteReviewReply}
              onDeleteReview={handleAdminDeleteReview}
              onAddVoucher={handleAddVoucher}
              onUpdateVoucher={handleUpdateVoucher}
              onDeleteVoucher={handleDeleteVoucher}
              canteenStatusConfig={canteenStatusConfig}
              onOpenCanteenStatusSettings={() => setIsCanteenStatusModalOpen(true)}
            />
          </RoleGuard>
        )}

        {/* TAB 5: DATABASE SCHEMA (Strictly ADMIN ONLY!) */}
        {activeTab === 'database' && (
          <RoleGuard
            requiredRole="ADMIN"
            currentUser={currentUser}
            onSwitchRole={handleQuickSwitchToRole}
            onGoHome={() => setActiveTab('menu')}
          >
            <DatabaseSchemaView />
          </RoleGuard>
        )}

        {/* TAB 6: VÍ CỦA TÔI (CUSTOMER WALLET) */}
        {activeTab === 'wallet' && currentUser && (
          <WalletPage
            currentUser={currentUser}
            onUpdateUser={(updated) => {
              setCurrentUser(updated);
              setUsersList(prev => prev.map(u => u.id === updated.id ? updated : u));
            }}
            onAddTransaction={(newTx) => {
              setTransactions(prev => {
                const idx = prev.findIndex(t => t.id === newTx.id);
                if (idx >= 0) {
                  const updatedList = [...prev];
                  updatedList[idx] = newTx;
                  return updatedList;
                }
                return [newTx, ...prev];
              });
            }}
            showToast={showToast}
          />
        )}

        {/* TAB 7: XÁC NHẬN THANH TOÁN (STAFF / ADMIN) */}
        {activeTab === 'payment_confirm' && (
          <RoleGuard
            requiredRole="STAFF"
            currentUser={currentUser}
            onSwitchRole={handleQuickSwitchToRole}
            onGoHome={() => setActiveTab('menu')}
          >
            <PaymentConfirmPage
              currentUser={currentUser!}
              orders={orders}
              transactions={transactions}
              onUpdateOrder={(updatedOrder) => {
                setOrders(prev => prev.map(o => o.orderCode === updatedOrder.orderCode ? updatedOrder : o));
              }}
              onUpdateTransaction={(updatedTx) => {
                setTransactions(prev => prev.map(t => t.id === updatedTx.id ? updatedTx : t));
              }}
              showToast={showToast}
            />
          </RoleGuard>
        )}

      </main>

      {/* Modals & Drawers */}
      <ComboBuilderModal
        isOpen={isComboModalOpen}
        onClose={() => setIsComboModalOpen(false)}
        menuItems={menuItems}
        onAddComboToCart={handleAddComboToCart}
      />

      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cartItems}
        menuItems={menuItems}
        showToast={showToast}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveCartItem}
        onClearCart={handleClearCart}
        currentUser={currentUser}
        vouchers={vouchers}
        statusConfig={canteenStatusConfig}
        onCreateOrder={handleCreateOrder}
        onOpenWallet={() => setIsWalletOpen(true)}
        onRequestLogin={() => {
          setAuthModalMode('LOGIN');
          setIsAuthModalOpen(true);
        }}
      />

      <ItemDetailModal
        item={selectedDetailItem}
        isFlashSale={selectedDetailIsFlashSale}
        cartItems={cartItems}
        reviews={reviews}
        favoriteItemIds={favoriteItemIds}
        onToggleFavorite={handleToggleFavorite}
        onClose={() => {
          setSelectedDetailItem(null);
          setSelectedDetailIsFlashSale(false);
        }}
        onAddToCart={(item, qty, note, isFlash) => handleAddToCart(item, qty, note, isFlash ?? selectedDetailIsFlashSale)}
        onOpenReviews={(item) => {
          setSelectedDetailItem(null);
          setSelectedDetailIsFlashSale(false);
          setSelectedReviewItem(item);
          setIsReviewModalOpen(true);
        }}
      />

      <ReviewModal
        isOpen={isReviewModalOpen}
        onClose={() => setIsReviewModalOpen(false)}
        item={selectedReviewItem}
        reviews={reviews}
        currentUser={currentUser}
        onSubmitReview={handleSubmitReview}
        onOpenLogin={() => {
          setIsReviewModalOpen(false);
          setAuthModalMode('LOGIN');
          setIsAuthModalOpen(true);
        }}
        onReplyReview={handleAdminReplyReview}
        onDeleteReplyReview={handleAdminDeleteReviewReply}
      />

      {/* Realistic Auth Modal (Manual Login / Register / Profile) */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        currentUser={currentUser}
        usersList={usersList}
        onLogin={handleLogin}
        onRegister={handleRegister}
        onLogout={handleLogout}
        onUpdateProfile={handleUpdateProfile}
        onOpenWallet={() => setIsWalletOpen(true)}
        initialMode={authModalMode}
      />

      {/* C-Pay Wallet Deposit Modal */}
      <WalletModal
        isOpen={isWalletOpen}
        onClose={() => setIsWalletOpen(false)}
        currentUser={currentUser}
        onDeposit={handleDepositWallet}
      />

      {/* Theme & Background Wallpaper Customizer Modal */}
      <ThemeCustomizerModal
        isOpen={isThemeModalOpen}
        onClose={() => setIsThemeModalOpen(false)}
        themeConfig={themeConfig}
        onUpdateTheme={handleUpdateTheme}
        onResetTheme={handleResetTheme}
      />

      {/* Inbox Notification Modal */}
      <NotificationModal
        isOpen={isNotificationModalOpen}
        onClose={() => setIsNotificationModalOpen(false)}
        currentUser={currentUser}
        setActiveTab={setActiveTab}
      />

      {/* Floating Bottom Cart Bar (Appears when adding items) */}
      <FloatingBottomCartBar
        cartItems={cartItems}
        onOpenCart={() => setIsCartOpen(true)}
        isVisible={hasFloatingCart}
        showScrollTop={showScrollTop}
        onScrollToTop={handleScrollToTop}
      />

      {/* Customer Floating Live Chat Widget (Only visible to Customers & Guests) */}
      {isCustomer && (
        <CustomerChatWidget
          chatMessages={chatMessages}
          currentUser={currentUser}
          onSendMessage={handleSendCustomerChatMessage}
          onOpenLogin={() => {
            setAuthModalMode('LOGIN');
            setIsAuthModalOpen(true);
            showToast('🔒 Vui lòng đăng nhập hoặc đăng ký tài khoản để nhắn tin trực tiếp với CanteenGo!');
          }}
          onMarkMessagesAsRead={handleMarkChatAsReadByCustomer}
          hasFloatingCart={hasFloatingCart}
          showScrollTop={showScrollTop}
        />
      )}

      {/* Staff & Admin Customer Service Chat Inbox Modal */}
      <StaffChatModal
        isOpen={isStaffChatModalOpen}
        onClose={() => setIsStaffChatModalOpen(false)}
        chatMessages={chatMessages}
        currentUser={currentUser}
        onSendStaffMessage={handleSendStaffChatMessage}
        onMarkAsReadByStaff={handleMarkChatAsReadByStaff}
      />

      {/* Public TV Counter Order Board (KDS) */}
      <CounterDisplayModal
        isOpen={isCounterDisplayOpen}
        onClose={() => setIsCounterDisplayOpen(false)}
        orders={orders}
      />

      {/* Loyalty Points & VIP Member Tier Modal */}
      <LoyaltyPointsModal
        isOpen={isLoyaltyModalOpen}
        onClose={() => setIsLoyaltyModalOpen(false)}
        currentUser={currentUser}
        onRedeemToWallet={handleRedeemToWallet}
        onRedeemVoucher={handleRedeemVoucher}
      />

      {/* Rich Footer with Address, Phone Hotline, Google Map & Canteen Introduction */}
      <FooterSection
        onNavigateTab={(tab) => setActiveTab(tab as any)}
        currentUser={currentUser}
        statusConfig={canteenStatusConfig}
        onToggleOpenStatus={handleToggleCanteenOpen}
        onOpenStatusSettings={() => setIsCanteenStatusModalOpen(true)}
      />

      {/* Canteen Status & Opening Hours Configuration Modal */}
      <CanteenStatusModal
        isOpen={isCanteenStatusModalOpen}
        onClose={() => setIsCanteenStatusModalOpen(false)}
        config={canteenStatusConfig}
        onSaveConfig={handleSaveCanteenStatusConfig}
      />

      </div>
    </div>
  );
}
