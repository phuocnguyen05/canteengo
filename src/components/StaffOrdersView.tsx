import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
  ClipboardList, 
  Clock, 
  Check, 
  X, 
  CheckCheck, 
  RefreshCw, 
  Phone, 
  MapPin, 
  Search,
  Star,
  Printer,
  CheckCircle2,
  Info
} from 'lucide-react';
import { Order, OrderStatus } from '../types';
import { OrderPrintModal } from './OrderPrintModal';
import { PaymentBadge } from './PaymentBadge';
import { formatOrderDisplayDateTime, normalizeTimeString24h } from '../utils/orderTimeHelper';

const getActor = (actor?: string | null): string => {
  switch (actor) {
    case 'customer': return 'Khách hàng';
    case 'staff': return 'Nhân viên';
    case 'admin': return 'Quản lý';
    default: return 'Hệ thống';
  }
};

const formatTimelineDateTime = (timeVal?: number | string | null, dateFallback?: string): string => {
  if (!timeVal) return 'Chưa có thông tin';

  if (typeof timeVal === 'number') {
    const d = new Date(timeVal);
    if (!isNaN(d.getTime())) {
      const h = String(d.getHours()).padStart(2, '0');
      const m = String(d.getMinutes()).padStart(2, '0');
      const s = String(d.getSeconds()).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const year = d.getFullYear();
      return `${h}:${m}:${s} - ${day}/${month}/${year}`;
    }
  }

  if (typeof timeVal === 'string') {
    const num = Number(timeVal);
    if (!isNaN(num) && num > 100000000000) {
      return formatTimelineDateTime(num, dateFallback);
    }
    return formatOrderDisplayDateTime(timeVal, dateFallback);
  }

  return String(timeVal);
};

interface TimelineItem {
  label: string;
  time?: number | string | null;
  sub?: string | null;
  color: 'green' | 'red' | 'gray';
}

