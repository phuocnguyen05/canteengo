import React, { useState, useMemo } from 'react';
import { 
  History, 
  ShoppingBag, 
  Clock, 
  MapPin, 
  CheckCircle2, 
  XCircle, 
  Star, 
  MessageSquare, 
  RotateCcw, 
  Send, 
  Search, 
  Filter, 
  LogIn, 
  ThumbsUp, 
  Edit3, 
  Utensils, 
  Calendar, 
  DollarSign, 
  Award,
  ChevronRight,
  Sparkles,
  ShoppingBasket,
  ShieldCheck,
  X,
  AlertCircle
} from 'lucide-react';
import { Order, OrderStatus, User, MenuItem, ItemReview } from '../types';
import { formatOrderDisplayDateTime, normalizeTimeString24h } from '../utils/orderTimeHelper';
import { PaymentBadge } from './PaymentBadge';

interface CustomerOrderHistoryViewProps {
  orders: Order[];
  currentUser: User | null;
  menuItems: MenuItem[];
  reviews?: ItemReview[];
  onGoToMenu: () => void;
  onOpenLogin?: () => void;
  onReorder?: (order: Order) => void;
  onSaveOrderFeedback?: (orderId: number, rating: number, feedback: string) => void;
  onReviewItem?: (itemId: number) => void;
  onNavigateToActiveOrders?: () => void;
  onCancelOrder?: (order: Order, reason: string) => Promise<void> | void;
}

