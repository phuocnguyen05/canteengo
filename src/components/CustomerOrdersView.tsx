import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
  ShoppingBag, 
  Clock, 
  MapPin, 
  CheckCircle2, 
  AlertCircle, 
  Flame, 
  Utensils, 
  Calendar,
  Layers,
  ArrowRight,
  LogIn,
  UserCheck,
  Star,
  MessageSquare,
  Send,
  ThumbsUp,
  Edit3,
  History,
  X,
  XCircle
} from 'lucide-react';
import { Order, OrderStatus, User } from '../types';
import { formatOrderDisplayDateTime, normalizeTimeString24h } from '../utils/orderTimeHelper';
import { PaymentBadge } from './PaymentBadge';
import { getOrderById } from '../services/orderService';

interface CustomerOrdersViewProps {
  orders: Order[];
  currentUser: User | null;
  onGoToMenu: () => void;
  onOpenLogin?: () => void;
  onReviewItem?: (itemId: number) => void;
  onSaveOrderFeedback?: (orderId: number, rating: number, feedback: string) => void;
  onNavigateToHistory?: () => void;
  onCancelOrder?: (order: Order, reason: string) => Promise<void> | void;
}

export const CustomerOrdersView: React.FC<CustomerOrdersViewProps> = ({
  orders,
  currentUser,
  onGoToMenu,
  onOpenLogin,
  onReviewItem,
  onSaveOrderFeedback,
  onNavigateToHistory,
  onCancelOrder
}) => {
  const [activeFeedbackOrderId, setActiveFeedbackOrderId] = useState<number | null>(null);
  const [rating, setRating] = useState<number>(5);
  const [feedbackText, setFeedbackText] = useState<string>('');

  // Selected Order modal state
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  useEffect(() => {
    (window as any).openOrderModal = (order: Order) => setSelectedOrder(order);
    return () => {
      delete (window as any).openOrderModal;
    };
  }, []);

  const [searchParams] = useSearchParams();

  useEffect(() => {
    const orderId = searchParams.get("orderId");
    if (!orderId) return;

    const found = orders.find(o => String(o.id) === String(orderId) || String(o.orderCode) === String(orderId));
    if (found) {
      setSelectedOrder(found);
    } else {
      getOrderById(orderId).then(order => {
        if (order) setSelectedOrder(order);
      });
    }
  }, [searchParams, orders]);

  // Cancel order modal state
  const [cancelModalOrder, setCancelModalOrder] = useState<Order | null>(null);
  const [cancelReasonPreset, setCancelReasonPreset] = useState<string>('Đổi ý không muốn mua nữa');
  const [customCancelReason, setCustomCancelReason] = useState<string>('');

  // Helper to format order date and time in unified 24h format: e.g. "17:51:37 - 15/09/2026"
  const getFormattedOrderDateTime = React.useCallback((order: Order) => {
    return formatOrderDisplayDateTime(order.createdAt, order.orderDate);
  }, []);

  // Chỉ tài khoản nào đặt thì tài khoản đó mới xem được món của mình
  const myOrders = currentUser
    ? orders.filter(o => 
        (o.userId && o.userId === currentUser.id) || 
        (o.phone && o.phone === currentUser.phone) ||
        (o.receiverName && o.receiverName === currentUser.fullName)
      )
    : [];

  const getStatusDisplay = (status: OrderStatus) => {
    switch (status) {
      case 'PENDING':
        return {
          label: 'Chờ Bếp duyệt',
          color: 'bg-[#E8B84B]/20 text-[#E8B84B] border-[#E8B84B]/40',
          desc: 'Bếp đang kiểm tra nguyên liệu và xếp hàng nấu',
          step: 1
        };
      case 'PROCESSING':
        return {
          label: 'Đang nấu / Ra khay',
          color: 'bg-orange-500/20 text-orange-400 border-orange-500/40',
          desc: 'Đầu bếp đang thực hiện món ăn cho bạn',
          step: 2
        };
      case 'READY':
        return {
          label: 'Món đã sẵn sàng nhận!',
          color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40 animate-pulse',
          desc: 'Mời bạn tới quầy nhận khay ăn nóng hổi',
          step: 3
        };
      case 'DELIVERED':
        return {
          label: 'Đã hoàn thành',
          color: 'bg-blue-500/20 text-blue-400 border-blue-500/40',
          desc: 'Chúc bạn có một bữa ăn ngon miệng!',
          step: 4
        };
      case 'CANCELLED':
        return {
          label: 'Đã hủy đơn',
          color: 'bg-rose-500/20 text-rose-400 border-rose-500/40',
          desc: 'Đơn hàng không thể thực hiện và đã hoàn lại tồn kho',
          step: 0
        };
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      
      {/* Header */}
      <div className="bg-bg-card rounded-3xl border border-border-base p-5 shadow-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-[#E8B84B] text-black flex items-center justify-center shadow-md font-bold">
              <ShoppingBag className="w-5 h-5 fill-black" />
            </div>
            <div>
              <h1 className="text-xl font-extrabold text-text-primary font-serif">Đơn Hàng Của Tôi</h1>
              <p className="text-xs text-text-secondary">
                Theo dõi tiến độ ra khay tại Bếp Canteen theo thời gian thực
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-center flex-wrap">
          {onNavigateToHistory && (
            <button
              onClick={onNavigateToHistory}
              className="px-3.5 py-2 rounded-xl bg-[#E8B84B]/15 hover:bg-[#E8B84B]/25 text-[#E8B84B] text-xs font-bold flex items-center gap-1.5 transition-all border border-[#E8B84B]/30 cursor-pointer"
            >
              <History className="w-4 h-4 text-[#E8B84B]" />
              <span>Xem Lịch sử & Đánh giá</span>
            </button>
          )}

          <button
            onClick={onGoToMenu}
            className="px-4 py-2 rounded-xl bg-[#E8B84B] hover:bg-[#F4C95D] text-black text-xs font-extrabold flex items-center gap-1.5 shadow-md shadow-[#E8B84B]/20 transition-all cursor-pointer"
          >
            <span>Đặt thêm món</span>
            <ArrowRight className="w-3.5 h-3.5 stroke-[3]" />
          </button>
        </div>
      </div>

      {/* Orders List */}
      {!currentUser ? (
        <div className="text-center py-16 bg-bg-card rounded-3xl border border-border-base p-8 shadow-2xl">
          <div className="w-16 h-16 rounded-2xl bg-[#E8B84B]/20 text-[#E8B84B] flex items-center justify-center mx-auto mb-4 border border-[#E8B84B]/30">
            <LogIn className="w-8 h-8" />
          </div>
          <h3 className="font-extrabold text-text-primary text-lg font-serif">Đăng nhập để xem thông tin món của bạn</h3>
          <p className="text-sm text-text-secondary mt-1.5 max-w-md mx-auto">
            Vui lòng đăng nhập tài khoản của bạn để theo dõi tiến độ các đơn đã đặt, thời gian ra khay và nhận món tại quầy.
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
      ) : myOrders.length === 0 ? (
        <div className="text-center py-16 bg-bg-card rounded-3xl border border-dashed border-border-base p-8">
          <div className="w-16 h-16 rounded-full bg-[#E8B84B]/20 text-[#E8B84B] flex items-center justify-center mx-auto mb-3">
            <ShoppingBag className="w-8 h-8" />
          </div>
          <h3 className="font-extrabold text-text-primary text-base font-serif">Bạn chưa có đơn đặt món nào</h3>
          <p className="text-xs text-text-secondary mt-1 max-w-sm mx-auto">
            Tài khoản <strong className="text-text-primary">{currentUser.fullName}</strong> chưa có lịch sử đặt món hôm nay. Hãy khám phá thực đơn đa dạng nhé!
          </p>
          <button
            onClick={onGoToMenu}
            className="mt-4 px-5 py-2.5 rounded-xl bg-[#E8B84B] hover:bg-[#F4C95D] text-black font-extrabold text-xs shadow-md shadow-[#E8B84B]/20 transition-all cursor-pointer"
          >
            Xem thực đơn ngay
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {myOrders.map((order) => {
            const statusInfo = getStatusDisplay(order.status);

            return (
              <div
                key={order.id}
                className="bg-bg-card rounded-3xl border border-border-base overflow-hidden shadow-2xl hover:border-[#E8B84B]/40 transition-all"
              >
                {/* Header of Order Card */}
                <div className="p-4 sm:p-5 border-b border-border-base flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-bg-input">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <span className="font-mono text-sm font-black text-[#E8B84B] bg-[#E8B84B]/10 px-2.5 py-0.5 rounded-lg border border-[#E8B84B]/30">
                        {order.orderCode}
                      </span>
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${statusInfo.color}`}>
                        {statusInfo.label}
                      </span>
                      <span className="text-xs text-text-secondary">
                        Đặt lúc: {getFormattedOrderDateTime(order)}
                      </span>
                    </div>
                    <p className="text-xs text-text-secondary font-medium">
                      {statusInfo.desc}
                    </p>
                  </div>

                  <div className="text-right sm:text-right space-y-1">
                    <div className="text-lg font-black text-[#E8B84B] font-serif">
                      {order.finalAmount.toLocaleString('vi-VN')}₫
                    </div>
                    <div>
                      <PaymentBadge status={order.payment?.status || (order.paymentStatus === 'PAID' ? 'paid' : 'unpaid')} size="sm" />
                    </div>
                  </div>
                </div>

                {/* Progress Stepper (Timeline) */}
                {order.status !== 'CANCELLED' && (
                  <div className="px-4 sm:px-6 py-4 bg-bg-primary border-b border-border-base">
                    <div className="grid grid-cols-4 gap-2 text-center">
                      
                      <div className="flex flex-col items-center">
                        <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold mb-1 ${
                          statusInfo.step >= 1 ? 'bg-[#E8B84B] text-black font-extrabold' : 'bg-bg-input text-text-secondary'
                        }`}>
                          1
                        </div>
                        <span className="text-[11px] font-semibold text-text-secondary">Tiếp nhận</span>
                      </div>

                      <div className="flex flex-col items-center">
                        <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold mb-1 ${
                          statusInfo.step >= 2 ? 'bg-orange-500 text-white font-extrabold' : 'bg-bg-input text-text-secondary'
                        }`}>
                          2
                        </div>
                        <span className="text-[11px] font-semibold text-text-secondary">Đang nấu</span>
                      </div>

                      <div className="flex flex-col items-center">
                        <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold mb-1 ${
                          statusInfo.step >= 3 ? 'bg-emerald-500 text-black font-extrabold ring-4 ring-emerald-500/20' : 'bg-bg-input text-text-secondary'
                        }`}>
                          3
                        </div>
                        <span className="text-[11px] font-semibold text-text-secondary">Sẵn sàng</span>
                      </div>

                      <div className="flex flex-col items-center">
                        <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold mb-1 ${
                          statusInfo.step >= 4 ? 'bg-blue-500 text-white font-extrabold' : 'bg-bg-input text-text-secondary'
                        }`}>
                          4
                        </div>
                        <span className="text-[11px] font-semibold text-text-secondary">Đã nhận khay</span>
                      </div>

                    </div>
                  </div>
                )}

                {/* Pickup details */}
                <div className="p-4 sm:p-5 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-bg-card">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-[#E8B84B] flex-shrink-0" />
                    <span className="text-text-secondary">Khu vực nhận món: <strong className="text-text-primary">{order.pickupArea}</strong></span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-[#E8B84B] flex-shrink-0" />
                    <span className="text-text-secondary">Khung giờ lấy khay: <strong className="text-text-primary">{normalizeTimeString24h(order.pickupTime)}</strong></span>
                  </div>

                  {/* Dish Completion Time */}
                  {(order.status === 'READY' || order.status === 'DELIVERED') ? (
                    <div className="flex items-center gap-2 sm:col-span-2 bg-emerald-950/40 text-emerald-300 border border-emerald-500/30 p-2.5 rounded-xl font-medium">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                      <span>Thời gian hoàn thành món: <strong className="text-emerald-300 font-bold">{normalizeTimeString24h(order.completedAt || order.pickupTime)}</strong></span>
                    </div>
                  ) : order.status === 'PROCESSING' ? (
                    <div className="flex items-center gap-2 sm:col-span-2 bg-orange-950/40 text-orange-300 border border-orange-500/30 p-2.5 rounded-xl font-medium justify-between flex-wrap">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-orange-400 flex-shrink-0 animate-pulse" />
                        <span>Thời gian dự kiến hoàn thành món: <strong className="font-bold">{normalizeTimeString24h(order.estimatedCompletionTime || order.pickupTime)}</strong></span>
                      </div>
                      <span className="text-[11px] text-text-secondary italic">ℹ️ Bếp đang chế biến, liên hệ quầy canteen nếu muốn hủy.</span>
                    </div>
                  ) : order.status === 'PENDING' ? (
                    <div className="flex items-center justify-between sm:col-span-2 bg-bg-input border border-border-base p-2.5 rounded-xl flex-wrap gap-2">
                      <span className="text-xs text-text-secondary">Đơn hàng đang chờ Bếp tiếp nhận. Bạn có thể hủy đơn nếu muốn.</span>
                      <button
                        type="button"
                        onClick={() => {
                          setCancelModalOrder(order);
                          setCancelReasonPreset('Đổi ý không muốn mua nữa');
                          setCustomCancelReason('');
                        }}
                        className="px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-extrabold text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-md"
                      >
                        <X className="w-4 h-4" />
                        <span>Hủy đơn</span>
                      </button>
                    </div>
                  ) : null}
                </div>

                {/* Items in order */}
                <div className="p-4 sm:p-5 border-t border-border-base space-y-2 bg-bg-card">
                  <div className="text-[11px] font-bold text-text-secondary uppercase tracking-wider">
                    Các món trong đơn:
                  </div>
                  <div className="space-y-1.5">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between text-xs py-1.5 border-b border-border-base last:border-0">
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

                  {/* Order Feedback & Rating Section (For DELIVERED orders) */}
                  {order.status === 'DELIVERED' && (
                    <div className="mt-4 pt-4 border-t border-border-base">
                      {order.feedback && activeFeedbackOrderId !== order.id ? (
                        /* Existing Submitted Feedback View */
                        <div className="bg-[#E8B84B]/10 border border-[#E8B84B]/30 rounded-2xl p-3.5 space-y-2">
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
                              <span className="text-xs font-extrabold text-[#E8B84B] ml-1">
                                ({order.rating || 5}/5)
                              </span>
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

                          <p className="text-xs text-text-primary font-medium italic bg-bg-primary p-2.5 rounded-xl border border-border-base">
                            "{order.feedback}"
                          </p>

                          {order.feedbackCreatedAt && (
                            <div className="text-[10px] text-text-secondary text-right">
                              Gửi lúc: {order.feedbackCreatedAt}
                            </div>
                          )}
                        </div>
                      ) : activeFeedbackOrderId === order.id || !order.feedback ? (
                        /* Feedback Form */
                        <div className="bg-bg-input border border-border-base rounded-2xl p-4 space-y-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <MessageSquare className="w-4 h-4 text-[#E8B84B]" />
                              <h4 className="text-xs font-extrabold text-text-primary">
                                {order.feedback ? 'Chỉnh sửa phản hồi đơn hàng' : 'Đánh giá & Gửi phản hồi món ăn'}
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
                            <label className="block text-[11px] font-bold text-text-secondary mb-1.5">
                              Mức độ hài lòng của bạn:
                            </label>
                            <div className="flex items-center gap-1.5">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                  key={star}
                                  type="button"
                                  onClick={() => setRating(star)}
                                  className={`p-1.5 rounded-xl border transition-all cursor-pointer ${
                                    star <= rating
                                      ? 'bg-[#E8B84B]/20 border-[#E8B84B] text-[#E8B84B] scale-105'
                                      : 'bg-bg-primary border-border-base text-text-secondary hover:border-[#E8B84B]/40'
                                  }`}
                                  title={`${star} sao`}
                                >
                                  <Star
                                    className={`w-5 h-5 ${
                                      star <= rating ? 'fill-[#E8B84B] text-[#E8B84B]' : 'text-border-base'
                                    }`}
                                  />
                                </button>
                              ))}
                              <span className="text-xs font-extrabold text-[#E8B84B] ml-2">
                                {rating === 5 && '😍 Tuyệt vời!'}
                                {rating === 4 && '😊 Rất ngon!'}
                                {rating === 3 && '😐 Bình thường'}
                                {rating === 2 && '🙁 Cần cải thiện'}
                                {rating === 1 && '😞 Không hài lòng'}
                              </span>
                            </div>
                          </div>

                          {/* Feedback Text Area */}
                          <div>
                            <textarea
                              value={feedbackText}
                              onChange={(e) => setFeedbackText(e.target.value)}
                              placeholder="Nhập ý kiến đóng góp về hương vị món, độ nóng hổi hay thái độ phục vụ tại Canteen..."
                              rows={2}
                              className="w-full text-xs p-2.5 rounded-xl border border-border-base bg-bg-primary focus:outline-none focus:border-[#E8B84B] text-text-primary placeholder:text-text-secondary/50 resize-none"
                            />
                          </div>

                          {/* Submit button */}
                          <div className="flex justify-end">
                            <button
                              type="button"
                              onClick={() => {
                                if (onSaveOrderFeedback) {
                                  onSaveOrderFeedback(order.id, rating, feedbackText.trim() || 'Cảm ơn món ăn ngon!');
                                  setActiveFeedbackOrderId(null);
                                }
                              }}
                              className="px-4 py-2 rounded-xl bg-[#E8B84B] hover:bg-[#F4C95D] text-black font-extrabold text-xs flex items-center gap-1.5 shadow-md shadow-[#E8B84B]/20 transition-all active:scale-95 cursor-pointer"
                            >
                              <Send className="w-3.5 h-3.5" />
                              <span>Gửi đánh giá</span>
                            </button>
                          </div>
                        </div>
                      ) : null}
                    </div>
                  )}
                </div>

              </div>
            );
          })}
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

      {/* Selected Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
          <div className="bg-[#141414] border border-[#E8B84B]/30 rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            
            {/* Header */}
            <div className="flex justify-between items-center p-4 border-b border-[#2A2A2A]">
              <h2 className="text-white font-bold text-lg">
                📋 Chi tiết đơn #{selectedOrder.id || selectedOrder.orderCode}
              </h2>
              <button 
                onClick={() => setSelectedOrder(null)}
                className="text-gray-400 hover:text-white cursor-pointer p-1 rounded-lg hover:bg-white/5"
              >
                ✕
              </button>
            </div>
            
            {/* Body */}
            <div className="p-4 space-y-4">
              
              {/* Badges */}
              <div className="flex gap-2 items-center flex-wrap">
                <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusDisplay(selectedOrder.status).color}`}>
                  {getStatusDisplay(selectedOrder.status).label}
                </span>
                <PaymentBadge payment={selectedOrder.payment} />
              </div>
              
              {/* Thông tin khách */}
              <div className="bg-white/5 p-3 rounded-xl border border-white/10">
                <div className="text-white font-bold">
                  {selectedOrder.customerName || selectedOrder.receiverName || currentUser?.fullName || 'Khách hàng'}
                </div>
                <div className="text-gray-400 text-sm">
                  📞 {selectedOrder.customerPhone || selectedOrder.phone || currentUser?.phone || 'N/A'}
                </div>
              </div>
              
              {/* Địa điểm + giờ */}
              <div className="text-sm space-y-1 text-gray-300">
                <div>📍 Khu vực: {selectedOrder.location || 'Tại quầy'}</div>
                <div>🕐 Giờ nhận: {selectedOrder.pickupTime || 'Ngay'}</div>
                <div>📅 Ngày tạo: {getFormattedOrderDateTime(selectedOrder)}</div>
              </div>
              
              {/* Món ăn */}
              <div>
                <div className="text-gray-400 text-sm mb-2 font-bold">
                  MÓN ĂN:
                </div>
                <div className="space-y-1.5">
                  {(selectedOrder.items || []).map((item, i) => (
                    <div key={i} className="flex justify-between text-white text-sm py-1.5 border-b border-[#2A2A2A] last:border-0">
                      <span>{item.qty}x {item.name} {item.selectedVariant ? `(${item.selectedVariant.name})` : ''}</span>
                      <span className="text-[#E8B84B] font-semibold">
                        {((item.price || 0) * (item.qty || 1)).toLocaleString('vi-VN')}đ
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Tổng */}
              <div className="flex justify-between pt-3 border-t border-[#2A2A2A]">
                <span className="text-white font-bold">Tổng thanh toán:</span>
                <span className="text-[#E8B84B] font-bold text-lg">
                  {(selectedOrder.finalAmount || selectedOrder.total || 0).toLocaleString('vi-VN')}đ
                </span>
              </div>
              
              {/* Timeline */}
              <div className="pt-3 border-t border-[#2A2A2A]">
                <div className="text-gray-400 text-sm mb-2 font-bold">
                  TIMELINE TRẠNG THÁI:
                </div>
                <div className="space-y-2 text-xs text-gray-300">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
                    <span>Đã tạo đơn thành công: {getFormattedOrderDateTime(selectedOrder)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`w-2.5 h-2.5 rounded-full ${selectedOrder.status !== 'PENDING' ? 'bg-emerald-400' : 'bg-amber-400 animate-pulse'}`}></span>
                    <span>Trạng thái hiện tại: <strong>{getStatusDisplay(selectedOrder.status).label}</strong></span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Footer */}
            <div className="p-4 border-t border-[#2A2A2A] flex gap-2">
              {selectedOrder.status === 'DELIVERED' && (
                <button 
                  onClick={() => {
                    setSelectedOrder(null);
                    if (onNavigateToHistory) onNavigateToHistory();
                  }}
                  className="flex-1 bg-[#E8B84B] text-black font-bold py-2.5 rounded-xl cursor-pointer hover:bg-[#d4a53e] transition-colors"
                >
                  Đánh giá món
                </button>
              )}
              <button 
                onClick={() => setSelectedOrder(null)}
                className="flex-1 border border-[#E8B84B]/30 text-[#E8B84B] font-bold py-2.5 rounded-xl cursor-pointer hover:bg-[#E8B84B]/10 transition-colors"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