const OrderTimeline: React.FC<{ order: Order }> = ({ order }) => {
  const isPaid = order.payment?.status === 'paid' || order.paymentStatus === 'PAID';
  const isCancelled = order.status === 'CANCELLED' || Boolean(order.cancel) || Boolean(order.cancelReason);

  const cookingStarted = Boolean(order.cookingAt) || order.status === 'PROCESSING' || order.status === 'READY' || order.status === 'DELIVERED';
  const readyCompleted = Boolean(order.readyAt || order.completedAt) || order.status === 'READY' || order.status === 'DELIVERED';
  const deliveredDone = Boolean(order.doneAt) || order.status === 'DELIVERED';

  const cookingTime = order.cookingAt || (cookingStarted ? order.createdAt : null);
  const readyTime = order.readyAt || order.completedAt || (readyCompleted ? (order.completedAt || order.pickupTime) : null);
  const doneTime = order.doneAt || (deliveredDone ? (order.completedAt || order.pickupTime) : null);

  const baseEvents: Array<TimelineItem | false> = [
    {
      label: 'Đặt đơn',
      time: order.createdAt,
      color: 'green',
    },
    {
      label: 'Xác nhận thanh toán',
      time: order.payment?.confirmedAt || (isPaid ? (order.payment?.createdAt || order.createdAt) : null),
      sub: isPaid
        ? `Bởi: ${order.payment?.confirmedByName || (order.payment?.confirmedBy === 'admin' ? 'Quản lý' : order.payment?.confirmedBy === 'staff' ? 'Nhân viên' : 'Hệ thống')}`
        : 'Chưa xác nhận thanh toán',
      color: isPaid ? 'green' : 'gray',
    },
    {
      label: 'Bắt đầu nấu',
      time: cookingStarted ? cookingTime : null,
      color: cookingStarted ? 'green' : 'gray',
    },
    {
      label: 'Hoàn thành món',
      time: readyCompleted ? readyTime : null,
      color: readyCompleted ? 'green' : 'gray',
    },
    {
      label: 'Giao đơn thành công',
      time: deliveredDone ? doneTime : null,
      color: deliveredDone ? 'green' : 'gray',
    },
    isCancelled && {
      label: 'Hủy đơn',
      time: order.cancel?.cancelledAt || order.createdAt,
      sub: `Lý do: ${order.cancel?.reason || order.cancelReason || 'Hủy đơn'}\nBởi: ${getActor(order.cancel?.cancelledBy)}`,
      color: 'red',
    }
  ];

  let events = baseEvents.filter(Boolean) as TimelineItem[];

  // If order is cancelled, filter out steps that never happened
  if (isCancelled) {
    events = events.filter(e => e.color !== 'gray');
  }

  return (
    <div className="space-y-0">
      {events.map((event, i) => {
        const isLast = i === events.length - 1;
        return (
          <div key={i} className="flex gap-3 relative">
            {/* Cột trái: chấm tròn màu */}
            <div className="flex flex-col items-center">
              <div
                className={`w-3 h-3 rounded-full mt-1.5 flex-shrink-0 transition-all ${
                  event.color === 'green'
                    ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)] ring-2 ring-emerald-500/20'
                    : event.color === 'red'
                    ? 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.6)] ring-2 ring-rose-500/20'
                    : 'bg-zinc-600'
                }`}
              />
              {!isLast && (
                <div
                  className={`w-0.5 flex-1 my-1 border-l-2 ${
                    event.color === 'green' && events[i + 1]?.color === 'green'
                      ? 'border-emerald-500/40'
                      : 'border-border-base'
                  }`}
                />
              )}
            </div>

            {/* Cột phải: text */}
            <div className={`flex-1 ${isLast ? 'pb-1' : 'pb-5'}`}>
              <div
                className={`font-bold text-xs sm:text-sm ${
                  event.color === 'gray' ? 'text-zinc-500' : 'text-text-primary'
                }`}
              >
                {event.label}
              </div>
              <div
                className={`text-xs mt-0.5 font-mono ${
                  event.color === 'gray' ? 'text-zinc-500' : 'text-zinc-400'
                }`}
              >
                {event.time ? formatTimelineDateTime(event.time, order.orderDate) : 'Chưa có thông tin'}
              </div>
              {event.sub && (
                <div className="text-[11px] text-zinc-400 mt-1 whitespace-pre-line bg-bg-primary border border-border-base rounded-lg px-2.5 py-1.5">
                  {event.sub}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

interface StaffOrdersViewProps {
  orders: Order[];
  onUpdateOrderStatus: (orderId: number, newStatus: OrderStatus, note?: string) => void;
  onRefreshOrders?: () => void;
}

export const StaffOrdersView: React.FC<StaffOrdersViewProps> = ({
  orders,
  onUpdateOrderStatus,
  onRefreshOrders,
}) => {
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [countdown, setCountdown] = useState(30);
  const [rejectOrderId, setRejectOrderId] = useState<number | null>(null);
  const [rejectReason, setRejectReason] = useState('Hết nguyên liệu tại bếp');
  const [selectedOrderForPrint, setSelectedOrderForPrint] = useState<Order | null>(null);
  const [infoModal, setInfoModal] = useState<Order | null>(null);

  // Auto refresh timer (US21: 30s auto-refresh)
  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(() => {
      setCountdown((prev) => (prev <= 1 ? 0 : prev - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, [autoRefresh]);

  useEffect(() => {
    if (countdown === 0) {
      if (onRefreshOrders) onRefreshOrders();
      setCountdown(30);
    }
  }, [countdown, onRefreshOrders]);

  const [searchParams] = useSearchParams();

  useEffect(() => {
    const orderId = searchParams.get("orderId");
    if (!orderId) return;
    
    setTimeout(() => {
      const el = document.getElementById(`order-${orderId}`);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
        el.classList.add("highlight-pulse");
        
        setTimeout(() => {
          el.classList.remove("highlight-pulse");
        }, 3000);
      }
    }, 300);
  }, [searchParams]);

  const filteredOrders = orders.filter((order) => {
    if (selectedStatus !== 'ALL' && order.status !== selectedStatus) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        order.orderCode.toLowerCase().includes(q) ||
        order.receiverName.toLowerCase().includes(q) ||
        order.phone.includes(q) ||
        order.pickupArea.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'PENDING':
        return <span className="px-2.5 py-1 rounded-lg text-xs font-extrabold bg-[#E8B84B]/20 text-[#E8B84B] border border-[#E8B84B]/40">Chờ duyệt</span>;
      case 'PROCESSING':
        return <span className="px-2.5 py-1 rounded-lg text-xs font-extrabold bg-orange-950/60 text-orange-400 border border-orange-500/50">Đang nấu</span>;
      case 'READY':
        return <span className="px-2.5 py-1 rounded-lg text-xs font-extrabold bg-blue-950/60 text-blue-400 border border-blue-500/50">Sẵn sàng nhận</span>;
      case 'DELIVERED':
        return <span className="px-2.5 py-1 rounded-lg text-xs font-extrabold bg-emerald-950/60 text-emerald-400 border border-emerald-500/50">Đã giao</span>;
      case 'CANCELLED':
        return <span className="px-2.5 py-1 rounded-lg text-xs font-extrabold bg-rose-950/60 text-rose-400 border border-rose-500/50">Đã hủy</span>;
    }
  };

  const handleConfirmReject = () => {
    if (rejectOrderId !== null) {
      onUpdateOrderStatus(rejectOrderId, 'CANCELLED', rejectReason);
      setRejectOrderId(null);
    }
  };

  // Helper to format order date and time in unified 24h format
  const getFormattedOrderDateTime = React.useCallback((order: Order) => {
    return formatOrderDisplayDateTime(order.createdAt, order.orderDate);
  }, []);

  // Counts
  const pendingCount = orders.filter(o => o.status === 'PENDING').length;
  const processingCount = orders.filter(o => o.status === 'PROCESSING').length;
  const readyCount = orders.filter(o => o.status === 'READY').length;

  return (
    <div className="space-y-5 text-text-primary">
      
      {/* Top Header Card */}
      <div className="bg-bg-card rounded-2xl border border-border-base p-5 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-bg-input border border-[#E8B84B]/40 text-[#E8B84B] flex items-center justify-center shadow-md">
              <ClipboardList className="w-6 h-6 text-[#E8B84B]" />
            </div>
            <div>
              <h1 className="text-xl font-serif font-black text-[#E8B84B]">Bếp Canteen - Điều phối & Xử lý đơn</h1>
              <p className="text-xs text-text-secondary mt-0.5">
                Xác nhận đơn, kiểm tra thời gian lấy món và cập nhật trạng thái ra khay
              </p>
            </div>
          </div>
        </div>

        {/* Live Auto-Refresh indicator */}
        <div className="flex items-center gap-3 self-end md:self-center">
          <div className="flex items-center gap-2 text-xs bg-bg-primary border border-border-base px-3 py-1.5 rounded-xl">
            <div className={`w-2 h-2 rounded-full ${autoRefresh ? 'bg-emerald-400 animate-pulse' : 'bg-text-secondary'}`} />
            <span className="text-text-secondary font-medium">
              Tự làm mới: <strong className="text-[#E8B84B] font-mono">{countdown}s</strong>
            </span>
            <button
              onClick={() => setAutoRefresh(!autoRefresh)}
              className="text-[11px] text-[#E8B84B] hover:underline font-bold ml-1 cursor-pointer"
            >
              {autoRefresh ? 'Tạm dừng' : 'Bật lại'}
            </button>
          </div>

          <button
            onClick={() => {
              setCountdown(30);
              if (onRefreshOrders) onRefreshOrders();
            }}
            className="p-2.5 rounded-xl border border-border-base bg-bg-primary hover:bg-bg-input text-text-secondary hover:text-[#E8B84B] transition-colors cursor-pointer"
            title="Làm mới ngay"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* KPI mini counter tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <button
          onClick={() => setSelectedStatus('PENDING')}
          className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
            selectedStatus === 'PENDING'
              ? 'border-[#E8B84B] bg-bg-primary shadow-[0_0_20px_rgba(232,184,75,0.2)]'
              : 'border-border-base bg-bg-card hover:border-[#E8B84B]/50'
          }`}
        >
          <span className="text-xs font-bold text-[#E8B84B]">Chờ duyệt (PENDING)</span>
          <div className="text-3xl font-serif font-black text-[#E8B84B] mt-1">{pendingCount}</div>
        </button>

        <button
          onClick={() => setSelectedStatus('PROCESSING')}
          className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
            selectedStatus === 'PROCESSING'
              ? 'border-orange-500 bg-bg-primary shadow-md shadow-orange-500/20'
              : 'border-border-base bg-bg-card hover:border-border-base'
          }`}
        >
          <span className="text-xs font-bold text-orange-400">Đang nấu / Ra khay</span>
          <div className="text-3xl font-serif font-black text-orange-400 mt-1">{processingCount}</div>
        </button>

        <button
          onClick={() => setSelectedStatus('READY')}
          className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
            selectedStatus === 'READY'
              ? 'border-blue-500 bg-bg-primary shadow-md shadow-blue-500/20'
              : 'border-border-base bg-bg-card hover:border-border-base'
          }`}
        >
          <span className="text-xs font-bold text-blue-400">Sẵn sàng nhận</span>
          <div className="text-3xl font-serif font-black text-blue-400 mt-1">{readyCount}</div>
        </button>

        <button
          onClick={() => setSelectedStatus('ALL')}
          className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
            selectedStatus === 'ALL'
              ? 'border-[#E8B84B] bg-[#E8B84B] text-black shadow-lg'
              : 'border-border-base bg-bg-card hover:border-border-base text-text-primary'
          }`}
        >
          <span className={`text-xs font-bold ${selectedStatus === 'ALL' ? 'text-black' : 'text-text-secondary'}`}>Tất cả đơn</span>
          <div className={`text-3xl font-serif font-black mt-1 ${selectedStatus === 'ALL' ? 'text-black' : 'text-text-primary'}`}>{orders.length}</div>
        </button>
      </div>

      {/* Filter and Search */}
      <div className="bg-bg-card rounded-2xl border border-border-base p-3.5 shadow-md flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-text-secondary absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm theo mã đơn, tên khách, SĐT..."
            className="w-full pl-10 pr-3 py-2 text-xs rounded-xl border border-border-base bg-bg-primary text-text-primary focus:outline-none focus:border-[#E8B84B] placeholder:text-text-secondary"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto text-xs no-scrollbar">
          {['ALL', 'PENDING', 'PROCESSING', 'READY', 'DELIVERED', 'CANCELLED'].map((st) => (
            <button
              key={st}
              onClick={() => setSelectedStatus(st)}
              className={`px-3.5 py-1.5 rounded-xl whitespace-nowrap font-bold transition-colors cursor-pointer ${
                selectedStatus === st
                  ? 'bg-[#E8B84B] text-black shadow-sm'
                  : 'bg-bg-primary text-text-secondary hover:text-text-primary border border-border-base'
              }`}
            >
              {st === 'ALL' ? 'Tất cả' : st === 'PENDING' ? 'Chờ duyệt' : st === 'PROCESSING' ? 'Đang nấu' : st === 'READY' ? 'Sẵn sàng' : st === 'DELIVERED' ? 'Đã giao' : 'Đã hủy'}
            </button>
          ))}
        </div>
      </div>

      {/* Order Cards List */}
      <div className="space-y-3">
        {filteredOrders.length === 0 ? (
          <div className="p-12 text-center bg-bg-card rounded-2xl border border-dashed border-border-base">
            <ClipboardList className="w-10 h-10 text-text-secondary mx-auto mb-2" />
            <p className="text-sm font-bold text-text-primary">Không có đơn hàng nào trong danh mục này</p>
            <p className="text-xs text-text-secondary mt-1">Các đơn đặt từ khách hàng sẽ xuất hiện tự động tại đây.</p>
          </div>
        ) : (
          filteredOrders.map((order) => (
            <div
              id={`order-${order.id}`}
              key={order.id}
              className="bg-bg-card rounded-2xl border border-border-base hover:border-border-base hover:bg-bg-input shadow-lg p-4 sm:p-5 transition-all"
            >
              {/* HÀNG 1: Header (flex justify-between) */}
              <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-border-base">
                
                {/* BÊN TRÁI: Badges + In đơn + Thông tin đơn */}
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono text-sm font-black text-[#E8B84B] bg-bg-primary px-2.5 py-1 rounded-xl border border-[#E8B84B]/30 whitespace-nowrap">
                    #{order.orderCode}
                  </span>
                  {getStatusBadge(order.status)}
                  <PaymentBadge status={order.payment?.status || (order.paymentStatus === 'PAID' ? 'paid' : 'unpaid')} size="sm" />
                  <button
                    type="button"
                    onClick={() => setSelectedOrderForPrint(order)}
                    className="px-2.5 py-1 rounded-xl bg-bg-primary hover:bg-bg-input text-[#E8B84B] hover:text-[#F4C95D] border border-[#E8B84B]/40 hover:border-[#E8B84B] text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs whitespace-nowrap"
                    title="Xem và in hóa đơn giấy ngay tại quầy"
                  >
                    <Printer className="w-3.5 h-3.5 text-[#E8B84B]" />
                    <span>In đơn</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setInfoModal(order)}
                    className="px-2.5 py-1 rounded-xl bg-bg-primary hover:bg-bg-input text-[#E8B84B] hover:text-[#F4C95D] border border-[#E8B84B]/40 hover:border-[#E8B84B] text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs whitespace-nowrap"
                    title="Xem lịch sử tiến trình & thông tin đơn"
                  >
                    <Info className="w-3.5 h-3.5 text-[#E8B84B]" />
                    <span>Thông tin đơn</span>
                  </button>
                </div>

                {/* BÊN PHẢI: Info chips - CHỈ GIỮ 2 CHIP: Khu vực + Giờ nhận */}
                <div className="flex flex-wrap items-center gap-2">
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-bg-primary border border-border-base text-text-secondary text-xs whitespace-nowrap">
                    <MapPin className="w-3.5 h-3.5 text-[#E8B84B] flex-shrink-0" />
                    <span>Khu vực: <strong className="text-text-primary">{order.pickupArea}</strong></span>
                  </div>

                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-bg-primary border border-[#E8B84B]/40 text-[#E8B84B] font-bold text-xs whitespace-nowrap">
                    <Clock className="w-3.5 h-3.5 text-[#E8B84B] flex-shrink-0" />
                    <span>Giờ nhận: <strong className="font-mono">{normalizeTimeString24h(order.pickupTime)}</strong></span>
                  </div>
                </div>

              </div>

              {/* HÀNG 2: Đặt lúc */}
              <div className="text-xs text-text-secondary pt-2.5">
                Đặt lúc: <strong className="text-text-primary font-mono">{getFormattedOrderDateTime(order)}</strong>
              </div>

              {/* HÀNG 3: Khách hàng + SĐT */}
              <div className="flex items-center gap-2 text-xs text-text-primary font-bold pt-1 pb-1">
                <span className="text-sm">{order.receiverName}</span>
                <span className="text-text-secondary font-normal flex items-center gap-1 ml-1">
                  <Phone className="w-3.5 h-3.5 text-[#E8B84B]" />
                  {order.phone}
                </span>
              </div>

              {/* Items in Order */}
              <div className="py-3 space-y-2">
                <div className="text-[11px] font-extrabold text-text-secondary uppercase tracking-wider">
                  Món ăn yêu cầu ({order.items.length} món)
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="p-2.5 rounded-xl bg-bg-primary border border-border-base text-xs">
                      <div className="flex justify-between items-start">
                        <span className="font-bold text-text-primary">
                          {item.quantity}x {item.itemName}
                        </span>
                        <span className="text-[#E8B84B] font-mono font-bold">
                          {(item.unitPrice * item.quantity).toLocaleString()}đ
                        </span>
                      </div>
                      {item.isCombo && item.comboDetails && (
                        <div className="mt-1 text-[10px] text-text-secondary space-y-0.5">
                          {item.comboDetails.map((cd, cidx) => (
                            <div key={cidx}>• {cd}</div>
                          ))}
                        </div>
                      )}
                      {item.note && (
                        <div className="text-[10px] text-[#E8B84B] font-medium mt-1 bg-bg-input px-2 py-0.5 rounded border border-border-base">
                          Ghi chú: {item.note}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Bar */}
              <div className="pt-3 border-t border-border-base flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="text-xs text-text-secondary flex items-center gap-2">
                  <span>Tổng thu: <strong className="text-base text-[#E8B84B] font-extrabold font-mono">{order.finalAmount.toLocaleString('vi-VN')}₫</strong></span>
                  <span className="text-border-base">•</span>
                  <span className="font-medium">
                    {order.paymentMethod === 'COD' ? 'Tiền mặt tại quầy' : 'Chuyển khoản (Đã thanh toán)'}
                  </span>
                  {order.status === 'CANCELLED' && order.cancelReason && (
                    <span className="text-rose-400 bg-rose-950/60 border border-rose-500/40 px-2 py-0.5 rounded text-[11px]">
                      Lý do hủy: {order.cancelReason}
                    </span>
                  )}
                  {order.feedback && (
                    <div className="flex items-center gap-1.5 bg-bg-primary text-[#E8B84B] border border-border-base px-2.5 py-1 rounded-xl text-xs font-bold">
                      <Star className="w-3.5 h-3.5 fill-[#E8B84B] text-[#E8B84B] flex-shrink-0" />
                      <span>{order.rating || 5}/5⭐: "{order.feedback}"</span>
                    </div>
                  )}
                </div>

                {/* Operations */}
                <div className="flex items-center gap-2 self-end sm:self-center flex-wrap">

                  {/* PENDING -> Approve (PROCESSING) or Reject (CANCELLED) */}
                  {order.status === 'PENDING' && (() => {
                    const paymentStatus = (order.payment?.status || (order.paymentStatus === 'PAID' ? 'paid' : 'pending_confirm')).toLowerCase();
                    const canProcess = paymentStatus === 'paid';
                    return (
                      <>
                        <button
                          onClick={() => setRejectOrderId(order.id)}
                          className="px-3 py-1.5 rounded-xl border border-rose-500/60 text-rose-400 hover:bg-rose-950/50 text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer"
                        >
                          <X className="w-3.5 h-3.5" />
                          <span>Từ chối</span>
                        </button>

                        {canProcess ? (
                          <button
                            onClick={() => onUpdateOrderStatus(order.id, 'PROCESSING', 'Bếp đã tiếp nhận đơn')}
                            className="px-4 py-1.5 rounded-xl text-xs font-extrabold bg-[#E8B84B] hover:bg-[#F4C95D] text-black cursor-pointer shadow-md transition-all flex items-center gap-1"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>✓ Duyệt & Nấu món</span>
                          </button>
                        ) : (
                          <div className="bg-orange-500/15 border border-orange-500/30 text-[#FB923C] font-bold px-3.5 py-1.5 rounded-xl flex items-center gap-1.5 text-xs select-none cursor-not-allowed">
                            <span>⏳ Chờ xác nhận thanh toán</span>
                          </div>
                        )}
                      </>
                    );
                  })()}

                  {/* PROCESSING -> Mark READY */}
                  {order.status === 'PROCESSING' && (() => {
                    const paymentStatus = (order.payment?.status || (order.paymentStatus === 'PAID' ? 'paid' : 'pending_confirm')).toLowerCase();
                    const canProcess = paymentStatus === 'paid';
                    return (
                      canProcess ? (
                        <button
                          onClick={() => onUpdateOrderStatus(order.id, 'READY', 'Món đã ra khay sẵn sàng')}
                          className="px-4 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-extrabold transition-all flex items-center gap-1.5 cursor-pointer shadow-md"
                        >
                          <CheckCheck className="w-4 h-4" />
                          <span>Món đã ra khay (Sẵn sàng)</span>
                        </button>
                      ) : (
                        <div className="bg-orange-500/15 border border-orange-500/30 text-[#FB923C] font-bold px-3.5 py-1.5 rounded-xl flex items-center gap-1.5 text-xs select-none cursor-not-allowed">
                          <span>⏳ Chờ xác nhận thanh toán</span>
                        </div>
                      )
                    );
                  })()}

                  {/* READY -> Mark DELIVERED */}
                  {order.status === 'READY' && (() => {
                    const paymentStatus = (order.payment?.status || (order.paymentStatus === 'PAID' ? 'paid' : 'pending_confirm')).toLowerCase();
                    const canProcess = paymentStatus === 'paid';
                    return (
                      canProcess ? (
                        <button
                          onClick={() => onUpdateOrderStatus(order.id, 'DELIVERED', 'Khách hàng đã nhận món tại quầy')}
                          className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-extrabold transition-all flex items-center gap-1.5 cursor-pointer shadow-md"
                        >
                          <Check className="w-4 h-4 text-emerald-200" />
                          <span>Đã giao khách</span>
                        </button>
                      ) : (
                        <div className="bg-orange-500/15 border border-orange-500/30 text-[#FB923C] font-bold px-3.5 py-1.5 rounded-xl flex items-center gap-1.5 text-xs select-none cursor-not-allowed">
                          <span>⏳ Chờ xác nhận thanh toán</span>
                        </div>
                      )
                    );
                  })()}

                  {/* If DELIVERED or CANCELLED */}
                  {(order.status === 'DELIVERED' || order.status === 'CANCELLED') && (
                    <span className="text-xs text-text-secondary italic">Đơn đã hoàn tất lưu trữ</span>
                  )}

                </div>

              </div>

            </div>
          ))
        )}
      </div>

      {/* Reject Modal */}
      {rejectOrderId !== null && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-bg-card rounded-2xl p-5 max-w-sm w-full shadow-2xl border border-border-base space-y-4">
            <h3 className="font-serif font-extrabold text-sm text-[#E8B84B]">Xác nhận từ chối đơn hàng</h3>
            <p className="text-xs text-text-secondary">
              Đơn hàng sẽ được chuyển thành ĐÃ HỦY và hoàn lại số lượng tồn kho tự động.
            </p>

            <div>
              <label className="text-xs font-semibold text-text-secondary block mb-1">
                Lý do từ chối:
              </label>
              <select
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                className="w-full text-xs p-2.5 rounded-xl border border-border-base bg-bg-primary text-text-primary focus:outline-none focus:border-[#E8B84B]"
              >
                <option value="Hết nguyên liệu tại bếp">Hết nguyên liệu tại bếp</option>
                <option value="Canteen quá tải khung giờ này">Canteen quá tải khung giờ này</option>
                <option value="Sai thông tin liên hệ / không liên lạc được">Sai thông tin liên hệ / không liên lạc được</option>
                <option value="Khách yêu cầu hủy đơn">Khách yêu cầu hủy đơn</option>
              </select>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setRejectOrderId(null)}
                className="px-3.5 py-2 rounded-xl border border-border-base text-xs font-semibold text-text-secondary hover:bg-bg-input cursor-pointer"
              >
                Hủy bỏ
              </button>
              <button
                onClick={handleConfirmReject}
                className="px-4 py-2 rounded-xl bg-rose-600 text-white text-xs font-extrabold hover:bg-rose-500 cursor-pointer"
              >
                Xác nhận từ chối
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Print Receipt Modal */}
      <OrderPrintModal
        order={selectedOrderForPrint}
        onClose={() => setSelectedOrderForPrint(null)}
      />

      {/* Modal Thông tin đơn */}
      {infoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
          <div className="bg-bg-card border border-[#E8B84B]/40 rounded-2xl w-full max-w-[500px] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="p-4 border-b border-border-base flex items-center justify-between bg-bg-elevated">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#E8B84B]/10 border border-[#E8B84B]/30 flex items-center justify-center text-[#E8B84B]">
                  <ClipboardList className="w-4 h-4 text-[#E8B84B]" />
                </div>
                <div>
                  <h3 className="font-serif font-black text-sm text-[#E8B84B]">
                    Thông tin đơn #{infoModal.orderCode}
                  </h3>
                  <p className="text-[11px] text-text-secondary">
                    Khách hàng: <strong className="text-text-primary">{infoModal.receiverName}</strong> - {infoModal.phone}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setInfoModal(null)}
                className="p-1.5 rounded-lg border border-border-base text-text-secondary hover:text-text-primary hover:bg-bg-elevated cursor-pointer transition-colors"
                title="Đóng"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Nội dung - Timeline dạng dọc */}
            <div className="p-5 max-h-[70vh] overflow-y-auto">
              <OrderTimeline order={infoModal} />
            </div>

            {/* Footer */}
            <div className="p-3 bg-bg-primary border-t border-border-base flex justify-end">
              <button
                type="button"
                onClick={() => setInfoModal(null)}
                className="px-4 py-1.5 rounded-xl bg-bg-input hover:bg-bg-elevated text-xs font-bold text-[#E8B84B] border border-[#E8B84B]/30 hover:border-[#E8B84B] cursor-pointer transition-all"
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