export const CustomerOrderHistoryView: React.FC<CustomerOrderHistoryViewProps> = ({
  orders,
  currentUser,
  menuItems,
  reviews = [],
  onGoToMenu,
  onOpenLogin,
  onReorder,
  onSaveOrderFeedback,
  onReviewItem,
  onNavigateToActiveOrders,
  onCancelOrder
}) => {
  const [activeTab, setActiveTab] = useState<'ALL_ORDERS' | 'PURCHASED_ITEMS' | 'MY_REVIEWS'>('ALL_ORDERS');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'DELIVERED' | 'CANCELLED' | 'UNREVIEWED'>('ALL');

  const [activeFeedbackOrderId, setActiveFeedbackOrderId] = useState<number | null>(null);
  const [rating, setRating] = useState<number>(5);
  const [feedbackText, setFeedbackText] = useState<string>('');

  // Cancel modal state
  const [cancelModalOrder, setCancelModalOrder] = useState<Order | null>(null);
  const [cancelReasonPreset, setCancelReasonPreset] = useState<string>('Đổi ý không muốn mua nữa');
  const [customCancelReason, setCustomCancelReason] = useState<string>('');

  // Format order date & time in unified 24h format: e.g. "17:51:37 - 15/09/2026"
  const getFormattedOrderDateTime = React.useCallback((order: Order) => {
    return formatOrderDisplayDateTime(order.createdAt, order.orderDate);
  }, []);

  // Filter ONLY orders belonging to current logged-in customer account
  const myOrders = useMemo(() => {
    if (!currentUser) return [];
    return orders.filter(o => 
      (o.userId && o.userId === currentUser.id) || 
      (o.phone && o.phone === currentUser.phone) ||
      (o.receiverName && o.receiverName === currentUser.fullName)
    );
  }, [orders, currentUser]);

  // Statistics calculation for this user
  const userStats = useMemo(() => {
    const totalOrders = myOrders.length;
    const completedOrders = myOrders.filter(o => o.status === 'DELIVERED');
    const totalSpent = completedOrders.reduce((sum, o) => sum + o.finalAmount, 0);
    const reviewedOrdersCount = completedOrders.filter(o => o.feedback).length;

    // Aggregate item counts
    const itemMap = new Map<string, { itemName: string; itemId?: number; count: number; totalSpent: number; image?: string }>();
    myOrders.forEach(o => {
      o.items.forEach(item => {
        const key = item.itemName;
        const matchedMenu = menuItems.find(m => m.name.toLowerCase() === item.itemName.toLowerCase() || m.id === item.itemId);
        const existing = itemMap.get(key) || { 
          itemName: item.itemName, 
          itemId: item.itemId || matchedMenu?.id, 
          count: 0, 
          totalSpent: 0, 
          image: matchedMenu?.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&auto=format&fit=crop&q=80' 
        };
        existing.count += item.quantity;
        existing.totalSpent += item.unitPrice * item.quantity;
        itemMap.set(key, existing);
      });
    });

    const purchasedItemList = Array.from(itemMap.values()).sort((a, b) => b.count - a.count);
    const favoriteDish = purchasedItemList.length > 0 ? purchasedItemList[0].itemName : 'Chưa có';

    return {
      totalOrders,
      completedOrdersCount: completedOrders.length,
      totalSpent,
      reviewedOrdersCount,
      favoriteDish,
      purchasedItemList
    };
  }, [myOrders, menuItems]);

  // Filtered orders list based on user search & status filter
  const filteredOrders = useMemo(() => {
    return myOrders.filter(order => {
      // Status filter
      if (statusFilter === 'DELIVERED' && order.status !== 'DELIVERED') return false;
      if (statusFilter === 'CANCELLED' && order.status !== 'CANCELLED') return false;
      if (statusFilter === 'UNREVIEWED' && (order.status !== 'DELIVERED' || order.feedback)) return false;

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const codeMatch = order.orderCode.toLowerCase().includes(q);
        const itemMatch = order.items.some(i => i.itemName.toLowerCase().includes(q));
        const areaMatch = order.pickupArea.toLowerCase().includes(q);
        if (!codeMatch && !itemMatch && !areaMatch) return false;
      }

      return true;
    });
  }, [myOrders, statusFilter, searchQuery]);

  if (!currentUser) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-center py-16 bg-bg-card rounded-3xl border border-border-base p-8 shadow-2xl">
          <div className="w-16 h-16 rounded-2xl bg-[#E8B84B]/20 text-[#E8B84B] flex items-center justify-center mx-auto mb-4 border border-[#E8B84B]/30">
            <LogIn className="w-8 h-8 text-[#E8B84B]" />
          </div>
          <h3 className="font-extrabold text-text-primary text-lg font-serif">Đăng nhập để xem lịch sử đặt món của riêng bạn</h3>
          <p className="text-sm text-text-secondary mt-1.5 max-w-md mx-auto">
            Vui lòng đăng nhập tài khoản của bạn để tra cứu lịch sử các bữa ăn đã đặt, xem đánh giá món ăn và đặt lại nhanh các món ngon khoái khẩu!
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            {onOpenLogin && (
              <button
                onClick={onOpenLogin}
                className="px-5 py-2.5 rounded-xl bg-[#E8B84B] hover:bg-[#F4C95D] text-black font-extrabold text-xs shadow-md shadow-[#E8B84B]/20 transition-all flex items-center gap-2 cursor-pointer"
              >
                <LogIn className="w-4 h-4" />
                <span>Đăng nhập ngay</span>
              </button>
            )}
            <button
              onClick={onGoToMenu}
              className="px-5 py-2.5 rounded-xl bg-bg-input hover:bg-bg-elevated text-text-primary font-bold text-xs transition-all border border-border-base cursor-pointer"
            >
              Xem thực đơn Canteen
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto text-text-primary">
      
      {/* Header Banner */}
      <div className="bg-bg-card rounded-3xl border border-border-base p-5 shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-[#E8B84B] text-black flex items-center justify-center shadow-lg shadow-[#E8B84B]/20 flex-shrink-0 font-bold">
            <History className="w-6 h-6 stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl font-black text-text-primary font-serif tracking-tight">Lịch Sử Đặt Món & Đánh Giá</h1>
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-[#E8B84B]/20 text-[#E8B84B] border border-[#E8B84B]/40">
                Tài khoản: {currentUser.fullName}
              </span>
            </div>
            <p className="text-xs text-text-secondary mt-0.5 font-medium">
              Theo dõi danh sách món ăn bạn đã từng đặt, nhật ký dinh dưỡng và gửi phản hồi trải nghiệm
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start md:self-center">
          {onNavigateToActiveOrders && (
            <button
              onClick={onNavigateToActiveOrders}
              className="px-3.5 py-2 rounded-xl bg-bg-input hover:bg-bg-elevated text-text-primary text-xs font-bold flex items-center gap-1.5 transition-all border border-border-base cursor-pointer"
            >
              <ShoppingBag className="w-4 h-4 text-[#E8B84B]" />
              <span>Đơn đang phục vụ</span>
            </button>
          )}

          <button
            onClick={onGoToMenu}
            className="px-4 py-2 rounded-xl bg-[#E8B84B] hover:bg-[#F4C95D] text-black text-xs font-extrabold flex items-center gap-1.5 shadow-md shadow-[#E8B84B]/20 transition-all cursor-pointer"
          >
            <Utensils className="w-3.5 h-3.5" />
            <span>Đặt món mới</span>
          </button>
        </div>
      </div>

      {/* Account Personal Analytics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-bg-card rounded-2xl border border-border-base p-4 shadow-lg">
          <div className="flex items-center gap-2 text-text-secondary text-xs font-bold mb-1">
            <ShoppingBag className="w-4 h-4 text-[#E8B84B]" />
            <span>Tổng đơn đã đặt</span>
          </div>
          <div className="text-2xl font-serif font-black text-text-primary">{userStats.totalOrders} <span className="text-xs font-bold text-text-secondary">đơn</span></div>
          <div className="text-[11px] text-text-secondary mt-0.5 font-medium">Hoàn thành: {userStats.completedOrdersCount} đơn</div>
        </div>

        <div className="bg-bg-card rounded-2xl border border-border-base p-4 shadow-lg">
          <div className="flex items-center gap-2 text-text-secondary text-xs font-bold mb-1">
            <DollarSign className="w-4 h-4 text-emerald-400" />
            <span>Tổng chi tiêu Canteen</span>
          </div>
          <div className="text-2xl font-serif font-black text-[#E8B84B]">{userStats.totalSpent.toLocaleString('vi-VN')}₫</div>
          <div className="text-[11px] text-text-secondary mt-0.5 font-medium">Tích lũy từ các bữa ăn</div>
        </div>

        <div className="bg-bg-card rounded-2xl border border-border-base p-4 shadow-lg">
          <div className="flex items-center gap-2 text-text-secondary text-xs font-bold mb-1">
            <Award className="w-4 h-4 text-amber-400" />
            <span>Món khoái khẩu nhất</span>
          </div>
          <div className="text-sm font-black text-text-primary truncate font-serif" title={userStats.favoriteDish}>
            {userStats.favoriteDish}
          </div>
          <div className="text-[11px] text-text-secondary mt-0.5 font-medium">Dựa trên tần suất mua</div>
        </div>

        <div className="bg-bg-card rounded-2xl border border-border-base p-4 shadow-lg">
          <div className="flex items-center gap-2 text-text-secondary text-xs font-bold mb-1">
            <Star className="w-4 h-4 text-purple-400 fill-purple-400" />
            <span>Đã đánh giá</span>
          </div>
          <div className="text-2xl font-serif font-black text-purple-300">{userStats.reviewedOrdersCount} <span className="text-xs font-bold text-text-secondary">đơn</span></div>
          <div className="text-[11px] text-text-secondary mt-0.5 font-medium">Phản hồi chất lượng món</div>
        </div>
      </div>

      {/* Primary Sub-Navigation Tabs */}
      <div className="bg-bg-card rounded-2xl border border-border-base p-2 shadow-lg flex items-center justify-between gap-2 overflow-x-auto no-scrollbar">
        <div className="flex items-center gap-2 text-xs font-extrabold">
          <button
            onClick={() => setActiveTab('ALL_ORDERS')}
            className={`px-4 py-2.5 rounded-xl transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'ALL_ORDERS'
                ? 'bg-[#E8B84B] text-black font-extrabold shadow-md'
                : 'bg-bg-primary text-text-secondary hover:text-text-primary border border-border-base'
            }`}
          >
            <History className="w-4 h-4 text-black" />
            <span>Toàn bộ lịch sử đơn ({myOrders.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('PURCHASED_ITEMS')}
            className={`px-4 py-2.5 rounded-xl transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'PURCHASED_ITEMS'
                ? 'bg-[#E8B84B] text-black font-extrabold shadow-md'
                : 'bg-bg-primary text-text-secondary hover:text-text-primary border border-border-base'
            }`}
          >
            <ShoppingBasket className="w-4 h-4" />
            <span>Danh mục món đã mua ({userStats.purchasedItemList.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('MY_REVIEWS')}
            className={`px-4 py-2.5 rounded-xl transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'MY_REVIEWS'
                ? 'bg-[#E8B84B] text-black font-extrabold shadow-md'
                : 'bg-bg-primary text-text-secondary hover:text-text-primary border border-border-base'
            }`}
          >
            <Star className="w-4 h-4" />
            <span>Đánh giá của tôi ({userStats.reviewedOrdersCount})</span>
          </button>
        </div>
      </div>

      {/* TAB CONTENT 1: ALL ORDERS HISTORY */}
      {activeTab === 'ALL_ORDERS' && (
        <div className="space-y-4">
          
          {/* Search & Filter Controls */}
          <div className="bg-bg-card rounded-2xl border border-border-base p-3.5 shadow-lg flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-text-secondary absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm mã đơn (#CTG), tên món..."
                className="w-full text-xs pl-9 pr-3 py-2 rounded-xl border border-border-base bg-bg-primary text-text-primary focus:outline-none focus:border-[#E8B84B] placeholder:text-text-secondary/60 font-medium"
              />
            </div>

            <div className="flex items-center gap-1.5 text-xs overflow-x-auto no-scrollbar w-full sm:w-auto">
              <span className="text-text-secondary font-bold flex items-center gap-1 mr-1 text-[11px] flex-shrink-0">
                <Filter className="w-3.5 h-3.5 text-[#E8B84B]" /> Lọc:
              </span>
              <button
                onClick={() => setStatusFilter('ALL')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer whitespace-nowrap ${
                  statusFilter === 'ALL'
                    ? 'bg-[#E8B84B] text-black font-extrabold'
                    : 'bg-bg-primary text-text-secondary hover:text-text-primary border border-border-base'
                }`}
              >
                Tất cả
              </button>
              <button
                onClick={() => setStatusFilter('DELIVERED')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer whitespace-nowrap ${
                  statusFilter === 'DELIVERED'
                    ? 'bg-blue-600 text-white font-extrabold'
                    : 'bg-bg-primary text-text-secondary hover:text-text-primary border border-border-base'
                }`}
              >
                Đã nhận món
              </button>
              <button
                onClick={() => setStatusFilter('UNREVIEWED')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer whitespace-nowrap ${
                  statusFilter === 'UNREVIEWED'
                    ? 'bg-purple-600 text-white font-extrabold'
                    : 'bg-bg-primary text-text-secondary hover:text-text-primary border border-border-base'
                }`}
              >
                Chưa đánh giá
              </button>
              <button
                onClick={() => setStatusFilter('CANCELLED')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer whitespace-nowrap ${
                  statusFilter === 'CANCELLED'
                    ? 'bg-rose-600 text-white font-extrabold'
                    : 'bg-bg-primary text-text-secondary hover:text-text-primary border border-border-base'
                }`}
              >
                Đã hủy
              </button>
            </div>
          </div>

          {/* Orders List Rendering */}
          {filteredOrders.length === 0 ? (
            <div className="text-center py-16 bg-bg-card rounded-2xl border border-dashed border-border-base p-8 shadow-2xl">
              <div className="w-14 h-14 rounded-full bg-bg-input text-text-secondary flex items-center justify-center mx-auto mb-3">
                <History className="w-7 h-7" />
              </div>
              <h3 className="font-extrabold text-text-primary text-base font-serif">Không tìm thấy lịch sử phù hợp</h3>
              <p className="text-xs text-text-secondary mt-1 max-w-sm mx-auto">
                Thử thay đổi từ khóa tìm kiếm hoặc bỏ chọn các bộ lọc trạng thái.
              </p>
            </div>
          ) : (
            filteredOrders.map((order) => (
              <div
                key={order.id}
                className="bg-bg-card rounded-2xl border border-border-base overflow-hidden shadow-2xl hover:border-[#E8B84B]/40 transition-all"
              >
                {/* Header */}
                <div className="p-4 sm:p-5 border-b border-border-base flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-bg-input">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <span className="font-mono text-xs font-black text-[#E8B84B] bg-bg-primary px-2.5 py-0.5 rounded-lg border border-[#E8B84B]/30">
                        {order.orderCode}
                      </span>
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-extrabold border ${
                        order.status === 'DELIVERED'
                          ? 'bg-blue-500/20 text-blue-400 border-blue-500/40'
                          : order.status === 'CANCELLED'
                          ? 'bg-rose-500/20 text-rose-400 border-rose-500/40'
                          : order.status === 'READY'
                          ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                          : 'bg-[#E8B84B]/20 text-[#E8B84B] border-[#E8B84B]/40'
                      }`}>
                        {order.status === 'DELIVERED' ? 'Đã hoàn thành' : order.status === 'CANCELLED' ? 'Đã hủy đơn' : 'Đang xử lý'}
                      </span>
                      <PaymentBadge status={order.payment?.status || (order.paymentStatus === 'PAID' ? 'paid' : 'unpaid')} size="sm" />
                      <span className="text-xs text-text-secondary font-medium">
                        {getFormattedOrderDateTime(order)}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 text-xs text-text-secondary pt-1 flex-wrap">
                      <span>Giờ hẹn lấy: <strong className="text-text-primary">{normalizeTimeString24h(order.pickupTime)}</strong></span>
                      {(order.status === 'READY' || order.status === 'DELIVERED') && (
                        <span>• Hoàn thành món lúc: <strong className="text-emerald-400 font-bold">{normalizeTimeString24h(order.completedAt || order.pickupTime)}</strong></span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 justify-between sm:justify-end">
                    <div className="text-right">
                      <div className="text-base font-black text-[#E8B84B] font-serif">
                        {order.finalAmount.toLocaleString('vi-VN')}₫
                      </div>
                      <div className="text-[11px] text-text-secondary font-medium">
                        {order.paymentMethod === 'COD' ? 'Tiền mặt' : 'Ví C-Pay / QR'}
                      </div>
                    </div>

                    {/* Cancel button if PENDING */}
                    {order.status === 'PENDING' && (
                      <button
                        type="button"
                        onClick={() => {
                          setCancelModalOrder(order);
                          setCancelReasonPreset('Đổi ý không muốn mua nữa');
                          setCustomCancelReason('');
                        }}
                        className="px-3 py-1.5 rounded-xl bg-rose-600/90 hover:bg-rose-600 text-white font-extrabold text-xs flex items-center gap-1 transition-all shadow-md cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" />
                        <span>Hủy đơn</span>
                      </button>
                    )}

                    {/* Quick Re-order button */}
                    {onReorder && order.status !== 'PENDING' && (
                      <button
                        type="button"
                        onClick={() => onReorder(order)}
                        className="px-3 py-1.5 rounded-xl bg-[#E8B84B]/15 hover:bg-[#E8B84B]/25 text-[#E8B84B] font-extrabold text-xs flex items-center gap-1 transition-all border border-[#E8B84B]/30 cursor-pointer"
                        title="Đặt lại toàn bộ các món trong đơn này"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Đặt lại đơn</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Items in order */}
                <div className="p-4 sm:p-5 space-y-2 bg-bg-card">
                  <div className="text-[11px] font-bold text-text-secondary uppercase tracking-wider">
                    Các món ăn trong bữa ăn này:
                  </div>
                  <div className="space-y-1.5">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between text-xs py-1 border-b border-border-base last:border-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-text-primary">{item.quantity}x {item.itemName}</span>
                          {item.isCombo && (
                            <span className="text-[10px] bg-[#E8B84B]/20 text-[#E8B84B] font-bold px-1.5 py-0.2 rounded border border-[#E8B84B]/30">
                              Combo
                            </span>
                          )}
                          {order.status === 'DELIVERED' && item.itemId && onReviewItem && (
                            <button
                              type="button"
                              onClick={() => onReviewItem(item.itemId!)}
                              className="inline-flex items-center gap-1 text-[10px] font-bold text-[#E8B84B] hover:text-[#F4C95D] bg-[#E8B84B]/10 px-2 py-0.5 rounded transition-colors border border-[#E8B84B]/30 cursor-pointer"
                            >
                              <Star className="w-2.5 h-2.5 fill-[#E8B84B] text-[#E8B84B]" />
                              <span>Đánh giá món</span>
                            </button>
                          )}
                        </div>
                        <span className="font-semibold text-[#E8B84B]">
                          {(item.unitPrice * item.quantity).toLocaleString('vi-VN')}₫
                        </span>
                      </div>
                    ))}
                  </div>

                  {order.status === 'CANCELLED' && order.cancelReason && (
                    <div className="p-2.5 rounded-xl bg-rose-950/40 border border-rose-500/30 text-rose-300 text-xs">
                      <strong>Lý do hủy đơn:</strong> {order.cancelReason}
                    </div>
                  )}

                  {/* Order Feedback & Rating Section */}
                  {order.status === 'DELIVERED' && (
                    <div className="mt-3 pt-3 border-t border-border-base">
                      {order.feedback && activeFeedbackOrderId !== order.id ? (
                        <div className="bg-[#E8B84B]/10 border border-[#E8B84B]/30 rounded-xl p-3 space-y-1.5">
                          <div className="flex items-center justify-between flex-wrap gap-2">
                            <div className="flex items-center gap-1.5">
                              <ThumbsUp className="w-4 h-4 text-[#E8B84B]" />
                              <span className="text-xs font-extrabold text-[#E8B84B]">
                                Đánh giá của bạn:
                              </span>
                              <div className="flex items-center gap-0.5 ml-1">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <Star
                                    key={star}
                                    className={`w-3.5 h-3.5 ${
                                      star <= (order.rating || 5)
                                        ? 'text-[#E8B84B] fill-[#E8B84B]'
                                        : 'text-border-base'
                                    }`}
                                  />
                                ))}
                              </div>
                            </div>

                            <button
                              type="button"
                              onClick={() => {
                                setActiveFeedbackOrderId(order.id);
                                setRating(order.rating || 5);
                                setFeedbackText(order.feedback || '');
                              }}
                              className="text-[11px] font-bold text-[#E8B84B] hover:underline flex items-center gap-1 cursor-pointer"
                            >
                              <Edit3 className="w-3 h-3" />
                              <span>Sửa đánh giá</span>
                            </button>
                          </div>

                          <p className="text-xs text-text-primary font-medium italic bg-bg-primary p-2.5 rounded-lg border border-border-base">
                            "{order.feedback}"
                          </p>

                          {/* Admin response if available */}
                          {(() => {
                            const matchedReview = reviews.find(
                              (r) =>
                                r.userId === currentUser?.id &&
                                order.items.some((it) => it.itemId === r.itemId) &&
                                r.adminReply
                            );
                            if (!matchedReview?.adminReply) return null;
                            return (
                              <div className="p-3 rounded-xl bg-purple-950/40 border border-purple-500/30 text-xs space-y-1 mt-2 text-left not-italic">
                                <div className="flex items-center justify-between">
                                  <span className="font-bold text-purple-300 flex items-center gap-1.5">
                                    <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />
                                    {matchedReview.adminReply.repliedBy || 'Ban Quản Trị Canteen'}
                                  </span>
                                  <span className="text-[10px] text-purple-400 font-medium">
                                    {matchedReview.adminReply.repliedAt}
                                  </span>
                                </div>
                                <p className="text-purple-200 font-medium pl-5 border-l-2 border-purple-500">
                                  {matchedReview.adminReply.comment}
                                </p>
                              </div>
                            );
                          })()}
                        </div>
                      ) : activeFeedbackOrderId === order.id || !order.feedback ? (
                        <div className="bg-bg-input border border-border-base rounded-xl p-3.5 space-y-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <MessageSquare className="w-4 h-4 text-[#E8B84B]" />
                              <h4 className="text-xs font-extrabold text-text-primary">
                                {order.feedback ? 'Chỉnh sửa phản hồi đơn hàng' : 'Gửi đánh giá & Phản hồi cho bữa ăn này'}
                              </h4>
                            </div>
                            {order.feedback && (
                              <button
                                type="button"
                                onClick={() => setActiveFeedbackOrderId(null)}
                                className="text-[11px] font-bold text-text-secondary hover:text-text-primary cursor-pointer"
                              >
                                Hủy
                              </button>
                            )}
                          </div>

                          {/* Star Rating Select */}
                          <div>
                            <div className="flex items-center gap-1.5">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                  key={star}
                                  type="button"
                                  onClick={() => setRating(star)}
                                  className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
                                    star <= rating
                                      ? 'bg-[#E8B84B]/20 border-[#E8B84B] text-[#E8B84B] scale-105'
                                      : 'bg-bg-primary border-border-base text-text-secondary hover:border-[#E8B84B]/40'
                                  }`}
                                >
                                  <Star
                                    className={`w-4 h-4 ${
                                      star <= rating ? 'fill-[#E8B84B] text-[#E8B84B]' : 'text-border-base'
                                    }`}
                                  />
                                </button>
                              ))}
                            </div>
                          </div>

                          {/* Feedback Text Area */}
                          <textarea
                            value={feedbackText}
                            onChange={(e) => setFeedbackText(e.target.value)}
                            placeholder="Nhập cảm nhận của bạn về độ ngon, vừa vị, độ nóng hổi hay thái độ phục vụ..."
                            rows={2}
                            className="w-full text-xs p-2.5 rounded-lg border border-border-base bg-bg-primary text-text-primary focus:outline-none focus:border-[#E8B84B] placeholder:text-text-secondary/50 resize-none"
                          />

                          <div className="flex justify-end">
                            <button
                              type="button"
                              onClick={() => {
                                if (onSaveOrderFeedback) {
                                  onSaveOrderFeedback(order.id, rating, feedbackText.trim() || 'Cảm ơn món ăn rất ngon!');
                                  setActiveFeedbackOrderId(null);
                                }
                              }}
                              className="px-4 py-1.5 rounded-lg bg-[#E8B84B] hover:bg-[#F4C95D] text-black font-extrabold text-xs flex items-center gap-1.5 shadow-md shadow-[#E8B84B]/20 transition-all cursor-pointer"
                            >
                              <Send className="w-3.5 h-3.5" />
                              <span>Lưu phản hồi</span>
                            </button>
                          </div>
                        </div>
                      ) : null}
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* TAB CONTENT 2: PURCHASED ITEMS CATALOG */}
      {activeTab === 'PURCHASED_ITEMS' && (
        <div className="space-y-4">
          <div className="bg-bg-card rounded-2xl border border-border-base p-4 shadow-lg">
            <h3 className="text-sm font-extrabold text-text-primary font-serif mb-1">Thống kê các món ăn bạn đã chọn mua</h3>
            <p className="text-xs text-text-secondary">Danh sách tổng hợp các món bạn đã thưởng thức từ Canteen với số lần đặt lại nhiều nhất</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {userStats.purchasedItemList.map((item, idx) => {
              const menuDish = menuItems.find(m => m.id === item.itemId || m.name.toLowerCase() === item.itemName.toLowerCase());

              return (
                <div key={idx} className="bg-bg-card rounded-2xl border border-border-base overflow-hidden p-4 flex gap-3 shadow-lg hover:border-[#E8B84B]/40 transition-all">
                  <img
                    src={item.image}
                    alt={item.itemName}
                    className="w-16 h-16 rounded-xl object-cover border border-border-base flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-extrabold text-text-primary truncate font-serif" title={item.itemName}>
                      {item.itemName}
                    </h4>
                    <div className="text-[11px] font-bold text-[#E8B84B] mt-0.5">
                      Đã mua: {item.count} lần
                    </div>
                    <div className="text-[11px] text-text-secondary">
                      Tổng tiền: {item.totalSpent.toLocaleString('vi-VN')}₫
                    </div>

                    {menuDish && (
                      <button
                        onClick={() => onGoToMenu()}
                        className="mt-2 text-[10px] font-extrabold text-[#E8B84B] hover:underline bg-[#E8B84B]/10 px-2 py-1 rounded-lg inline-flex items-center gap-1 border border-[#E8B84B]/30 cursor-pointer"
                      >
                        <span>Đặt món này ngay</span>
                        <ChevronRight className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB CONTENT 3: MY REVIEWS */}
      {activeTab === 'MY_REVIEWS' && (
        <div className="space-y-4">
          {myOrders.filter(o => o.feedback).length === 0 ? (
            <div className="text-center py-16 bg-bg-card rounded-2xl border border-dashed border-border-base p-8 shadow-2xl">
              <div className="w-12 h-12 rounded-full bg-[#E8B84B]/20 text-[#E8B84B] flex items-center justify-center mx-auto mb-3">
                <Star className="w-6 h-6 fill-[#E8B84B]" />
              </div>
              <h3 className="font-extrabold text-text-primary text-base font-serif">Bạn chưa gửi đánh giá nào</h3>
              <p className="text-xs text-text-secondary mt-1 max-w-sm mx-auto">
                Sau khi nhận món hoàn thành tại quầy, hãy gửi đánh giá để giúp bếp Canteen ngày càng hoàn thiện nhé!
              </p>
            </div>
          ) : (
            myOrders.filter(o => o.feedback).map(order => (
              <div key={order.id} className="bg-bg-card rounded-2xl border border-border-base p-4 shadow-lg space-y-2">
                <div className="flex items-center justify-between border-b border-border-base pb-2">
                  <span className="font-mono text-xs font-bold text-[#E8B84B]">Đơn #{order.orderCode}</span>
                  <div className="flex items-center gap-0.5">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`w-3.5 h-3.5 ${
                          star <= (order.rating || 5) ? 'text-[#E8B84B] fill-[#E8B84B]' : 'text-border-base'
                        }`}
                      />
                    ))}
                    <span className="text-xs font-bold text-text-primary ml-1">({order.rating || 5}/5)</span>
                  </div>
                </div>

                <p className="text-xs text-text-primary font-medium italic bg-bg-primary p-3 rounded-xl border border-border-base">
                  "{order.feedback}"
                </p>

                {/* Admin response if available */}
                {(() => {
                  const matchedReview = reviews.find(
                    (r) =>
                      r.userId === currentUser?.id &&
                      order.items.some((it) => it.itemId === r.itemId) &&
                      r.adminReply
                  );
                  if (!matchedReview?.adminReply) return null;
                  return (
                    <div className="p-3 rounded-xl bg-purple-950/40 border border-purple-500/30 text-xs space-y-1 mt-1.5 text-left not-italic">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-purple-300 flex items-center gap-1.5">
                          <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />
                          {matchedReview.adminReply.repliedBy || 'Ban Quản Trị Canteen'}
                        </span>
                        <span className="text-[10px] text-purple-400 font-medium">
                          {matchedReview.adminReply.repliedAt}
                        </span>
                      </div>
                      <p className="text-purple-200 font-medium pl-5 border-l-2 border-purple-500">
                        {matchedReview.adminReply.comment}
                      </p>
                    </div>
                  );
                })()}

                <div className="text-[10px] text-text-secondary text-right">
                  Đơn hàng gồm: {order.items.map(i => `${i.quantity}x ${i.itemName}`).join(', ')}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Cancel Order Modal */}
      {cancelModalOrder && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
          <div className="relative w-full max-w-md bg-bg-card border border-border-base rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-border-base pb-3">
              <h3 className="text-base font-serif font-bold text-text-primary flex items-center gap-2">
                <XCircle className="w-5 h-5 text-rose-500" />
                Hủy Đơn Hàng #{cancelModalOrder.orderCode}
              </h3>
              <button
                onClick={() => setCancelModalOrder(null)}
                className="p-1 rounded-full text-text-secondary hover:text-text-primary hover:bg-bg-input cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Refund notice if paid */}
            {(cancelModalOrder.payment?.status === 'paid' || cancelModalOrder.paymentStatus === 'PAID') && (
              <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-3 text-xs text-amber-300 space-y-1">
                <div className="font-bold text-amber-400 flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4" />
                  Thông báo hoàn tiền tự động:
                </div>
                <p>
                  ⚠️ Đơn hàng đã thanh toán. Khi xác nhận hủy, số tiền <strong className="text-amber-300 font-bold">{cancelModalOrder.finalAmount.toLocaleString('vi-VN')}đ</strong> sẽ được <strong>HOÀN TỰ ĐỘNG VÀO VÍ C-PAY</strong> của bạn ngay lập tức!
                </p>
              </div>
            )}

            <div>
              <label className="text-xs font-semibold text-text-secondary block mb-2">
                Vui lòng chọn hoặc nhập lý do hủy đơn:
              </label>
              <div className="space-y-2">
                {[
                  'Đổi ý không muốn mua nữa',
                  'Đặt nhầm món / nhầm số lượng',
                  'Thời gian chờ lâu quá',
                  'Khác...'
                ].map((reasonOption) => (
                  <label
                    key={reasonOption}
                    className={`flex items-center gap-2.5 p-2.5 rounded-xl border text-xs cursor-pointer transition-all ${
                      cancelReasonPreset === reasonOption
                        ? 'bg-[#E8B84B]/10 border-[#E8B84B] text-text-primary font-bold'
                        : 'bg-bg-input border-border-base text-text-secondary hover:bg-bg-elevated'
                    }`}
                  >
                    <input
                      type="radio"
                      name="cancelReason"
                      value={reasonOption}
                      checked={cancelReasonPreset === reasonOption}
                      onChange={() => setCancelReasonPreset(reasonOption)}
                      className="accent-[#E8B84B]"
                    />
                    <span>{reasonOption}</span>
                  </label>
                ))}
              </div>

              {cancelReasonPreset === 'Khác...' && (
                <textarea
                  value={customCancelReason}
                  onChange={(e) => setCustomCancelReason(e.target.value)}
                  placeholder="Nhập lý do hủy chi tiết..."
                  rows={2}
                  className="w-full mt-2.5 text-xs p-2.5 rounded-xl border border-border-base bg-bg-primary text-text-primary focus:outline-none focus:border-[#E8B84B] resize-none"
                />
              )}
            </div>

            <div className="pt-2 flex gap-3">
              <button
                type="button"
                onClick={() => setCancelModalOrder(null)}
                className="flex-1 py-2.5 rounded-xl border border-border-base bg-bg-input text-text-secondary font-medium hover:text-text-primary transition-colors text-xs cursor-pointer"
              >
                Giữ lại đơn
              </button>
              <button
                type="button"
                onClick={async () => {
                  const finalReason = cancelReasonPreset === 'Khác...' ? (customCancelReason.trim() || 'Hủy đơn hàng') : cancelReasonPreset;
                  if (onCancelOrder) {
                    await onCancelOrder(cancelModalOrder, finalReason);
                  }
                  setCancelModalOrder(null);
                }}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-extrabold text-xs flex items-center justify-center gap-1.5 shadow-md cursor-pointer"
              >
                <XCircle className="w-4 h-4" />
                Xác nhận hủy đơn
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
